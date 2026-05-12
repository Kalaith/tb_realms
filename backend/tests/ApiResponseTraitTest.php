<?php

declare(strict_types=1);

use App\Exceptions\UnauthorizedException;
use App\Http\Response;
use App\Traits\ApiResponseTrait;
use PHPUnit\Framework\TestCase;

final class ApiResponseTraitTest extends TestCase
{
    public function testUnauthorizedActionReturnsForbiddenResponse(): void
    {
        $handler = new class {
            use ApiResponseTrait {
                handleApiAction as public;
            }
        };

        $response = $handler->handleApiAction(
            new Response(),
            static fn() => throw new UnauthorizedException('Access denied'),
            'testing unauthorized action'
        );

        $payload = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(403, $response->getStatusCode());
        self::assertSame(false, $payload['success']);
        self::assertSame('Access denied', $payload['message']);
    }

    public function testInvalidArgumentActionReturnsBadRequestResponse(): void
    {
        $handler = new class {
            use ApiResponseTrait {
                handleApiAction as public;
            }
        };

        $response = $handler->handleApiAction(
            new Response(),
            static fn() => throw new InvalidArgumentException('Bad input'),
            'testing invalid action'
        );

        $payload = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);

        self::assertSame(400, $response->getStatusCode());
        self::assertSame(false, $payload['success']);
        self::assertSame('Bad input', $payload['message']);
    }
}
