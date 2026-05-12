<?php

declare(strict_types=1);

use PHPUnit\Framework\TestCase;

final class PortfolioAccessSecurityTest extends TestCase
{
    public function testPortfolioIdentifierLookupRequiresOwnerOrAdmin(): void
    {
        $source = file_get_contents(__DIR__ . '/../src/Actions/PortfolioActions.php');
        self::assertIsString($source);

        self::assertStringContainsString('Portfolio access denied', $source);
        self::assertMatchesRegularExpression(
            '/\\(int\\) \\$currentUserId !== \\$targetUserId && !\\$this->isAdmin\\(\\$authUser\\)/',
            $source
        );
        self::assertMatchesRegularExpression('/private function isAdmin\\(array \\$authUser\\): bool/', $source);
    }
}
