<?php
// Debug script to test the betting API endpoint
// Run this from the backend directory: php debug_bet_api.php

// Set up the test environment like the unit tests
define('TEST_MODE', true);

require_once __DIR__ . '/vendor/autoload.php';

use Slim\Factory\AppFactory;
use Dotenv\Dotenv;
use App\External\DatabaseService;
use App\Controllers\BettingController;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Slim\Psr7\Factory\ServerRequestFactory;
use Slim\Psr7\Response as SlimResponse;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

// Add required environment variables
$required_env_vars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
foreach ($required_env_vars as $var) {
    if (!isset($_ENV[$var])) {
        throw new \RuntimeException("Missing required environment variable: {$var}");
    }
}

// Create a mock request for GET /api/bets/bet-001
$requestFactory = new ServerRequestFactory();
$request = $requestFactory->createServerRequest('GET', '/api/bets/bet-001')
    ->withHeader('Accept', 'application/json');

// Create a response object
$response = new SlimResponse();

// Create controller and call the method
$controller = new BettingController();

// Call the method with the bet ID in args
$args = ['id' => 'bet-001'];
$result = $controller->getDivineBetById($request, $response, $args);

// Get the response body
$body = (string)$result->getBody();
echo "API Response:\n";
echo $body . "\n";

// Parse and analyze
$data = json_decode($body, true);
echo "\nParsed JSON:\n";
print_r($data);

if (isset($data['data'])) {
    echo "\nBet data found: " . json_encode($data['data']) . "\n";
    if (isset($data['data']['id'])) {
        echo "Bet ID: " . $data['data']['id'] . "\n";
    } else {
        echo "No 'id' field in bet data\n";
    }
} else {
    echo "\nNo 'data' field in response\n";
}
