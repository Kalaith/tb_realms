<?php

declare(strict_types=1);

use App\Core\Router;
use App\Controllers\AuthController;
use App\Controllers\PortfolioController;
use App\Controllers\StockController;
use App\Controllers\TransactionController;
use App\Controllers\UserController;
use App\Controllers\WatchlistController;
use App\Middleware\AdminRoleMiddleware;
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

    $router->get($api . '/auth/login-info', [AuthController::class, 'loginInfo']);
    $router->get($api . '/auth/session', [AuthController::class, 'session'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/auth/current-user', [AuthController::class, 'currentUser'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/auth/guest-session', [AuthController::class, 'createGuestSession']);
    $router->post($api . '/auth/link-guest', [AuthController::class, 'linkGuestAccount'], [WebHatcheryJwtMiddleware::class]);

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

    $router->get($api . '/navigation', function ($request, $response) {
        $mainNavigation = [
            ['name' => 'Dashboard', 'path' => '/dashboard', 'icon' => 'dashboard', 'requiresAuth' => false, 'showInHeader' => true],
            ['name' => 'Market', 'path' => '/market', 'icon' => 'market', 'requiresAuth' => false, 'showInHeader' => true],
            ['name' => 'Portfolio', 'path' => '/portfolio', 'icon' => 'portfolio', 'requiresAuth' => false, 'showInHeader' => true],
            ['name' => 'Transactions', 'path' => '/transactions', 'icon' => 'transactions', 'requiresAuth' => false, 'showInHeader' => true],
            ['name' => 'Watchlist', 'path' => '/watchlist', 'icon' => 'watchlist', 'requiresAuth' => false, 'showInHeader' => true],
            ['name' => 'Leaderboard', 'path' => '/leaderboard', 'icon' => 'leaderboard', 'requiresAuth' => false, 'showInHeader' => true],
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
            ['name' => 'Profile', 'path' => '/profile', 'icon' => 'profile'],
            ['name' => 'Settings', 'path' => '/settings', 'icon' => 'settings'],
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

    $router->get($api . '/stocks', [$stockController, 'getAllStocks']);
    $router->get($api . '/stocks/filter', [$stockController, 'getAllStocks']);
    $router->get($api . '/stocks/{id}', [$stockController, 'getStockById']);
    $router->get($api . '/stocks/{id}/history', [$stockController, 'getStockHistory']);
    $router->get($api . '/stocks/search/{term}', [$stockController, 'searchStocks']);
    $router->get($api . '/stocks/category/{category}', [$stockController, 'getStocksByCategory']);
    $router->get($api . '/stocks/guild/{guild}', [$stockController, 'getStocksByGuild']);

    $router->get($api . '/portfolio', [$portfolioController, 'getPortfolio'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolios/user/{identifier}', [$portfolioController, 'getPortfolioByUser'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolio/summary', [$portfolioController, 'getPortfolio'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/portfolio/reset', [$portfolioController, 'resetPortfolio'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolio/performance', [$portfolioController, 'getPerformance'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/portfolio/holdings', [$portfolioController, 'getHoldings'], [WebHatcheryJwtMiddleware::class]);

    $router->post($api . '/transactions/buy', [$transactionController, 'buyStock'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/transactions/sell', [$transactionController, 'sellStock'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/transactions', [$transactionController, 'getTransactions'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/transactions/history', [$transactionController, 'getTransactionHistory'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/transactions/{id}', [$transactionController, 'getTransactionById'], [WebHatcheryJwtMiddleware::class]);

    $router->get($api . '/watchlist', [$watchlistController, 'getWatchlist'], [WebHatcheryJwtMiddleware::class]);
    $router->get($api . '/watchlist/me', [$watchlistController, 'getWatchlist'], [WebHatcheryJwtMiddleware::class]);
    $router->post($api . '/watchlist', [$watchlistController, 'addToWatchlist'], [WebHatcheryJwtMiddleware::class]);
    $router->delete($api . '/watchlist/{stockId}', [$watchlistController, 'removeFromWatchlist'], [WebHatcheryJwtMiddleware::class]);

    $adminOnly = [WebHatcheryJwtMiddleware::class, AdminRoleMiddleware::class];

    $router->get($api . '/users', [$userController, 'getAllUsers'], $adminOnly);
    $router->get($api . '/users/{id}', [$userController, 'getUserById'], $adminOnly);
    $router->get($api . '/users/{id}/profile', [$userController, 'getUserProfile'], [WebHatcheryJwtMiddleware::class]);
    $router->put($api . '/users/{id}', [$userController, 'updateUser'], $adminOnly);
    $router->delete($api . '/users/{id}', [$userController, 'deleteUser'], $adminOnly);
};
