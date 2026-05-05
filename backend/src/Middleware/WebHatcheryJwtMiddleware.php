<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Core\Database;
use App\Core\Environment;
use App\Http\Request;
use App\Http\Response;
use App\Repositories\UserRepository;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;

final class WebHatcheryJwtMiddleware
{
    public function __invoke(Request $request, Response $response, array $routeParams = []): Response|Request|bool
    {
        $token = $this->readBearerToken($request);
        if ($token === '') {
            return $this->unauthorized($response, 'Authorization header missing or invalid');
        }

        try {
            $decoded = JWT::decode($token, new Key(Environment::required('JWT_SECRET'), 'HS256'));
            $authUser = (new UserRepository(Database::getConnection()))->resolveOrCreateAuthUser($decoded);

            return $request
                ->withAttribute('auth_user', $authUser->toArray())
                ->withAttribute('user_id', $authUser->localUserId);
        } catch (Throwable $error) {
            error_log('WebHatcheryJwtMiddleware failed: ' . $error->getMessage());

            return $this->unauthorized($response, 'Invalid token');
        }
    }

    private function readBearerToken(Request $request): string
    {
        $authHeader = $request->getHeaderLine('Authorization');
        if (preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches) === 1) {
            return trim($matches[1], " \t\n\r\0\x0B\"'");
        }

        return '';
    }

    private function unauthorized(Response $response, string $message): Response
    {
        $response->getBody()->write(json_encode([
            'success' => false,
            'error' => 'Authentication required',
            'message' => $message,
            'login_url' => Environment::required('WEB_HATCHERY_LOGIN_URL'),
        ], JSON_THROW_ON_ERROR));

        return $response
            ->withStatus(401)
            ->withHeader('Content-Type', 'application/json');
    }
}
