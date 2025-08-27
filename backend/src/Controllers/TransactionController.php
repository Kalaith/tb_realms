<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Actions\TransactionActions;
use App\Traits\ApiResponseTrait;

class TransactionController
{
    use ApiResponseTrait;

    public function __construct(
        private TransactionActions $transactionActions
    ) {}

    /**
     * Buy stock
     * POST /api/transactions/buy
     */
    public function buyStock(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->buyStock($request->getParsedBody()),
            'processing buy transaction',
            'Buy transaction failed',
            201
        );
    }

    /**
     * Sell stock
     * POST /api/transactions/sell
     */
    public function sellStock(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->sellStock($request->getParsedBody()),
            'processing sell transaction',
            'Sell transaction failed',
            201
        );
    }

    /**
     * Get transactions
     * GET /api/transactions
     */
    public function getTransactions(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->getTransactions($request->getQueryParams()),
            'fetching transactions',
            'Failed to fetch transactions'
        );
    }

    /**
     * Get transaction history
     * GET /api/transactions/history
     */
    public function getTransactionHistory(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->getTransactionHistory($request->getQueryParams()),
            'fetching transaction history',
            'Failed to fetch transaction history'
        );
    }

    /**
     * Get transaction by ID
     * GET /api/transactions/{id}
     */
    public function getTransactionById(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->getTransactionById((int)$args['id']),
            'fetching transaction',
            'Failed to fetch transaction'
        );
    }
}
