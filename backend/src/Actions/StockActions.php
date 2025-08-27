<?php

namespace App\Actions;

use App\External\StockRepository;
use App\External\TransactionRepository;
use App\External\PortfolioRepository;
use App\Models\Stock;
use App\Models\Transaction;
use App\Models\Portfolio;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\UnauthorizedException;
use Ramsey\Uuid\Uuid;

/**
 * Stock trading business logic
 * Following Mytherra Actions pattern
 */
class StockActions
{
    public function __construct(
        private StockRepository $stockRepository,
        private TransactionRepository $transactionRepository,
        private PortfolioRepository $portfolioRepository
    ) {}

    /**
     * Get all active stocks with current market data
     */
    public function getAllStocks(array $queryParams = []): array
    {
        $stocks = $this->stockRepository->getAllActiveStocks();
        
        // Apply filters if provided
        if (!empty($queryParams)) {
            $stocks = $this->filterStocks($stocks, $queryParams);
        }
        
        return array_map(function($stock) {
            return $this->formatStockData($stock);
        }, $stocks);
    }

    /**
     * Filter stocks based on query parameters
     */
    private function filterStocks(array $stocks, array $params): array
    {
        // Apply sorting if specified
        if (isset($params['sortBy']) && isset($params['sortDirection'])) {
            $sortBy = $params['sortBy'];
            $sortDirection = strtolower($params['sortDirection']);
            
            usort($stocks, function($a, $b) use ($sortBy, $sortDirection) {
                $valueA = $this->getStockSortValue($a, $sortBy);
                $valueB = $this->getStockSortValue($b, $sortBy);
                
                if ($sortDirection === 'desc') {
                    return $valueB <=> $valueA;
                } else {
                    return $valueA <=> $valueB;
                }
            });
        }
        
        // Add other filters here (price range, sector, etc.) as needed
        
        return $stocks;
    }

    /**
     * Get value for sorting stocks
     */
    private function getStockSortValue($stock, string $sortBy)
    {
        switch ($sortBy) {
            case 'change':
                return $stock->change_percentage ?? 0;
            case 'price':
                return $stock->current_price ?? 0;
            case 'name':
                return $stock->name ?? '';
            case 'symbol':
                return $stock->symbol ?? '';
            default:
                return 0;
        }
    }

    /**
     * Get stock by ID with detailed information
     */
    public function getStockById(string $stockId): array
    {
        $stock = $this->stockRepository->findById($stockId);
        
        if (!$stock) {
            throw new ResourceNotFoundException('Stock not found');
        }

        return $this->formatStockData($stock, true);
    }

    /**
     * Search stocks by symbol or name
     */
    public function searchStocks(string $searchTerm): array
    {
        $stocks = $this->stockRepository->searchStocks($searchTerm);
        
        return array_map(function($stock) {
            return $this->formatStockData($stock);
        }, $stocks);
    }

    /**
     * Get stocks by category (technology, healthcare, etc.)
     */
    public function getStocksByCategory(string $category): array
    {
        $stocks = $this->stockRepository->getByCategory($category);
        
        return array_map(function($stock) {
            return $this->formatStockData($stock);
        }, $stocks);
    }

    /**
     * Get stocks by guild (gaming guilds context)
     */
    public function getStocksByGuild(string $guild): array
    {
        $stocks = $this->stockRepository->getByGuild($guild);
        
        return array_map(function($stock) {
            return $this->formatStockData($stock);
        }, $stocks);
    }

    /**
     * Get stock price history for charts
     */
    public function getStockHistory(string $stockId, int $days = 30): array
    {
        $stock = $this->stockRepository->findById($stockId);
        
        if (!$stock) {
            throw new ResourceNotFoundException('Stock not found');
        }

        // For now, generate mock historical data
        // In production, this would come from a stock_price_history table
        return $this->generateMockPriceHistory($stock, $days);
    }

    /**
     * Update stock prices (called by market simulation)
     */
    public function updateStockPrices(array $priceUpdates): array
    {
        $updatedStocks = [];
        
        foreach ($priceUpdates as $update) {
            $stock = $this->stockRepository->findById($update['stock_id']);
            
            if ($stock) {
                $previousPrice = $stock->current_price;
                $newPrice = $update['new_price'];
                
                $dayChange = $newPrice - $previousPrice;
                $dayChangePercentage = $previousPrice > 0 ? ($dayChange / $previousPrice) * 100 : 0;
                
                $updateData = [
                    'previous_close' => $previousPrice,
                    'current_price' => $newPrice,
                    'day_change' => $dayChange,
                    'day_change_percentage' => $dayChangePercentage,
                    'volume' => $update['volume'] ?? $stock->volume,
                    'last_updated' => now()
                ];
                
                $updatedStock = $this->stockRepository->updateStock($stock->id, $updateData);
                $updatedStocks[] = $this->formatStockData($updatedStock);
            }
        }
        
        return $updatedStocks;
    }

    /**
     * Get market summary statistics
     */
    public function getMarketSummary(): array
    {
        $totalStocks = $this->stockRepository->getTotalActiveStocks();
        $gainers = $this->stockRepository->getTopGainers(5);
        $losers = $this->stockRepository->getTopLosers(5);
        $mostActive = $this->stockRepository->getMostActiveByVolume(5);
        
        return [
            'total_stocks' => $totalStocks,
            'top_gainers' => array_map(fn($stock) => $this->formatStockData($stock), $gainers),
            'top_losers' => array_map(fn($stock) => $this->formatStockData($stock), $losers),
            'most_active' => array_map(fn($stock) => $this->formatStockData($stock), $mostActive),
            'market_status' => $this->getMarketStatus()
        ];
    }

    /**
     * Format stock data for API response
     */
    private function formatStockData(Stock $stock, bool $detailed = false): array
    {
        $data = [
            'id' => $stock->id,
            'symbol' => $stock->symbol,
            'name' => $stock->name,
            'current_price' => (float) $stock->current_price,
            'day_change' => (float) $stock->day_change,
            'day_change_percentage' => (float) $stock->day_change_percentage,
            'volume' => $stock->volume,
            'category' => $stock->category,
            'guild' => $stock->guild,
            'is_active' => $stock->is_active,
            'last_updated' => $stock->last_updated?->toISOString()
        ];

        if ($detailed) {
            $data = array_merge($data, [
                'description' => $stock->description,
                'previous_close' => (float) $stock->previous_close,
                'market_cap' => $stock->market_cap,
                'avg_volume' => $stock->avg_volume,
                'pe_ratio' => $stock->pe_ratio ? (float) $stock->pe_ratio : null,
                'dividend_yield' => $stock->dividend_yield ? (float) $stock->dividend_yield : null,
                'beta' => $stock->beta ? (float) $stock->beta : null,
                'week_52_high' => $stock->week_52_high ? (float) $stock->week_52_high : null,
                'week_52_low' => $stock->week_52_low ? (float) $stock->week_52_low : null
            ]);
        }

        return $data;
    }

    /**
     * Generate mock price history (replace with real data in production)
     */
    private function generateMockPriceHistory(Stock $stock, int $days): array
    {
        $history = [];
        $basePrice = (float) $stock->current_price;
        
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $variance = (mt_rand(-500, 500) / 10000); // ±5% variance
            $price = $basePrice * (1 + $variance);
            
            $history[] = [
                'date' => $date->toDateString(),
                'open' => round($price * 0.995, 4),
                'high' => round($price * 1.01, 4),
                'low' => round($price * 0.99, 4),
                'close' => round($price, 4),
                'volume' => mt_rand(10000, 100000)
            ];
        }
        
        return $history;
    }

    /**
     * Get current market status
     */
    private function getMarketStatus(): array
    {
        // Simple market hours simulation
        $hour = (int) now()->format('H');
        $isOpen = $hour >= 9 && $hour < 17; // 9 AM to 5 PM
        
        return [
            'is_open' => $isOpen,
            'status' => $isOpen ? 'open' : 'closed',
            'next_open' => $isOpen ? null : now()->next('9:00')->toISOString(),
            'next_close' => $isOpen ? now()->setTime(17, 0)->toISOString() : null
        ];
    }
}
