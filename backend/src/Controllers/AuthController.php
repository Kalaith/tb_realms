<?php

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\Models\User;
use Firebase\JWT\JWT;
use Illuminate\Database\Capsule\Manager as Capsule;

class AuthController
{
    public static function session(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('auth_user');
        if (!$authUser || empty($authUser['id'])) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => 'Authentication required',
                'message' => 'Unauthorized',
                'login_url' => $_ENV['LOGIN_URL'] ?? ''
            ]));
            return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
        }

        $payload = [
            'success' => true,
            'data' => [
                'user' => [
                    'id' => (string) $authUser['id'],
                    'email' => $authUser['email'] ?? null,
                    'username' => $authUser['username'] ?? null,
                    'display_name' => $authUser['display_name'] ?? ($authUser['username'] ?? null),
                    'roles' => $authUser['roles'] ?? [],
                    'role' => $authUser['role'] ?? 'player',
                    'is_guest' => (bool) ($authUser['is_guest'] ?? false),
                    'auth_type' => $authUser['auth_type'] ?? 'frontpage',
                    'guest_user_id' => $authUser['guest_user_id'] ?? null,
                ]
            ]
        ];

        $response->getBody()->write(json_encode($payload));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public static function currentUser(Request $request, Response $response): Response
    {
        return self::session($request, $response);
    }

    public static function createGuestSession(Request $request, Response $response): Response
    {
        $jwtSecret = trim((string) ($_ENV['JWT_SECRET'] ?? $_SERVER['JWT_SECRET'] ?? getenv('JWT_SECRET') ?: ''));
        if ($jwtSecret === '') {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Guest session is unavailable',
                'error' => 'JWT secret is not configured',
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }

        $guestExternalId = 'guest_' . bin2hex(random_bytes(16));
        $guestUser = self::findOrCreateGuestUser($guestExternalId);
        $now = time();

        $claims = [
            'iss' => $_ENV['JWT_ISSUER'] ?? 'webhatchery',
            'aud' => $_ENV['JWT_AUDIENCE'] ?? ($_ENV['APP_URL'] ?? 'tradeborn-realms-app'),
            'iat' => $now,
            'nbf' => $now - 5,
            'exp' => $now + (60 * 60 * 24 * 365),
            'jti' => bin2hex(random_bytes(16)),
            'sub' => $guestExternalId,
            'user_id' => $guestExternalId,
            'username' => $guestUser->username,
            'display_name' => $guestUser->display_name ?: $guestUser->username,
            'email' => '',
            'role' => 'guest',
            'auth_type' => 'guest',
            'is_guest' => true,
        ];

        $token = JWT::encode($claims, $jwtSecret, 'HS256');

        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Guest session created',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => (string) $guestUser->id,
                    'email' => '',
                    'username' => $guestUser->username,
                    'display_name' => $guestUser->display_name ?: $guestUser->username,
                    'role' => 'guest',
                    'roles' => ['guest'],
                    'is_guest' => true,
                    'auth_type' => 'guest',
                    'guest_user_id' => $guestExternalId,
                ],
            ],
        ]));

        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    }

    public static function linkGuestAccount(Request $request, Response $response): Response
    {
        $authUser = $request->getAttribute('auth_user');
        if (!$authUser || empty($authUser['id'])) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'User not authenticated',
                'error' => 'Authentication required',
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        $currentUserId = (int) $authUser['id'];
        $currentRole = trim((string) ($authUser['role'] ?? 'player'));
        $isCurrentGuest = (bool) ($authUser['is_guest'] ?? false) || $currentRole === 'guest';

        if ($currentRole === 'admin') {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Guest linking is disabled for admin accounts',
                'error' => 'Guest and admin accounts cannot be linked',
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(403);
        }

        if ($isCurrentGuest) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Linking requires a signed-in non-guest account',
                'error' => 'Guest destination is not allowed',
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $payload = $request->getParsedBody();
        if (!is_array($payload)) {
            $payload = json_decode((string) $request->getBody(), true);
        }

        $guestUserId = trim((string) ($payload['guest_user_id'] ?? ''));
        if ($guestUserId === '' || !str_starts_with($guestUserId, 'guest_')) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'guest_user_id must be a guest account id',
                'error' => 'Invalid guest_user_id',
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $guestUser = User::where('auth0_id', $guestUserId)->first();
        if (!$guestUser) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'Guest account not found',
                'error' => 'Invalid guest_user_id',
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        if ((int) $guestUser->id === $currentUserId) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'message' => 'guest_user_id cannot match current user id',
                'error' => 'Invalid transfer request',
            ]));

            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $movedByTable = [
            'portfolios' => 0,
            'transactions' => 0,
            'watchlists' => 0,
            'user_settings' => 0,
            'user_achievements' => 0,
            'users' => 0,
        ];

        Capsule::connection()->transaction(function () use ($guestUser, $currentUserId, &$movedByTable): void {
            $guestPortfolio = Capsule::table('portfolios')->where('user_id', $guestUser->id)->first();
            $currentPortfolio = Capsule::table('portfolios')->where('user_id', $currentUserId)->first();

            if ($guestPortfolio && !$currentPortfolio) {
                $movedByTable['portfolios'] += Capsule::table('portfolios')
                    ->where('id', $guestPortfolio->id)
                    ->update(['user_id' => $currentUserId]);
                $currentPortfolio = Capsule::table('portfolios')->where('user_id', $currentUserId)->first();
            } elseif ($guestPortfolio && $currentPortfolio) {
                $transactionMoveCount = Capsule::table('transactions')
                    ->where('portfolio_id', $guestPortfolio->id)
                    ->update([
                        'user_id' => $currentUserId,
                        'portfolio_id' => $currentPortfolio->id,
                    ]);
                $movedByTable['transactions'] += $transactionMoveCount;

                $currentPortfolioValues = (array) $currentPortfolio;
                $guestPortfolioValues = (array) $guestPortfolio;
                $portfolioUpdates = [];
                foreach (['cash_balance', 'total_value', 'total_invested', 'total_profit_loss'] as $column) {
                    if (array_key_exists($column, $currentPortfolioValues) && array_key_exists($column, $guestPortfolioValues)) {
                        $portfolioUpdates[$column] = (float) $currentPortfolioValues[$column] + (float) $guestPortfolioValues[$column];
                    }
                }
                if (!empty($portfolioUpdates)) {
                    $movedByTable['portfolios'] += Capsule::table('portfolios')
                        ->where('id', $currentPortfolio->id)
                        ->update($portfolioUpdates);
                }

                Capsule::table('portfolios')->where('id', $guestPortfolio->id)->delete();
            }

            if (!$guestPortfolio || !$currentPortfolio) {
                $movedByTable['transactions'] += Capsule::table('transactions')
                    ->where('user_id', $guestUser->id)
                    ->update(['user_id' => $currentUserId]);
            }

            $guestWatchlists = Capsule::table('watchlists')->where('user_id', $guestUser->id)->get();
            foreach ($guestWatchlists as $watchlistItem) {
                $existing = Capsule::table('watchlists')
                    ->where('user_id', $currentUserId)
                    ->where('stock_id', $watchlistItem->stock_id)
                    ->exists();
                if (!$existing) {
                    $item = (array) $watchlistItem;
                    unset($item['id']);
                    $item['user_id'] = $currentUserId;
                    Capsule::table('watchlists')->insert($item);
                    $movedByTable['watchlists']++;
                }
            }
            Capsule::table('watchlists')->where('user_id', $guestUser->id)->delete();

            $guestSettings = Capsule::table('user_settings')->where('user_id', $guestUser->id)->first();
            $currentSettings = Capsule::table('user_settings')->where('user_id', $currentUserId)->first();
            if ($guestSettings && !$currentSettings) {
                $movedByTable['user_settings'] += Capsule::table('user_settings')
                    ->where('user_id', $guestUser->id)
                    ->update(['user_id' => $currentUserId]);
            }

            if (Capsule::schema()->hasTable('user_achievements')) {
                $guestAchievements = Capsule::table('user_achievements')->where('user_id', $guestUser->id)->get();
                foreach ($guestAchievements as $achievement) {
                    $exists = Capsule::table('user_achievements')
                        ->where('user_id', $currentUserId)
                        ->where('achievement_id', $achievement->achievement_id)
                        ->exists();
                    if (!$exists) {
                        $row = (array) $achievement;
                        unset($row['id']);
                        $row['user_id'] = $currentUserId;
                        Capsule::table('user_achievements')->insert($row);
                        $movedByTable['user_achievements']++;
                    }
                }
                Capsule::table('user_achievements')->where('user_id', $guestUser->id)->delete();
            }

            $movedByTable['users'] += $guestUser->delete() ? 1 : 0;
        });

        $totalMoved = array_sum($movedByTable);

        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Guest account data linked successfully',
            'data' => [
                'guest_user_id' => $guestUserId,
                'linked_to_user_id' => (string) $currentUserId,
                'moved_rows_by_table' => $movedByTable,
                'total_moved_rows' => $totalMoved,
            ],
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }

    private static function findOrCreateGuestUser(string $guestExternalId): User
    {
        $existing = User::where('auth0_id', $guestExternalId)->first();
        if ($existing) {
            return $existing;
        }

        $baseUsername = 'guest_' . substr(preg_replace('/[^a-zA-Z0-9]/', '', $guestExternalId), 0, 10);
        $username = $baseUsername;
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $counter++;
            $username = $baseUsername . '_' . $counter;
        }

        $email = $username . '@guest.tradeborn.local';
        while (User::where('email', $email)->exists()) {
            $counter++;
            $email = $baseUsername . '_' . $counter . '@guest.tradeborn.local';
        }

        return User::create([
            'auth0_id' => $guestExternalId,
            'email' => $email,
            'username' => $username,
            'password' => password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT),
            'display_name' => 'Guest Trader',
            'role' => 'player',
            'starting_balance' => 10000.00,
            'is_active' => true,
            'last_login_at' => date('Y-m-d H:i:s'),
        ]);
    }
}
