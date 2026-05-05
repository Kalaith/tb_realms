<?php

declare(strict_types=1);

use App\Http\Response;
use App\Models\AuthUser;
use PHPUnit\Framework\TestCase;

final class SmokeTest extends TestCase
{
    public function testResponseStartsWithEmptyBodyAndOkStatus(): void
    {
        $response = new Response();

        self::assertSame(200, $response->getStatusCode());
        self::assertSame('', (string) $response->getBody());
    }

    public function testAuthUserFrontendShapePreservesGuestIdentity(): void
    {
        $user = new AuthUser(
            id: 'guest_abc',
            localUserId: 12,
            email: null,
            username: 'guest_abc',
            displayName: 'Guest ABC',
            role: 'guest',
            roles: ['guest'],
            isGuest: true,
            authType: 'guest',
            guestUserId: 'guest_abc'
        );

        self::assertSame('guest_abc', $user->toFrontendArray()['id']);
        self::assertTrue($user->toFrontendArray()['is_guest']);
    }
}
