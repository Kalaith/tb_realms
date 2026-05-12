<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class UserRoutesSecurityTest extends TestCase
{
    public function testSensitiveUserRoutesAreAdminGated(): void
    {
        $routerSource = file_get_contents(__DIR__ . '/../src/Routes/router.php');
        self::assertIsString($routerSource);

        self::assertStringContainsString('use App\Middleware\AdminRoleMiddleware;', $routerSource);
        self::assertMatchesRegularExpression(
            "/\\\$adminOnly\\s*=\\s*\\[WebHatcheryJwtMiddleware::class,\\s*AdminRoleMiddleware::class\\]/",
            $routerSource
        );
        self::assertMatchesRegularExpression(
            "/users'\\,\\s*\\[\\\$userController,\\s*'getAllUsers'\\],\\s*\\\$adminOnly/",
            $routerSource
        );
        self::assertMatchesRegularExpression(
            "/users\\/\\{id\\}'\\,\\s*\\[\\\$userController,\\s*'getUserById'\\],\\s*\\\$adminOnly/",
            $routerSource
        );
        self::assertMatchesRegularExpression(
            "/users\\/\\{id\\}'\\,\\s*\\[\\\$userController,\\s*'updateUser'\\],\\s*\\\$adminOnly/",
            $routerSource
        );
        self::assertMatchesRegularExpression(
            "/users\\/\\{id\\}'\\,\\s*\\[\\\$userController,\\s*'deleteUser'\\],\\s*\\\$adminOnly/",
            $routerSource
        );
    }
}
