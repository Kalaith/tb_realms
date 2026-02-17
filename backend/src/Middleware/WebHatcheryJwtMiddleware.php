<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Http\Response;
use App\Http\Request;
use App\Models\User;
use Illuminate\Database\Capsule\Manager as Capsule;

class WebHatcheryJwtMiddleware
{
    public function __invoke(Request $request, Response $response, array $routeParams = []): Response|Request|bool
    {
        $authHeader = $request->getHeaderLine('Authorization');
        $token = '';

        if ($authHeader && preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
            $token = trim((string) $matches[1]);
        } else {
            $queryParams = $request->getQueryParams();
            if (isset($queryParams['token']) && is_string($queryParams['token'])) {
                $token = trim($queryParams['token']);
            }
        }

        // Normalize common malformed values.
        if (stripos($token, 'Bearer ') === 0) {
            $token = trim(substr($token, 7));
        }
        $token = trim($token, " \t\n\r\0\x0B\"'");

        if ($token === '') {
            return $this->unauthorized($response, 'Authorization header missing or invalid');
        }

        $secret = $_ENV['JWT_SECRET']
            ?? $_SERVER['JWT_SECRET']
            ?? getenv('JWT_SECRET')
            ?: '';
        if ($secret === '') {
            return $this->unauthorized($response, 'JWT secret not configured');
        }

        try {
            // Match Mytherra behavior: trust Web Hatchery sessions with lenient expiry window.
            JWT::$leeway = 31536000;
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            $externalUserId = $decoded->sub ?? $decoded->user_id ?? null;
            if (!$externalUserId) {
                return $this->unauthorized($response, 'Token missing user identifier');
            }

            $localUser = $this->resolveOrCreateLocalUser($decoded, (string) $externalUserId);

            $authUser = [
                'id' => (int) $localUser->id,
                'external_id' => (string) $externalUserId,
                'email' => $decoded->email ?? null,
                'username' => $localUser->username,
                'roles' => $decoded->roles ?? [],
            ];

            $request = $request->withAttribute('auth_user', $authUser);
            $request = $request->withAttribute('user_id', (int) $localUser->id);

            return $request;
        } catch (\Exception $e) {
            error_log('WebHatcheryJwtMiddleware decode failed: ' . $e->getMessage());
            return $this->unauthorized($response, 'Invalid token: ' . $e->getMessage());
        }
    }

    private function resolveOrCreateLocalUser(object $decoded, string $externalUserId): User
    {
        $email = isset($decoded->email) && is_string($decoded->email) ? trim($decoded->email) : '';
        $tokenUsername = isset($decoded->username) && is_string($decoded->username) ? trim($decoded->username) : '';

        $user = null;
        if ($email !== '') {
            $user = User::where('email', $email)->first();
        }
        if (!$user && $tokenUsername !== '') {
            $user = User::where('username', $tokenUsername)->first();
        }
        if (!$user && ctype_digit($externalUserId)) {
            $user = User::find((int) $externalUserId);
        }

        if ($user) {
            $columns = $this->getUserColumns();
            $updates = [];
            if (isset($columns['email']) && $email !== '' && $user->email !== $email) {
                $updates['email'] = $email;
            }
            if (isset($columns['username']) && $tokenUsername !== '' && $user->username !== $tokenUsername && !User::where('username', $tokenUsername)->where('id', '!=', $user->id)->exists()) {
                $updates['username'] = $tokenUsername;
                if (isset($columns['display_name']) && empty($user->display_name)) {
                    $updates['display_name'] = $tokenUsername;
                }
            }
            if (isset($columns['last_login_at'])) {
                $updates['last_login_at'] = date('Y-m-d H:i:s');
            }

            if (!empty($updates)) {
                $user->update($updates);
                $user->refresh();
            }

            return $user;
        }

        $baseUsername = $tokenUsername !== '' ? $tokenUsername : 'wh_user_' . preg_replace('/[^a-zA-Z0-9_]/', '', $externalUserId);
        if ($baseUsername === '') {
            $baseUsername = 'wh_user_' . time();
        }
        $username = $baseUsername;
        $counter = 1;
        while (User::where('username', $username)->exists()) {
            $counter++;
            $username = $baseUsername . '_' . $counter;
        }

        $resolvedEmail = $email !== '' ? $email : $username . '@local.webhatchery';

        $columns = $this->getUserColumns();
        $createData = [];

        if (isset($columns['email'])) {
            $createData['email'] = $resolvedEmail;
        }
        if (isset($columns['username'])) {
            $createData['username'] = $username;
        }
        if (isset($columns['password'])) {
            $createData['password'] = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
        }
        if (isset($columns['display_name'])) {
            $createData['display_name'] = $tokenUsername !== '' ? $tokenUsername : $username;
        }
        if (isset($columns['starting_balance'])) {
            $createData['starting_balance'] = 10000.00;
        }
        if (isset($columns['is_active'])) {
            $createData['is_active'] = true;
        }
        if (isset($columns['last_login_at'])) {
            $createData['last_login_at'] = date('Y-m-d H:i:s');
        }

        $created = User::create($createData);

        error_log('WebHatcheryJwtMiddleware created local user id=' . $created->id . ' external_id=' . $externalUserId);

        return $created;
    }

    private function getUserColumns(): array
    {
        $columns = Capsule::schema()->getColumnListing('users');
        return array_fill_keys($columns, true);
    }

    private function unauthorized(Response $response, string $message): Response
    {
        $loginUrl = $_ENV['LOGIN_URL'] ?? '';
        $payload = [
            'success' => false,
            'error' => 'Authentication required',
            'message' => $message,
            'login_url' => $loginUrl
        ];
        $response->getBody()->write(json_encode($payload));
        return $response
            ->withStatus(401)
            ->withHeader('Content-Type', 'application/json');
    }
}
