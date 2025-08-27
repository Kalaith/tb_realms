<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Actions\StockActions;
use App\Traits\ApiResponseTrait;

class StockController
{
    use ApiResponseTrait;

    public function __construct(
        private StockActions $stockActions
    ) {}

    /**
     * Get all stocks
     * GET /api/stocks
     */
    public function getAllStocks(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->stockActions->getAllStocks($request->getQueryParams()),
            'fetching stocks',
            'Failed to fetch stocks'
        );
    }

    /**
     * Get stock by ID
     * GET /api/stocks/{id}
     */
    public function getStockById(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->stockActions->getStockById((int)$args['id']),
            'fetching stock',
            'Failed to fetch stock'
        );
    }

    /**
     * Get stock history
     * GET /api/stocks/{id}/history
     */
    public function getStockHistory(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->stockActions->getStockHistory((int)$args['id'], $request->getQueryParams()),
            'fetching stock history',
            'Failed to fetch stock history'
        );
    }

    /**
     * Search stocks
     * GET /api/stocks/search/{term}
     */
    public function searchStocks(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->stockActions->searchStocks($args['term'], $request->getQueryParams()),
            'searching stocks',
            'Failed to search stocks'
        );
    }

    /**
     * Get stocks by category
     * GET /api/stocks/category/{category}
     */
    public function getStocksByCategory(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->stockActions->getStocksByCategory($args['category'], $request->getQueryParams()),
            'fetching stocks by category',
            'Failed to fetch stocks by category'
        );
    }

    /**
     * Get stocks by guild
     * GET /api/stocks/guild/{guild}
     */
    public function getStocksByGuild(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->stockActions->getStocksByGuild($args['guild'], $request->getQueryParams()),
            'fetching stocks by guild',
            'Failed to fetch stocks by guild'
        );
    }
}
