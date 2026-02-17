<?php

$autoloadCandidates = [
    __DIR__ . '/../vendor/autoload.php',      // local backend/vendor
    __DIR__ . '/../../vendor/autoload.php',   // project-level vendor
    __DIR__ . '/../../../vendor/autoload.php',// central vendor (e.g. htdocs/vendor)
    __DIR__ . '/../../../../vendor/autoload.php',
];

$autoloadPath = null;
foreach ($autoloadCandidates as $candidate) {
    if (file_exists($candidate)) {
        $autoloadPath = $candidate;
        break;
    }
}

if ($autoloadPath === null) {
    throw new RuntimeException('Composer autoload.php not found in expected locations from ' . __DIR__);
}

$loader = require_once $autoloadPath;

// Ensure project-local classes are resolvable even when using a shared central vendor autoloader.
$appSrcPath = realpath(__DIR__ . '/../src');
if ($appSrcPath !== false) {
    if ($loader instanceof \Composer\Autoload\ClassLoader) {
        $loader->addPsr4('App\\', $appSrcPath . DIRECTORY_SEPARATOR, true);
    }

    spl_autoload_register(function (string $class) use ($appSrcPath): void {
        $prefix = 'App\\';
        if (strncmp($class, $prefix, strlen($prefix)) !== 0) {
            return;
        }

        $relativeClass = substr($class, strlen($prefix));
        $file = $appSrcPath . DIRECTORY_SEPARATOR . str_replace('\\', DIRECTORY_SEPARATOR, $relativeClass) . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }, true, true);
}

use Dotenv\Dotenv;
use App\Core\Router;
use App\External\DatabaseService;
use App\Controllers\PortfolioController;
use App\Controllers\StockController;
use App\Controllers\TransactionController;
use App\Controllers\UserController;
use App\Controllers\WatchlistController;
use App\Actions\PortfolioActions;
use App\Actions\StockActions;
use App\Actions\TransactionActions;
use App\Actions\UserActions;
use App\Actions\WatchlistActions;
use App\External\UserRepository;
use App\External\PortfolioRepository;
use App\External\StockRepository;
use App\External\TransactionRepository;
use App\External\WatchlistRepository;

// Load environment variables first
$dotenv = Dotenv::createImmutable(__DIR__ . '/..');
$dotenv->safeLoad();

// Add required environment variables
$required_env_vars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
foreach ($required_env_vars as $var) {
    if (!isset($_ENV[$var])) {
        throw new \RuntimeException("Missing required environment variable: {$var}");
    }
}

// Initialize database service after environment variables are loaded
$db = DatabaseService::getInstance();

// Repositories
$userRepository = new UserRepository();
$portfolioRepository = new PortfolioRepository();
$stockRepository = new StockRepository();
$transactionRepository = new TransactionRepository();
$watchlistRepository = new WatchlistRepository();

// Actions
$portfolioActions = new PortfolioActions($portfolioRepository, $transactionRepository, $stockRepository, $userRepository);
$stockActions = new StockActions($stockRepository, $transactionRepository, $portfolioRepository);
$transactionActions = new TransactionActions($transactionRepository, $portfolioRepository, $stockRepository, $userRepository);
$userActions = new UserActions($userRepository);
$watchlistActions = new WatchlistActions($watchlistRepository, $stockRepository, $userRepository);

// Controllers
$portfolioController = new PortfolioController($portfolioActions);
$stockController = new StockController($stockActions);
$transactionController = new TransactionController($transactionActions);
$userController = new UserController($userActions);
$watchlistController = new WatchlistController($watchlistActions);

// Router
$router = new Router();

// Set base path for subdirectory deployment (preview environment)
if (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'preview') {
    $router->setBasePath('/tradeborn_realms');
} else {
    $requestPath = $_SERVER['REQUEST_URI'] ?? '';
    $requestPath = parse_url($requestPath, PHP_URL_PATH) ?? '';
    $apiPos = strpos($requestPath, '/api');
    if ($apiPos !== false) {
        $basePath = substr($requestPath, 0, $apiPos);
        if ($basePath !== '') {
            $router->setBasePath($basePath);
        }
    } elseif (isset($_SERVER['SCRIPT_NAME'])) {
        $scriptName = $_SERVER['SCRIPT_NAME'];
        $basePath = str_replace('/public/index.php', '', $scriptName);
        if ($basePath !== $scriptName && $basePath !== '') {
            $router->setBasePath($basePath);
        }
    }
}

// Handle CORS preflight
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, Accept, Origin, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    http_response_code(200);
    exit;
}

// Load routes
(require __DIR__ . '/../src/Routes/router.php')(
    $router,
    $portfolioController,
    $stockController,
    $transactionController,
    $userController,
    $watchlistController
);

// Run router
$router->handle();
