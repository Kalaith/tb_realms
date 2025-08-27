#!/usr/bin/env php
<?php

echo "=== Mytherra PHP Backend Installation ===\n\n";

// Check PHP version
if (version_compare(PHP_VERSION, '8.1.0') < 0) {
    echo "❌ PHP 8.1 or higher is required. Current version: " . PHP_VERSION . "\n";
    exit(1);
}
echo "✅ PHP version check passed (" . PHP_VERSION . ")\n";

// Check if composer is available
$composerPath = exec('where composer 2>nul') ?: exec('which composer 2>/dev/null');
if (empty($composerPath)) {
    echo "❌ Composer is not installed or not in PATH\n";
    echo "Please install Composer from https://getcomposer.org/\n";
    exit(1);
}
echo "✅ Composer found: {$composerPath}\n";

// Install dependencies
echo "\n📦 Installing dependencies...\n";
$output = [];
$returnCode = 0;
exec('composer install --no-dev --optimize-autoloader 2>&1', $output, $returnCode);

if ($returnCode !== 0) {
    echo "❌ Failed to install dependencies:\n";
    echo implode("\n", $output) . "\n";
    exit(1);
}
echo "✅ Dependencies installed successfully\n";

// Create .env file if it doesn't exist
if (!file_exists(__DIR__ . '/.env')) {
    echo "\n⚙️  Creating .env file...\n";
    if (copy(__DIR__ . '/.env.example', __DIR__ . '/.env')) {
        echo "✅ .env file created from .env.example\n";
        echo "📝 Please update the database credentials in .env file\n";
    } else {
        echo "❌ Failed to create .env file\n";
        exit(1);
    }
} else {
    echo "✅ .env file already exists\n";
}

echo "\n🎯 Installation completed!\n\n";
echo "Next steps:\n";
echo "1. Update database credentials in .env file\n";
echo "2. Run: php scripts/seedDb.php (to seed the database)\n";
echo "3. Run: composer start (to start the development server)\n";
echo "\nThe server will be available at http://localhost:5002\n";
