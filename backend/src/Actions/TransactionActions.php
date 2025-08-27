<?php

namespace App\Actions;

use App\External\TransactionRepository;
use App\External\PortfolioRepository;
use App\External\StockRepository;
use App\External\UserRepository;
use App\Models\Transaction;
use App\Models\Portfolio;
use App\Models\Stock;
use App\Models\User;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\UnauthorizedException;
use Ramsey\Uuid\Uuid;
use Illuminate\Database\Capsule\Manager as DB;

/**
 * Transaction processing business logic
 * Following Mytherra Actions pattern with MySQL transactions
 */
class TransactionActions
{
    public function __construct(
        private TransactionRepository $transactionRepository,
        private PortfolioRepository $portfolioRepository,
        private StockRepository $stockRepository,
        private UserRepository $userRepository
    ) {}

    /**
     * Execute a buy stock transaction
     */
    public function buyStock(string $userId, array $orderData): array
    {
        return DB::transaction(function () use ($userId, $orderData) {
            // Validate input data
            $this->validateOrderData($orderData, 'buy');
            
            $stockId = $orderData['stock_id'];
            $quantity = (int) $orderData['quantity'];
            
            // Get user portfolio
            $portfolio = $this->portfolioRepository->findByUserId($userId);
            if (!$portfolio) {
                throw new ResourceNotFoundException('Portfolio not found');
            }

            // Get stock information
            $stock = $this->stockRepository->findById($stockId);
            if (!$stock || !$stock->is_active) {
                throw new ResourceNotFoundException('Stock not found or inactive');
            }

            // Calculate transaction details
            $pricePerShare = (float) $stock->current_price;
            $totalCost = $pricePerShare * $quantity;
            $fees = $this->calculateTradingFees($totalCost);
            $totalAmount = $totalCost + $fees;

            // Check if user has sufficient funds
            if ((float) $portfolio->cash_balance < $totalAmount) {
                throw new UnauthorizedException('Insufficient funds for this purchase');
            }

            // Create transaction record
            $transactionData = [
                'id' => 'transaction-' . Uuid::uuid4()->toString(),
                'user_id' => $userId,
                'portfolio_id' => $portfolio->id,
                'stock_id' => $stockId,
                'type' => 'buy',
                'quantity' => $quantity,
                'price_per_share' => $pricePerShare,
                'total_amount' => $totalAmount,
                'fees' => $fees,
                'status' => 'completed'
            ];

            $transaction = $this->transactionRepository->createTransaction($transactionData);

            // Update portfolio cash balance
            $newCashBalance = (float) $portfolio->cash_balance - $totalAmount;
            $newTotalInvested = (float) $portfolio->total_invested + $totalAmount;
            
            $this->portfolioRepository->updatePortfolio($portfolio->id, [
                'cash_balance' => $newCashBalance,
                'total_invested' => $newTotalInvested
            ]);

            // Update stock volume
            $this->stockRepository->updateStock($stockId, [
                'volume' => $stock->volume + $quantity
            ]);

            return [
                'transaction' => $this->formatTransactionData($transaction, $stock),
                'portfolio_summary' => $this->getUpdatedPortfolioSummary($userId)
            ];
        });
    }

    /**
     * Execute a sell stock transaction
     */
    public function sellStock(string $userId, array $orderData): array
    {
        return DB::transaction(function () use ($userId, $orderData) {
            // Validate input data
            $this->validateOrderData($orderData, 'sell');
            
            $stockId = $orderData['stock_id'];
            $quantity = (int) $orderData['quantity'];
            
            // Get user portfolio
            $portfolio = $this->portfolioRepository->findByUserId($userId);
            if (!$portfolio) {
                throw new ResourceNotFoundException('Portfolio not found');
            }

            // Get stock information
            $stock = $this->stockRepository->findById($stockId);
            if (!$stock || !$stock->is_active) {
                throw new ResourceNotFoundException('Stock not found or inactive');
            }

            // Check if user has sufficient shares
            $currentHolding = $this->getCurrentHoldingQuantity($portfolio->id, $stockId);
            if ($currentHolding < $quantity) {
                throw new UnauthorizedException("Insufficient shares. You own {$currentHolding} shares but trying to sell {$quantity}");
            }

            // Calculate transaction details
            $pricePerShare = (float) $stock->current_price;
            $grossAmount = $pricePerShare * $quantity;
            $fees = $this->calculateTradingFees($grossAmount);
            $netAmount = $grossAmount - $fees;

            // Create transaction record
            $transactionData = [
                'id' => 'transaction-' . Uuid::uuid4()->toString(),
                'user_id' => $userId,
                'portfolio_id' => $portfolio->id,
                'stock_id' => $stockId,
                'type' => 'sell',
                'quantity' => $quantity,
                'price_per_share' => $pricePerShare,
                'total_amount' => $netAmount,
                'fees' => $fees,
                'status' => 'completed'
            ];

            $transaction = $this->transactionRepository->createTransaction($transactionData);

            // Update portfolio cash balance
            $newCashBalance = (float) $portfolio->cash_balance + $netAmount;
            
            $this->portfolioRepository->updatePortfolio($portfolio->id, [
                'cash_balance' => $newCashBalance
            ]);

            // Update stock volume
            $this->stockRepository->updateStock($stockId, [
                'volume' => $stock->volume + $quantity
            ]);

            return [
                'transaction' => $this->formatTransactionData($transaction, $stock),
                'portfolio_summary' => $this->getUpdatedPortfolioSummary($userId)
            ];
        });
    }

    /**
     * Get user's transaction history
     */
    public function getTransactionHistory(string $userId, array $filters = []): array
    {
        $portfolio = $this->portfolioRepository->findByUserId($userId);
        if (!$portfolio) {
            throw new ResourceNotFoundException('Portfolio not found');
        }

        $transactions = $this->transactionRepository->getTransactionHistory(
            $portfolio->id,
            $filters
        );

        $formattedTransactions = [];
        foreach ($transactions as $transaction) {
            $stock = $this->stockRepository->findById($transaction->stock_id);
            $formattedTransactions[] = $this->formatTransactionData($transaction, $stock);
        }

        return [
            'transactions' => $formattedTransactions,
            'total_count' => count($formattedTransactions),
            'summary' => $this->getTransactionSummary($transactions)
        ];
    }

    /**
     * Get transaction by ID
     */
    public function getTransactionById(string $userId, string $transactionId): array
    {
        $transaction = $this->transactionRepository->findById($transactionId);
        
        if (!$transaction || $transaction->user_id !== $userId) {
            throw new ResourceNotFoundException('Transaction not found');
        }

        $stock = $this->stockRepository->findById($transaction->stock_id);
        
        return $this->formatTransactionData($transaction, $stock);
    }

    /**
     * Cancel a pending transaction
     */
    public function cancelTransaction(string $userId, string $transactionId): array
    {
        return DB::transaction(function () use ($userId, $transactionId) {
            $transaction = $this->transactionRepository->findById($transactionId);
            
            if (!$transaction || $transaction->user_id !== $userId) {
                throw new ResourceNotFoundException('Transaction not found');
            }

            if ($transaction->status !== 'pending') {
                throw new UnauthorizedException('Can only cancel pending transactions');
            }

            // Update transaction status
            $this->transactionRepository->updateTransaction($transactionId, [
                'status' => 'cancelled'
            ]);

            // If it was a buy order, refund the cash
            if ($transaction->type === 'buy') {
                $portfolio = $this->portfolioRepository->findById($transaction->portfolio_id);
                if ($portfolio) {
                    $newCashBalance = (float) $portfolio->cash_balance + (float) $transaction->total_amount;
                    $this->portfolioRepository->updatePortfolio($portfolio->id, [
                        'cash_balance' => $newCashBalance
                    ]);
                }
            }

            return [
                'message' => 'Transaction cancelled successfully',
                'transaction_id' => $transactionId
            ];
        });
    }

    /**
     * Validate order data
     */
    private function validateOrderData(array $data, string $type): void
    {
        $required = ['stock_id', 'quantity'];
        
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                throw new \InvalidArgumentException("Missing required field: {$field}");
            }
        }

        $quantity = (int) $data['quantity'];
        if ($quantity <= 0) {
            throw new \InvalidArgumentException('Quantity must be greater than 0');
        }

        if ($quantity > 10000) {
            throw new \InvalidArgumentException('Quantity cannot exceed 10,000 shares per transaction');
        }
    }

    /**
     * Calculate trading fees (simple percentage-based)
     */
    private function calculateTradingFees(float $amount): float
    {
        $feePercentage = 0.001; // 0.1% trading fee
        $minFee = 1.00; // Minimum $1 fee
        $maxFee = 50.00; // Maximum $50 fee
        
        $fee = $amount * $feePercentage;
        return max($minFee, min($maxFee, $fee));
    }

    /**
     * Get current holding quantity for a stock
     */
    private function getCurrentHoldingQuantity(string $portfolioId, string $stockId): int
    {
        $transactions = $this->transactionRepository->getCompletedTransactions($portfolioId);
        $totalQuantity = 0;

        foreach ($transactions as $transaction) {
            if ($transaction->stock_id === $stockId) {
                if ($transaction->type === 'buy') {
                    $totalQuantity += $transaction->quantity;
                } else {
                    $totalQuantity -= $transaction->quantity;
                }
            }
        }

        return max(0, $totalQuantity);
    }

    /**
     * Format transaction data for API response
     */
    private function formatTransactionData(Transaction $transaction, ?Stock $stock): array
    {
        return [
            'id' => $transaction->id,
            'type' => $transaction->type,
            'status' => $transaction->status,
            'quantity' => $transaction->quantity,
            'price_per_share' => (float) $transaction->price_per_share,
            'total_amount' => (float) $transaction->total_amount,
            'fees' => (float) $transaction->fees,
            'stock' => $stock ? [
                'id' => $stock->id,
                'symbol' => $stock->symbol,
                'name' => $stock->name,
                'current_price' => (float) $stock->current_price
            ] : null,
            'created_at' => $transaction->created_at->toISOString(),
            'updated_at' => $transaction->updated_at->toISOString()
        ];
    }

    /**
     * Get updated portfolio summary after transaction
     */
    private function getUpdatedPortfolioSummary(string $userId): array
    {
        $portfolio = $this->portfolioRepository->findByUserId($userId);
        
        return [
            'cash_balance' => (float) $portfolio->cash_balance,
            'total_invested' => (float) $portfolio->total_invested,
            'total_value' => (float) $portfolio->total_value
        ];
    }

    /**
     * Get transaction summary statistics
     */
    private function getTransactionSummary(array $transactions): array
    {
        $totalBuys = 0;
        $totalSells = 0;
        $totalBuyAmount = 0;
        $totalSellAmount = 0;
        $totalFees = 0;

        foreach ($transactions as $transaction) {
            $totalFees += (float) $transaction->fees;
            
            if ($transaction->type === 'buy') {
                $totalBuys++;
                $totalBuyAmount += (float) $transaction->total_amount;
            } else {
                $totalSells++;
                $totalSellAmount += (float) $transaction->total_amount;
            }
        }

        return [
            'total_transactions' => count($transactions),
            'total_buys' => $totalBuys,
            'total_sells' => $totalSells,
            'total_buy_amount' => round($totalBuyAmount, 2),
            'total_sell_amount' => round($totalSellAmount, 2),
            'total_fees' => round($totalFees, 2),
            'net_invested' => round($totalBuyAmount - $totalSellAmount, 2)
        ];
    }
}
