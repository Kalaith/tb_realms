<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Actions\WatchlistActions;
use App\Traits\ApiResponseTrait;

class WatchlistController
{
    use ApiResponseTrait;

    public function __construct(
        private WatchlistActions $watchlistActions
    ) {}

    /**
     * Get user's watchlist
     * GET /api/watchlist
     * GET /api/watchlist/me
     */
    public function getWatchlist(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->watchlistActions->getUserWatchlist($request->getAttribute('user_id')),
            'getting watchlist',
            'Failed to retrieve watchlist'
        );
    }

    /**
     * Add stock to watchlist
     * POST /api/watchlist
     */
    public function addToWatchlist(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();
        
        return $this->handleApiAction(
            $response,
            fn() => $this->watchlistActions->addStockToWatchlist(
                $request->getAttribute('user_id'),
                $data['stock_id'] ?? null
            ),
            'adding stock to watchlist',
            'Failed to add stock to watchlist',
            201
        );
    }

    /**
     * Remove stock from watchlist
     * DELETE /api/watchlist/{stockId}
     */
    public function removeFromWatchlist(Request $request, Response $response, array $args): Response
    {
        $stockId = $args['stockId'] ?? null;
        
        return $this->handleApiAction(
            $response,
            fn() => $this->watchlistActions->removeStockFromWatchlist(
                $request->getAttribute('user_id'),
                $stockId
            ),
            'removing stock from watchlist',
            'Failed to remove stock from watchlist'
        );
    }
}
