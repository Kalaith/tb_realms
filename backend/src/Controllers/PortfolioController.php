<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Response;
use App\Http\Request;
use App\Actions\PortfolioActions;
use App\Traits\ApiResponseTrait;

class PortfolioController
{
    use ApiResponseTrait;

    public function __construct(
        private PortfolioActions $portfolioActions
    ) {}

    /**
     * Get user's portfolio (using default user)
     * GET /api/portfolio
     */
    public function getPortfolio(Request $request, Response $response): Response
    {
        $userId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getPortfolioData($userId),
            'getting portfolio data',
            'Portfolio not found'
        );
    }

    /**
     * Reset user's portfolio (using default user)
     * POST /api/portfolio/reset
     */
    public function resetPortfolio(Request $request, Response $response): Response
    {
        $userId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->resetPortfolio($userId),
            'resetting portfolio',
            'Portfolio reset failed'
        );
    }

    /**
     * Get portfolio performance metrics (using default user)
     * GET /api/portfolio/performance
     */
    public function getPerformance(Request $request, Response $response): Response
    {
        $userId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getPortfolioPerformance($userId),
            'getting portfolio performance',
            'Performance data not found'
        );
    }

    /**
     * Get user's portfolio by username or ID (backward compatibility)
     * GET /api/portfolios/user/{identifier}
     */
    public function getPortfolioByUser(Request $request, Response $response, array $args): Response
    {
        $identifier = (string) ($args['identifier'] ?? 'me');
        $currentUserId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getPortfolioByIdentifier(
                $currentUserId,
                $identifier,
                $this->getAuthUser($request)
            ),
            'getting portfolio by user identifier',
            'Portfolio not found'
        );
    }

    /**
     * Get portfolio holdings (using default user)
     * GET /api/portfolio/holdings
     */
    public function getHoldings(Request $request, Response $response): Response
    {
        $userId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getCurrentHoldings($userId),
            'getting portfolio holdings',
            'Holdings not found'
        );
    }

    private function getUserId(Request $request): string|int
    {
        return $request->getAttribute('user_id') ?? '';
    }

    /**
     * @return array<string, mixed>
     */
    private function getAuthUser(Request $request): array
    {
        $authUser = $request->getAttribute('auth_user', []);

        return is_array($authUser) ? $authUser : [];
    }
}
