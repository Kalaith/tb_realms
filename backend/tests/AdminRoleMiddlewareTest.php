<?php

declare(strict_types=1);

use App\Http\Request;
use App\Http\Response;
use App\Middleware\AdminRoleMiddleware;
use PHPUnit\Framework\TestCase;

final class AdminRoleMiddlewareTest extends TestCase
{
    public function testRejectsAuthenticatedNonAdminUser(): void
    {
        $request = $this->requestWithAuthUser([
            'id' => 10,
            'role' => 'player',
            'roles' => ['player'],
        ]);
        $response = new Response();

        $result = (new AdminRoleMiddleware())($request, $response);

        self::assertInstanceOf(Response::class, $result);
        self::assertSame(403, $result->getStatusCode());

        $payload = json_decode((string) $result->getBody(), true);
        self::assertSame(false, $payload['success']);
        self::assertSame('Forbidden', $payload['error']);
    }

    public function testAllowsAdminRole(): void
    {
        $request = $this->requestWithAuthUser([
            'id' => 10,
            'role' => 'admin',
            'roles' => ['player'],
        ]);

        self::assertTrue((new AdminRoleMiddleware())($request, new Response()));
    }

    public function testAllowsAdminInRolesList(): void
    {
        $request = $this->requestWithAuthUser([
            'id' => 10,
            'role' => 'player',
            'roles' => ['player', 'admin'],
        ]);

        self::assertTrue((new AdminRoleMiddleware())($request, new Response()));
    }

    /**
     * @param array<string, mixed> $authUser
     */
    private function requestWithAuthUser(array $authUser): Request
    {
        return (new Request([], [], [], [], 'GET', '/api/users'))
            ->withAttribute('auth_user', $authUser);
    }
}
