<?php

require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use App\External\DatabaseService;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

try {
    // Get database connection
    $db = DatabaseService::getInstance();
    
    // Check if divine_bets table exists
    $sql = "SHOW TABLES LIKE 'divine_bets'";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $tableExists = $stmt->fetch();
    
    if (!$tableExists) {
        echo "❌ divine_bets table does not exist\n";
        exit(1);
    }
    
    echo "✅ divine_bets table exists\n";
    
    // Check all bets in the table
    $sql = "SELECT * FROM divine_bets";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $allBets = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📊 Total bets in table: " . count($allBets) . "\n";
    
    if (count($allBets) > 0) {
        echo "📝 All bets:\n";
        foreach ($allBets as $bet) {
            echo "   - ID: {$bet['id']}, Type: {$bet['bet_type']}, Target: {$bet['target_id']}\n";
        }
    }
    
    // Try to fetch bet-001 specifically
    $sql = "SELECT * FROM divine_bets WHERE id = :id";
    $stmt = $db->prepare($sql);
    $stmt->execute([':id' => 'bet-001']);
    $bet001 = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($bet001) {
        echo "✅ bet-001 found in database:\n";
        echo json_encode($bet001, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "❌ bet-001 NOT found in database\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
