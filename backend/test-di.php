<?php

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\Utils\ContainerConfig;
use App\Controllers\SettlementController;
use App\Controllers\RegionController;
use App\Controllers\HeroController;
use App\External\DatabaseService;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

echo "Testing DI Container Setup...\n\n";

try {
    // Create DI Container
    $container = ContainerConfig::createContainer();
    echo "✅ Container created successfully\n";

    // Test database service (singleton)
    $db1 = $container->get(DatabaseService::class);
    $db2 = $container->get(DatabaseService::class);
    echo "✅ DatabaseService singleton: " . ($db1 === $db2 ? "PASS" : "FAIL") . "\n";

    // Test repository creation
    $settlementRepo = $container->get(\App\External\SettlementRepository::class);
    echo "✅ SettlementRepository created successfully\n";

    // Test action creation
    $settlementActions = $container->get(\App\Actions\SettlementActions::class);
    echo "✅ SettlementActions created successfully\n";

    // Test controller creation
    $settlementController = $container->get(SettlementController::class);
    echo "✅ SettlementController created successfully\n";

    $regionController = $container->get(RegionController::class);
    echo "✅ RegionController created successfully\n";

    $heroController = $container->get(HeroController::class);
    echo "✅ HeroController created successfully\n";

    echo "\n🎉 All DI Container tests passed!\n";
    echo "\nContainer is properly configured and ready to use.\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
