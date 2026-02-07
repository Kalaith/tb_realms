<?php

use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\PortfolioController;
use App\Controllers\StockController;
use App\Controllers\TransactionController;
use App\Controllers\UserController;
use App\Controllers\WatchlistController;
use App\Middleware\WebHatcheryJwtMiddleware;

return function (
    Router $router,
    PortfolioController $portfolioController,
    StockController $stockController,
    TransactionController $transactionController,
    UserController $userController,
    WatchlistController $watchlistController
): void {
    $api = '/api';

    // Auth session
    $router->get($api . '/auth/session', [AuthController::class, 'session'], [WebHatcheryJwtMiddleware::class]);

    // Status + health (public)
    $router->get($api . '/status', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Tradeborn Realms API is running',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    $router->get($api . '/health', function ($request, $response) {
        $response->getBody()->write(json_encode([
            'success' => true,
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Navigation (public)
    $router->get($api . '/navigation', function ($request, $response) {
        $mainNavigation = [
            [
                'name' => 'Dashboard',
                'path' => '/dashboard',
                'icon' => 'ðŸ ',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Market',
                'path' => '/market',
                'icon' => 'ðŸ“ˆ',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Portfolio',
                'path' => '/portfolio',
                'icon' => 'ðŸ’¼',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Transactions',
                'path' => '/transactions',
                'icon' => 'ðŸ’³',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Watchlist',
                'path' => '/watchlist',
                'icon' => 'ðŸ‘ï¸',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Leaderboard',
                'path' => '/leaderboard',
                'icon' => 'ðŸ†',
                'requiresAuth' => false,
                'showInHeader' => true
            ]
        ];

        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $mainNavigation,
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    $router->get($api . '/navigation/account', function ($request, $response) {
        $accountNavigation = [
            [
                'name' => 'Profile',
                'path' => '/profile',
                'icon' => 'ðŸ‘¤'
            ],
            [
                'name' => 'Settings',
                'path' => '/settings',
                'icon' => 'âš™ï¸'
            ]
        ];

        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $accountNavigation,
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    $router->get($api . '/navigation/branding', function ($request, $response) {
        $appBranding = [
            'name' => 'Tradeborn Realms',
            'logoUrl' => null,
            'version' => '1.0.0'
        ];

        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $appBranding,
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Public stock routes
    $router->get($api . '/stocks', [$stockController, 'getAllStocks']);
    $router->get($api . '/stocks/filter', [$stockController, 'getAllStocks']);
    $router->get($api . '/stocks/{id}', [$stockController, 'getStockById']);
    $router->get($api . '/stocks/{id}/history', [$stockController, 'getStockHistory']);
    $router->get($api . '/stocks/search/{term}', [$stockController, 'searchStocks']);
    $router->get($api . '/stocks/category/{category}', [$stockController, 'getStocksByCategory']);
    $router->get($api . '/stocks/guild/{guild}', [$stockController, 'getStocksByGuild']);

    // Portfolio (protected)
    $router->get($api . '/portfolio', [$portfolioController, 'getPortfolio'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolios/user/{identifier}', [$portfolioController, 'getPortfolioByUser'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolio/summary', [$portfolioController, 'getPortfolio'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/portfolio/reset', [$portfolioController, 'resetPortfolio'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolio/performance', [$portfolioController, 'getPerformance'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolio/holdings', [$portfolioController, 'getHoldings'], [WebHatcheryJwtMiddleware::class]);

    // Transactions (protected)
    $router->post($api . '/transactions/buy', [$transactionController, 'buyStock'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/transactions/sell', [$transactionController, 'sellStock'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/transactions', [$transactionController, 'getTransactions'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/transactions/history', [$transactionController, 'getTransactionHistory'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/transactions/{id}', [$transactionController, 'getTransactionById'], [WebHatcheryJwtMiddleware::class]);

    // Watchlist (protected)
    $router->get($api . '/watchlist', [$watchlistController, 'getWatchlist'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/watchlist/me', [$watchlistController, 'getWatchlist'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/watchlist', [$watchlistController, 'addToWatchlist'], [WebHatcheryJwtMiddleware::class]);
    $router->delete($api . '/watchlist/{stockId}', [$watchlistController, 'removeFromWatchlist'], [WebHatcheryJwtMiddleware::class]);

    // Users (protected)
    $router->get($api . '/users', [$userController, 'getAllUsers'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/users/{id}', [$userController, 'getUserById'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/users/{id}/profile', [$userController, 'getUserProfile'], [WebHatcheryJwtMiddleware::class]);
    $router->put($api . '/users/{id}', [$userController, 'updateUser'], [WebHatcheryJwtMiddleware::class]);
    $router->delete($api . '/users/{id}', [$userController, 'deleteUser'], [WebHatcheryJwtMiddleware::class]);
};
