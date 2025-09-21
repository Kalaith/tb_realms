<?php

use Slim\Routing\RouteCollectorProxy;
use App\Controllers\AuthController;
use App\Controllers\Auth0Controller;
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
use App\Middleware\Auth0Middleware;

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
                'name' => 'Dashboard',
                'path' => '/dashboard',
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
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Transactions',
                'path' => '/transactions',
                'icon' => '💳',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Watchlist',
                'path' => '/watchlist',
                'icon' => '👁️',
                'requiresAuth' => false,
                'showInHeader' => true
            ],
            [
                'name' => 'Leaderboard',
                'path' => '/leaderboard',
                'icon' => '🏆',
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
    // Auth0 Routes (Auth0 token authentication required)
    // ==================================================
    $group->group('/auth0', function (RouteCollectorProxy $auth0Group) {
        $auth0Group->post('/verify', [Auth0Controller::class, 'verifyUser']);
        $auth0Group->get('/me', [Auth0Controller::class, 'getCurrentUser']);
        $auth0Group->get('/validate', [Auth0Controller::class, 'validateSession']);
    })->add(Auth0Middleware::class);

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
    // All Routes are now Public (No Authentication Required)
    // ==================================================

    // Portfolio Routes (now using default user)
    $group->get('/portfolio', [PortfolioController::class, 'getPortfolio']);
    $group->get('/portfolios/user/{identifier}', [PortfolioController::class, 'getPortfolioByUser']); // Backward compatibility
    $group->get('/portfolio/summary', [PortfolioController::class, 'getPortfolio']); // Alternative endpoint
    $group->post('/portfolio/reset', [PortfolioController::class, 'resetPortfolio']);
    $group->get('/portfolio/performance', [PortfolioController::class, 'getPerformance']);
    $group->get('/portfolio/holdings', [PortfolioController::class, 'getHoldings']);

    // Transaction Routes (now using default user)
    $group->post('/transactions/buy', [TransactionController::class, 'buyStock']);
    $group->post('/transactions/sell', [TransactionController::class, 'sellStock']);
    $group->get('/transactions', [TransactionController::class, 'getTransactions']);
    $group->get('/transactions/history', [TransactionController::class, 'getTransactionHistory']);
    $group->get('/transactions/{id}', [TransactionController::class, 'getTransactionById']);

    // Watchlist Routes (now using default user)
    $group->get('/watchlist', [WatchlistController::class, 'getWatchlist']);
    $group->get('/watchlist/me', [WatchlistController::class, 'getWatchlist']); // Alternative endpoint
    $group->post('/watchlist', [WatchlistController::class, 'addToWatchlist']);
    $group->delete('/watchlist/{stockId}', [WatchlistController::class, 'removeFromWatchlist']);

    // User-specific Achievement Routes (now using default user)
    // TODO: Implement AchievementController and AchievementActions
    // $group->get('/achievements', [AchievementController::class, 'getUserAchievements']);
    // $group->get('/achievements/progress', [AchievementController::class, 'getAchievementProgress']);

    // Friends Leaderboard (now using default user)
    // TODO: Implement LeaderboardController and LeaderboardActions
    // $group->get('/leaderboard/friends', [LeaderboardController::class, 'getFriendsLeaderboard']);

    // User Settings Routes (now using default user)
    // TODO: Implement UserSettingsController and UserSettingsActions
    // $group->get('/settings', [UserSettingsController::class, 'getUserSettings']);
    // $group->put('/settings', [UserSettingsController::class, 'updateUserSettings']);
    // $group->post('/settings/reset', [UserSettingsController::class, 'resetToDefaults']);

    // User Management Routes (now public)
    $group->get('/users', [UserController::class, 'getAllUsers']);
    $group->get('/users/{id}', [UserController::class, 'getUserById']);
    $group->get('/users/{id}/profile', [UserController::class, 'getUserProfile']);
    $group->put('/users/{id}', [UserController::class, 'updateUser']);
    $group->delete('/users/{id}', [UserController::class, 'deleteUser']);
});
