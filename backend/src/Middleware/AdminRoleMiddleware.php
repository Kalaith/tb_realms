<?php

declare(strict_types=1);

namespace App\Middleware;

use App\Http\Request;
use App\Http\Response;

final class AdminRoleMiddleware
{
    public function __invoke(Request $request, Response $response, array $routeParams = []): Response|Request|bool
    {
        $authUser = $request->getAttribute('auth_user', []);
        if (!is_array($authUser) || !$this->isAdmin($authUser)) {
            $response->getBody()->write(json_encode([
                'success' => false,
                'error' => 'Forbidden',
                'message' => 'Admin role required',
            ], JSON_THROW_ON_ERROR));

            return $response
                ->withStatus(403)
                ->withHeader('Content-Type', 'application/json');
        }

        return true;
    }

    /**
     * @param array<string, mixed> $authUser
     */
    private function isAdmin(array $authUser): bool
    {
        $role = strtolower((string) ($authUser['role'] ?? ''));
        if ($role === 'admin') {
            return true;
        }

        $roles = $authUser['roles'] ?? [];
        if (!is_array($roles)) {
            return false;
        }

        return in_array('admin', array_map(static fn($value): string => strtolower((string) $value), $roles), true);
    }
}
