<?php

namespace App\Utils;

use DI\ContainerBuilder;
use App\External\DatabaseService;

// Controllers
use App\Controllers\AuthController;
use App\Controllers\PortfolioController;
use App\Controllers\StockController;
use App\Controllers\TransactionController;
use App\Controllers\UserController;
use App\Controllers\WatchlistController;
// TODO: Add these controllers when implementing Phase 4 features
// use App\Controllers\AchievementController;
// use App\Controllers\LeaderboardController;
// use App\Controllers\EventController;
// use App\Controllers\UserSettingsController;

// Actions
use App\Actions\AuthActions;
use App\Actions\PortfolioActions;
use App\Actions\StockActions;
use App\Actions\TransactionActions;
use App\Actions\UserActions;
use App\Actions\WatchlistActions;
// TODO: Add these actions when implementing Phase 4 features
// use App\Actions\AchievementActions;
// use App\Actions\LeaderboardActions;
// use App\Actions\EventActions;
// use App\Actions\UserSettingsActions;

// Repositories
use App\External\UserRepository;
use App\External\PortfolioRepository;
use App\External\StockRepository;
use App\External\TransactionRepository;
use App\External\WatchlistRepository;
// TODO: Add these repositories when implementing Phase 4 features
// use App\External\AchievementRepository;
// use App\External\EventRepository;
// use App\External\UserSettingsRepository;

// Middleware
use App\Middleware\JwtAuthMiddleware;

class ContainerConfig
{
    public static function createContainer()
    {
        $containerBuilder = new ContainerBuilder();

        $containerBuilder->addDefinitions([
            // Database Service (Singleton)
            DatabaseService::class => fn() => DatabaseService::getInstance(),

            // === REPOSITORIES ===
            UserRepository::class => \DI\autowire(),
            PortfolioRepository::class => \DI\autowire(),
            StockRepository::class => \DI\autowire(),
            TransactionRepository::class => \DI\autowire(),
            WatchlistRepository::class => \DI\autowire(),
            // TODO: Add these repositories when implementing Phase 4 features
            // AchievementRepository::class => \DI\autowire(),
            // EventRepository::class => \DI\autowire(),
            // UserSettingsRepository::class => \DI\autowire(),

            // === ACTIONS ===
            AuthActions::class => \DI\autowire(),
            PortfolioActions::class => \DI\autowire(),
            StockActions::class => \DI\autowire(),
            TransactionActions::class => \DI\autowire(),
            UserActions::class => \DI\autowire(),
            WatchlistActions::class => \DI\autowire(),
            // TODO: Add these actions when implementing Phase 4 features
            // AchievementActions::class => \DI\autowire(),
            // LeaderboardActions::class => \DI\autowire(),
            // EventActions::class => \DI\autowire(),
            // UserSettingsActions::class => \DI\autowire(),

            // === CONTROLLERS ===
            AuthController::class => \DI\autowire(),
            PortfolioController::class => \DI\autowire(),
            StockController::class => \DI\autowire(),
            TransactionController::class => \DI\autowire(),
            UserController::class => \DI\autowire(),
            WatchlistController::class => \DI\autowire(),
            // TODO: Add these controllers when implementing Phase 4 features
            // AchievementController::class => \DI\autowire(),
            // LeaderboardController::class => \DI\autowire(),
            // EventController::class => \DI\autowire(),
            // UserSettingsController::class => \DI\autowire(),

            // === MIDDLEWARE ===
            JwtAuthMiddleware::class => \DI\autowire(),
        ]);

        return $containerBuilder->build();
    }
}
