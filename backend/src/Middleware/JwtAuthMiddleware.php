<?php

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\SignatureInvalidException;
use App\External\UserRepository;

/**
 * JWT Authentication Middleware
 * Following Mytherra patterns for authentication
 */
class JwtAuthMiddleware implements MiddlewareInterface
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    public function process(Request $request, RequestHandler $handler): Response
    {
        // Get Authorization header
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (empty($authHeader)) {
            return $this->unauthorizedResponse('Authorization header missing');
        }

        // Extract token from "Bearer <token>" format
        if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $this->unauthorizedResponse('Invalid authorization header format');
        }

        $token = $matches[1];
        
        // Log the received token for debugging
        error_log('JWT Middleware received token: ' . substr($token, 0, 50) . '...');

        try {
            // Decode JWT token
            $jwtSecret = $_ENV['JWT_SECRET'] ?? 'your_jwt_secret_key_here';
            error_log('JWT Secret being used: ' . substr($jwtSecret, 0, 10) . '...');
            
            $decoded = JWT::decode($token, new Key($jwtSecret, 'HS256'));
            error_log('JWT Token decoded successfully for user_id: ' . ($decoded->user_id ?? 'unknown'));

            // Extract user information from token
            $userId = $decoded->user_id ?? null;
            $role = $decoded->role ?? 'user';

            if (!$userId) {
                return $this->unauthorizedResponse('Invalid token: missing user_id');
            }

            // Verify user still exists and is active
            $user = $this->userRepository->findById($userId);
            if (!$user || !$user->is_active) {
                return $this->unauthorizedResponse('User not found or inactive');
            }

            // Add user info to request attributes
            $request = $request->withAttribute('user_id', $userId);
            $request = $request->withAttribute('user_role', $role);
            $request = $request->withAttribute('user', $user);

            // Continue with request
            return $handler->handle($request);

        } catch (ExpiredException $e) {
            error_log('JWT expired: ' . $e->getMessage());
            return $this->unauthorizedResponse('Token expired');
        } catch (SignatureInvalidException $e) {
            error_log('JWT signature invalid: ' . $e->getMessage());
            return $this->unauthorizedResponse('Invalid token signature');
        } catch (\Exception $e) {
            error_log('JWT Auth Error: ' . $e->getMessage() . ' | Token: ' . substr($token, 0, 50) . '...');
            return $this->unauthorizedResponse('Token validation failed');
        }
    }

    private function unauthorizedResponse(string $message): Response
    {
        $response = new \Nyholm\Psr7\Response();
        $response->getBody()->write(json_encode([
            'success' => false,
            'message' => $message
        ]));
        
        return $response
            ->withStatus(401)
            ->withHeader('Content-Type', 'application/json');
    }
}
