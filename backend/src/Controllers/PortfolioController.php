<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
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
        // Use default user ID since authentication is disabled
        $defaultUserId = 'default_user';

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getPortfolioData($defaultUserId),
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
        // Use default user ID since authentication is disabled
        $defaultUserId = 'default_user';

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->resetPortfolio($defaultUserId),
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
        // Use default user ID since authentication is disabled
        $defaultUserId = 'default_user';

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getPerformanceMetrics($defaultUserId),
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
        $identifier = $args['identifier'] ?? null;
        
        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getPortfolioByIdentifier($identifier),
            'getting portfolio by user identifier',
            'Portfolio not found for user'
        );
    }

    /**
     * Get portfolio holdings (using default user)
     * GET /api/portfolio/holdings
     */
    public function getHoldings(Request $request, Response $response): Response
    {
        // Use default user ID since authentication is disabled
        $defaultUserId = 'default_user';

        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getHoldings($defaultUserId),
            'getting portfolio holdings',
            'Holdings not found'
        );
    }
}
