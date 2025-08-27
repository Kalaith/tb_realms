<?php

use Slim\Routing\RouteCollectorProxy;
use App\Controllers\AuthController;
use App\Controllers\PortfolioController;
use App\Controllers\StockController;
use App\Controllers\TransactionController;
use App\Controllers\UserController;
use App\Controllers\WatchlistController;
// TODO: Add these imports when implementing Phase 4 features
// use App\Controllers\AchievementController;
// use App\Controllers\LeaderboardController;
// use App\Controllers\EventController;
// use App\Controllers\UserSettingsController;
use App\Middleware\JwtAuthMiddleware;

// API Routes
$app->group('/api', function (RouteCollectorProxy $group) {
    // API status endpoint
    $group->get('/status', function($request, $response) {
        $response->getBody()->write(json_encode([
            'success' => true,
            'message' => 'Tradeborn Realms API is running',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // API health endpoint (for frontend connectivity checks)
    $group->get('/health', function($request, $response) {
        $response->getBody()->write(json_encode([
            'success' => true,
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // Navigation endpoint (for frontend navigation structure)
    $group->get('/navigation', function($request, $response) {
        $mainNavigation = [
            [
                'name' => 'Home',
                'path' => '/',
                'icon' => '🏠',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Market',
                'path' => '/market',
                'icon' => '📈',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Portfolio',
                'path' => '/portfolio',
                'icon' => '💼',
                'requiresAuth' => true,
                'showInHeader' => true
            ],
            [
                'name' => 'Watchlist',
                'path' => '/watchlist',
                'icon' => '👁️',
                'requiresAuth' => true,
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

    // Account navigation endpoint
    $group->get('/navigation/account', function($request, $response) {
        $accountNavigation = [
            [
                'name' => 'Profile',
                'path' => '/profile',
                'icon' => '👤'
            ],
            [
                'name' => 'Settings',
                'path' => '/settings',
                'icon' => '⚙️'
            ]
        ];

        $response->getBody()->write(json_encode([
            'success' => true,
            'data' => $accountNavigation,
            'timestamp' => date('Y-m-d H:i:s')
        ]));
        return $response->withHeader('Content-Type', 'application/json');
    });

    // App branding endpoint
    $group->get('/navigation/branding', function($request, $response) {
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

    // ==================================================
    // Public Authentication Routes (No Auth Required)
    // ==================================================
    $group->post('/auth/register', [AuthController::class, 'register']);
    $group->post('/auth/login', [AuthController::class, 'login']);

    // ==================================================
    // Public Stock Information Routes (No Auth Required)
    // ==================================================
    $group->get('/stocks', [StockController::class, 'getAllStocks']);
    $group->get('/stocks/filter', [StockController::class, 'getAllStocks']); // Filter endpoint uses same controller method
    $group->get('/stocks/{id}', [StockController::class, 'getStockById']);
    $group->get('/stocks/{id}/history', [StockController::class, 'getStockHistory']);
    $group->get('/stocks/search/{term}', [StockController::class, 'searchStocks']);
    $group->get('/stocks/category/{category}', [StockController::class, 'getStocksByCategory']);
    $group->get('/stocks/guild/{guild}', [StockController::class, 'getStocksByGuild']);

    // ==================================================
    // Public Achievement Routes (No Auth Required)
    // TODO: Implement AchievementController and AchievementActions
    // ==================================================
    // $group->get('/achievements/all', [AchievementController::class, 'getAllAchievements']);

    // ==================================================
    // Public Event Routes (No Auth Required)
    // TODO: Implement EventController and EventActions
    // ==================================================
    // $group->get('/events', [EventController::class, 'getActiveEvents']);
    // $group->get('/events/history', [EventController::class, 'getEventHistory']);
    // $group->get('/events/{id}', [EventController::class, 'getEventById']);

    // ==================================================
    // Public Leaderboard Routes (No Auth Required)
    // TODO: Implement LeaderboardController and LeaderboardActions
    // ==================================================
    // $group->get('/leaderboard', [LeaderboardController::class, 'getLeaderboard']);
    // $group->get('/leaderboard/top-traders', [LeaderboardController::class, 'getTopTraders']);
    // $group->get('/leaderboard/performance', [LeaderboardController::class, 'getPerformanceLeaderboard']);

    // ==================================================
    // Protected Routes (JWT Authentication Required)
    // ==================================================
    $group->group('', function (RouteCollectorProxy $protected) {
        // Authentication Routes (Protected)
        $protected->get('/auth/me', [AuthController::class, 'getCurrentUser']);
        $protected->get('/auth/user', [AuthController::class, 'getCurrentUser']); // Alternative endpoint
        $protected->post('/auth/logout', [AuthController::class, 'logout']);

        // Portfolio Routes (Protected)
        $protected->get('/portfolio', [PortfolioController::class, 'getPortfolio']);
        $protected->get('/portfolios/user/{identifier}', [PortfolioController::class, 'getPortfolioByUser']); // Backward compatibility
        $protected->get('/portfolio/summary', [PortfolioController::class, 'getPortfolio']); // Alternative endpoint
        $protected->post('/portfolio/reset', [PortfolioController::class, 'resetPortfolio']);
        $protected->get('/portfolio/performance', [PortfolioController::class, 'getPerformance']);
        $protected->get('/portfolio/holdings', [PortfolioController::class, 'getHoldings']);

        // Transaction Routes (Protected)
        $protected->post('/transactions/buy', [TransactionController::class, 'buyStock']);
        $protected->post('/transactions/sell', [TransactionController::class, 'sellStock']);
        $protected->get('/transactions', [TransactionController::class, 'getTransactions']);
        $protected->get('/transactions/history', [TransactionController::class, 'getTransactionHistory']);
        $protected->get('/transactions/{id}', [TransactionController::class, 'getTransactionById']);

        // Watchlist Routes (Protected)
        $protected->get('/watchlist', [WatchlistController::class, 'getWatchlist']);
        $protected->get('/watchlist/me', [WatchlistController::class, 'getWatchlist']); // Alternative endpoint
        $protected->post('/watchlist', [WatchlistController::class, 'addToWatchlist']);
        $protected->delete('/watchlist/{stockId}', [WatchlistController::class, 'removeFromWatchlist']);

        // User-specific Achievement Routes (Protected)
        // TODO: Implement AchievementController and AchievementActions
        // $protected->get('/achievements', [AchievementController::class, 'getUserAchievements']);
        // $protected->get('/achievements/progress', [AchievementController::class, 'getAchievementProgress']);

        // Friends Leaderboard (Protected)
        // TODO: Implement LeaderboardController and LeaderboardActions
        // $protected->get('/leaderboard/friends', [LeaderboardController::class, 'getFriendsLeaderboard']);

        // User Settings Routes (Protected)
        // TODO: Implement UserSettingsController and UserSettingsActions
        // $protected->get('/settings', [UserSettingsController::class, 'getUserSettings']);
        // $protected->put('/settings', [UserSettingsController::class, 'updateUserSettings']);
        // $protected->post('/settings/reset', [UserSettingsController::class, 'resetToDefaults']);

        // User Management Routes (Protected - Admin only)
        $protected->get('/users', [UserController::class, 'getAllUsers']);
        $protected->get('/users/{id}', [UserController::class, 'getUserById']);
        $protected->get('/users/{id}/profile', [UserController::class, 'getUserProfile']);
        $protected->put('/users/{id}', [UserController::class, 'updateUser']);
        $protected->delete('/users/{id}', [UserController::class, 'deleteUser']);

    })->add(JwtAuthMiddleware::class);
});
