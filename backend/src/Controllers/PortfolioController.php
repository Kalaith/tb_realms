<?php

namespace App\Controllers;

use App\Http\Response;
use App\Http\Request;
use App\Actions\PortfolioActions;
use App\Traits\ApiResponseTrait;
use App\Exceptions\ResourceNotFoundException;

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
        $identifier = $args['identifier'] ?? null;
        $currentUserId = $this->getUserId($request);

        try {
            if (!$identifier || $identifier === 'me') {
                return $this->successResponse($response, $this->portfolioActions->getPortfolioData($currentUserId));
            }

            return $this->successResponse(
                $response,
                $this->portfolioActions->getPortfolioByIdentifier((string) $identifier)
            );
        } catch (ResourceNotFoundException $error) {
            // For authenticated callers, always fallback to own portfolio and auto-create if missing.
            return $this->successResponse($response, $this->portfolioActions->getPortfolioData($currentUserId));
        } catch (\Exception $error) {
            error_log('Error getting portfolio by user identifier: ' . $error->getMessage());
            return $this->errorResponse($response, 'Internal server error', 500);
        }
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
        $authUser = $request->getAttribute('auth_user');
        return $authUser['id'] ?? $request->getAttribute('user_id') ?? '';
    }
}
