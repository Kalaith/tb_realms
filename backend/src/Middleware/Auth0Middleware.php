<?php

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\JWTExceptionWithPayloadInterface;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;
use App\Models\User;

class Auth0Middleware implements MiddlewareInterface
{
    private string $auth0Domain;
    private string $auth0Audience;

    public function __construct()
    {
        $this->auth0Domain = $_ENV['AUTH0_DOMAIN'] ?? '';
        $this->auth0Audience = $_ENV['AUTH0_AUDIENCE'] ?? '';

        if (!$this->auth0Domain || !$this->auth0Audience) {
            throw new \Exception('AUTH0_DOMAIN and AUTH0_AUDIENCE must be set in environment variables');
        }
    }

    public function process(Request $request, RequestHandlerInterface $handler): Response
    {
        // Get Authorization header
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return $this->createUnauthorizedResponse('Authorization header missing or invalid');
        }

        $token = substr($authHeader, 7); // Remove "Bearer " prefix

        try {
            // Validate the JWT token
            $decoded = $this->validateAuth0Token($token);
            
            // Add Auth0 user info to request
            $request = $request->withAttribute('auth0_user', $decoded);
            
            // Try to find/create user in our database
            $user = $this->getOrCreateUser($decoded);
            if ($user) {
                $request = $request->withAttribute('user', $user);
                $request = $request->withAttribute('user_id', $user['id']);
                $request = $request->withAttribute('user_email', $user['email']);
                $request = $request->withAttribute('user_role', $user['role'] ?? 'player');
            }

            return $handler->handle($request);

        } catch (\Exception $e) {
            error_log("Auth0 Middleware Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
            return $this->createUnauthorizedResponse('Token validation failed: ' . $e->getMessage());
        }
    }

    private function validateAuth0Token(string $token): object
    {
        // Use Auth0's userinfo endpoint to validate the token
        $userinfoUrl = "https://{$this->auth0Domain}/userinfo";
        
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "Authorization: Bearer {$token}\r\nContent-Type: application/json\r\n",
                'timeout' => 10
            ]
        ]);
        
        $response = @file_get_contents($userinfoUrl, false, $context);
        if ($response === false) {
            $error = error_get_last();
            throw new \Exception('Failed to validate token with Auth0: ' . ($error['message'] ?? 'Unknown error'));
        }
        
        $userInfo = json_decode($response, true);
        if (!$userInfo || !isset($userInfo['sub'])) {
            throw new \Exception('Invalid token or user info');
        }
        
        // Convert userinfo response to match JWT structure
        return (object) [
            'sub' => $userInfo['sub'],
            'email' => $userInfo['email'] ?? '',
            'name' => $userInfo['name'] ?? $userInfo['email'] ?? '',
            'nickname' => $userInfo['nickname'] ?? explode('@', $userInfo['email'] ?? 'user')[0],
            'given_name' => $userInfo['given_name'] ?? '',
            'family_name' => $userInfo['family_name'] ?? '',
            'picture' => $userInfo['picture'] ?? '',
            'email_verified' => $userInfo['email_verified'] ?? false,
            'aud' => $this->auth0Audience,
            'iss' => "https://{$this->auth0Domain}/"
        ];
    }

    private function getOrCreateUser(object $auth0User): ?array
    {
        try {
            // Try to find existing user by Auth0 ID
            $user = User::where('auth0_id', $auth0User->sub)->first();
            
            if (!$user) {
                // Create new user with TB Realms defaults
                $user = User::create([
                    'auth0_id' => $auth0User->sub,
                    'email' => $auth0User->email ?? '',
                    'username' => $auth0User->nickname ?? explode('@', $auth0User->email ?? 'user')[0],
                    'first_name' => $auth0User->given_name ?? '',
                    'last_name' => $auth0User->family_name ?? '',
                    'display_name' => $auth0User->name ?? $auth0User->nickname ?? 'Player',
                    'role' => 'player', // Default role for TB Realms
                    'is_active' => true,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
            } else {
                // Update existing user with latest Auth0 data
                $user->update([
                    'email' => $auth0User->email ?? $user->email,
                    'username' => $auth0User->nickname ?? $user->username,
                    'first_name' => $auth0User->given_name ?? $user->first_name,
                    'last_name' => $auth0User->family_name ?? $user->last_name,
                    'display_name' => $auth0User->name ?? $user->display_name,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
            }
            
            return $user->toArray();
            
        } catch (\Exception $e) {
            error_log("Error getting/creating user: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
            error_log("Stack trace: " . $e->getTraceAsString());
            return null;
        }
    }

    private function createUnauthorizedResponse(string $message = 'Unauthorized'): Response
    {
        $response = new \Slim\Psr7\Response();
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $message,
            'error' => 'Authentication required'
        ]));
        
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(401);
    }
}