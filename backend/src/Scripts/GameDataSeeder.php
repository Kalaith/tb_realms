<?php

namespace App\Scripts;

use App\External\DatabaseService;
use App\Models\Stock;
use App\Models\User;

/**
 * Seeds initial game data into the database
 */
class GameDataSeeder
{
    private DatabaseService $db;

    public function __construct()
    {
        $this->db = DatabaseService::getInstance();
    }

    /**
     * Seed all initial data
     */
    public function seedAllData(): void
    {
        echo "Seeding initial game data...\n";
        
        $this->seedStocks();
        $this->seedSampleUser();
        
        echo "✅ Initial data seeded successfully\n";
    }

    /**
     * Seed sample stocks
     */
    private function seedStocks(): void
    {
        echo "Seeding stock data...\n";
        
        $stocksData = [
            [
                'symbol' => 'TECH',
                'name' => 'TechCorp Industries',
                'category' => 'Technology',
                'guild' => 'Innovation Guild',
                'current_price' => 125.50,
                'day_change_percentage' => 2.34,
                'market_cap' => 50000000,
                'description' => 'Leading technology company in magical automation'
            ],
            [
                'symbol' => 'MINE',
                'name' => 'Dwarven Mining Co.',
                'category' => 'Mining',
                'guild' => 'Miners Guild',
                'current_price' => 87.25,
                'day_change_percentage' => -1.45,
                'market_cap' => 25000000,
                'description' => 'Premier mining operation in the mountain regions'
            ],
            [
                'symbol' => 'HEAL',
                'name' => 'Divine Healing Arts',
                'category' => 'Healthcare',
                'guild' => 'Healers Guild',
                'current_price' => 230.75,
                'day_change_percentage' => 4.67,
                'market_cap' => 75000000,
                'description' => 'Magical healthcare and potion manufacturing'
            ],
            [
                'symbol' => 'WARD',
                'name' => 'Guardian Defense Systems',
                'category' => 'Defense',
                'guild' => 'Warriors Guild',
                'current_price' => 156.80,
                'day_change_percentage' => 1.23,
                'market_cap' => 45000000,
                'description' => 'Advanced magical defense and protection services'
            ],
            [
                'symbol' => 'ELEM',
                'name' => 'Elemental Energy Corp',
                'category' => 'Energy',
                'guild' => 'Mages Guild',
                'current_price' => 92.40,
                'day_change_percentage' => -0.89,
                'market_cap' => 35000000,
                'description' => 'Harnessing elemental forces for power generation'
            ]
        ];

        foreach ($stocksData as $stock) {
            Stock::create($stock);
        }

        echo "✅ Stock data seeded\n";
    }

    /**
     * Seed a sample user for testing
     */
    private function seedSampleUser(): void
    {
        echo "Seeding sample user...\n";
        
        User::create([
            'username' => 'demo_trader',
            'email' => 'demo@tradebornrealms.com',
            'password' => password_hash('demo123', PASSWORD_DEFAULT),
            'starting_balance' => 10000.00
        ]);

        echo "✅ Sample user created (username: demo_trader, password: demo123)\n";
    }
}