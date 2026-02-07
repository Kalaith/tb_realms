<?php

namespace App\Controllers;

use App\Http\Response;
use App\Http\Request;
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
        $userId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->buyStock((string) $userId, $request->getParsedBody()),
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
        $userId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->sellStock((string) $userId, $request->getParsedBody()),
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
        $userId = $this->getUserId($request);
        $filters = $request->getQueryParams();

        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->getTransactionHistory((string) $userId, $filters),
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
        $userId = $this->getUserId($request);
        $filters = $request->getQueryParams();

        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->getTransactionHistory((string) $userId, $filters),
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
        $userId = $this->getUserId($request);

        return $this->handleApiAction(
            $response,
            fn() => $this->transactionActions->getTransactionById((string) $userId, (string) $args['id']),
            'fetching transaction',
            'Failed to fetch transaction'
        );
    }

    private function getUserId(Request $request): string|int
    {
        $authUser = $request->getAttribute('auth_user');
        return $authUser['id'] ?? $request->getAttribute('user_id') ?? '';
    }
}
