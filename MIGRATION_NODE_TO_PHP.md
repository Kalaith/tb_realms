# Migration Document: Tradeborn Realms Node.js to PHP Backend

## Executive Summary

This document outlines the migration strategy for converting the Tradeborn Realms backend from Node.js/TypeScript/Express/MongoDB to PHP/Slim Framework/Eloquent ORM/MySQL, following the architecture patterns established in the Mytherra project.

## Current State Analysis

### Node.js Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **Middleware**: CORS, Helmet, Morgan, Rate Limiting
- **Structure**: Actions/Controllers pattern with MCP integration
- **Testing**: Vitest with coverage
- **Logging**: Winston with security logging

**Note**: The target implementation will completely replace MongoDB with MySQL to match Mytherra's architecture.

### Key Dependencies
```json
{
  "express": "^5.1.0",
  "mongoose": "^8.13.2",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1",
  "zod": "^3.24.3",
  "winston": "^3.17.0"
}
```

## Target Architecture (PHP)

### Framework and Libraries
- **Framework**: Slim Framework 4.x (PSR-7/PSR-15 compliant)
- **Database**: MySQL with Illuminate Database (Eloquent ORM) - Capsule Manager
- **Authentication**: JWT with PHP's password_hash/password_verify
- **Dependency Injection**: PHP-DI 7.x
- **Database Service**: Custom DatabaseService singleton with PDO + Eloquent
- **Schema Management**: Custom migration system using Eloquent Schema Builder
- **Logging**: Monolog (integrated through custom Logger utility)
- **Environment**: vlucas/phpdotenv
- **Response Handling**: ApiResponseTrait for consistent JSON responses

### Target Dependencies (Composer)
```json
{
  "slim/slim": "^4.0",
  "slim/psr7": "^1.5",
  "illuminate/database": "^10.0",
  "vlucas/phpdotenv": "^5.0",
  "monolog/monolog": "^3.0",
  "php-di/php-di": "^7.0",
  "firebase/php-jwt": "^6.0",
  "ramsey/uuid": "^4.0",
  "nyholm/psr7": "^1.8"
}
```

## Migration Plan

### Phase 1: Project Structure Setup

#### 1.1 Directory Structure Migration
```
backend/
├── composer.json                 # Replace package.json
├── phpunit.xml                   # Replace vitest.config.ts
├── public/
│   └── index.php                 # Main entry point - replaces server.ts
├── src/
│   ├── Actions/                  # Business logic - migrate from src/actions/
│   │   ├── AchievementActions.php
│   │   ├── AuthActions.php
│   │   ├── EventActions.php
│   │   ├── LeaderboardActions.php
│   │   ├── PortfolioActions.php
│   │   ├── StockActions.php
│   │   └── UserSettingsActions.php
│   ├── Controllers/              # HTTP handlers - migrate from src/controllers/
│   │   ├── AchievementController.php
│   │   ├── AuthController.php
│   │   ├── EventController.php
│   │   ├── LeaderboardController.php
│   │   ├── PortfolioController.php
│   │   ├── StockController.php
│   │   └── UserSettingsController.php
│   ├── Models/                   # Eloquent models - migrate from src/models/ + src/entities/
│   │   ├── User.php              # With createTable() method
│   │   ├── Portfolio.php
│   │   ├── Stock.php
│   │   ├── Transaction.php
│   │   ├── Achievement.php
│   │   ├── Event.php
│   │   └── UserSettings.php
│   ├── External/                 # Data access layer (repositories)
│   │   ├── DatabaseService.php   # Singleton with PDO + Eloquent Capsule
│   │   ├── UserRepository.php
│   │   ├── PortfolioRepository.php
│   │   ├── StockRepository.php
│   │   └── TransactionRepository.php
│   ├── Routes/                   # Route definitions
│   │   └── api.php              # All API routes grouped by feature
│   ├── Utils/                    # Utilities and helpers
│   │   ├── ContainerConfig.php   # DI container configuration
│   │   └── Logger.php           # Monolog wrapper
│   ├── Traits/                   # Reusable traits
│   │   └── ApiResponseTrait.php  # Consistent API responses
│   └── Exceptions/               # Custom exceptions
│       ├── ResourceNotFoundException.php
│       └── UnauthorizedException.php
├── scripts/                      # Database management scripts
│   ├── DatabaseSchemaManager.php # Table creation and management
│   ├── GameDataSeeder.php        # Initial data seeding
│   └── initializeDatabase.php    # Main initialization script
├── storage/
│   └── logs/                     # Application logs
└── tests/                        # PHPUnit tests
    ├── Feature/                  # Feature tests
    └── Unit/                     # Unit tests
```

#### 1.2 Environment Configuration
```bash
# .env configuration (following Mytherra pattern)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tradeborn_realms
DB_USER=root
DB_PASSWORD=

JWT_SECRET=your_jwt_secret_key_here
APP_ENV=development
APP_DEBUG=true
LOG_LEVEL=debug

# Optional: Preview environment support
# APP_ENV=preview (for subdirectory deployment)
```

### Phase 2: Database Architecture Migration

#### 2.1 Database Service Setup (Following Mytherra Pattern)

**DatabaseService Singleton:**
```php
// src/External/DatabaseService.php
class DatabaseService {
    private static $instance = null;
    private $pdo = null;
    private $capsule = null;

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function createDatabaseIfNotExists(): void {
        $dbName = $_ENV['DB_NAME'] ?? 'tradeborn_realms';
        // Creates database with utf8mb4_unicode_ci collation
    }

    public function clearDatabase(bool $dropTables = false): void {
        // Handles foreign key constraints and table dependencies
    }
}
```

#### 2.2 Schema Creation with Eloquent Models

**Following Mytherra's Model Pattern:**
```php
// Each model includes createTable() method for schema definition
class User extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;
    
    public static function createTable()
    {
        if (!Schema::schema()->hasTable('users')) {
            Schema::schema()->create('users', function (Blueprint $table) {
                $table->string('id')->primary();
                $table->string('email')->unique();
                $table->string('username')->unique();
                $table->string('password');
                $table->string('first_name')->nullable();
                $table->string('last_name')->nullable();
                $table->text('avatar_url')->nullable();
                $table->enum('role', ['user', 'admin', 'moderator'])->default('user');
                $table->decimal('starting_balance', 15, 2)->default(10000.00);
                $table->boolean('is_active')->default(true);
                $table->timestamp('last_login_at')->nullable();
                $table->timestamp('email_verified_at')->nullable();
                $table->timestamps();
            });
        }
    }
}
```

#### 2.3 Core Database Tables

**Users Table:**
```php
// src/Models/User.php - createTable() method
Schema::schema()->create('users', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('email')->unique();
    $table->string('username')->unique();
    $table->string('password');
    $table->string('first_name')->nullable();
    $table->string('last_name')->nullable();
    $table->text('avatar_url')->nullable();
    $table->enum('role', ['user', 'admin', 'moderator'])->default('user');
    $table->decimal('starting_balance', 15, 2)->default(10000.00);
    $table->boolean('is_active')->default(true);
    $table->timestamp('last_login_at')->nullable();
    $table->timestamp('email_verified_at')->nullable();
    $table->timestamps();
});
```

**Portfolios Table:**
```php
// src/Models/Portfolio.php - createTable() method
Schema::schema()->create('portfolios', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('user_id');
    $table->decimal('cash_balance', 15, 2)->default(0);
    $table->decimal('total_value', 15, 2)->default(0);
    $table->decimal('total_invested', 15, 2)->default(0);
    $table->decimal('total_profit_loss', 15, 2)->default(0);
    $table->decimal('performance_percentage', 8, 4)->default(0);
    $table->enum('risk_level', ['conservative', 'moderate', 'aggressive'])->default('moderate');
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->index('user_id');
});
```

**Stocks Table:**
```php
// src/Models/Stock.php - createTable() method
Schema::schema()->create('stocks', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('symbol')->unique();
    $table->string('name');
    $table->text('description')->nullable();
    $table->string('guild')->nullable();
    $table->string('category')->nullable();
    $table->decimal('current_price', 10, 4);
    $table->decimal('previous_close', 10, 4)->nullable();
    $table->decimal('day_change', 10, 4)->default(0);
    $table->decimal('day_change_percentage', 8, 4)->default(0);
    $table->bigInteger('market_cap')->nullable();
    $table->bigInteger('volume')->default(0);
    $table->bigInteger('avg_volume')->default(0);
    $table->decimal('pe_ratio', 8, 2)->nullable();
    $table->decimal('dividend_yield', 6, 4)->nullable();
    $table->decimal('beta', 6, 4)->nullable();
    $table->decimal('week_52_high', 10, 4)->nullable();
    $table->decimal('week_52_low', 10, 4)->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamp('last_updated')->useCurrent();
    $table->timestamps();
    
    $table->index('symbol');
    $table->index('guild');
    $table->index('category');
});
```

**Transactions Table:**
```php
// src/Models/Transaction.php - createTable() method
Schema::schema()->create('transactions', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('user_id');
    $table->string('portfolio_id');
    $table->string('stock_id');
    $table->enum('type', ['buy', 'sell']);
    $table->integer('quantity');
    $table->decimal('price_per_share', 10, 4);
    $table->decimal('total_amount', 15, 2);
    $table->decimal('fees', 8, 2)->default(0);
    $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
    $table->timestamps();
    
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('portfolio_id')->references('id')->on('portfolios')->onDelete('cascade');
    $table->foreign('stock_id')->references('id')->on('stocks')->onDelete('cascade');
    $table->index(['user_id', 'portfolio_id']);
    $table->index('stock_id');
    $table->index('type');
    $table->index('status');
});
```

#### 2.4 Database Initialization Script

**Following Mytherra's DatabaseSchemaManager Pattern:**
```php
// scripts/DatabaseSchemaManager.php
class DatabaseSchemaManager
{
    public function initializeDatabase(): void
    {
        $this->db->createDatabaseIfNotExists();
        $this->db->clearDatabase(true); // DROP tables if they exist
    }

    public function createTables(): void
    {
        $this->loadModelFiles();
        $this->createTablesInOrder();
    }

    private function createTablesInOrder(): void
    {
        // Create tables in dependency order
        $tableOrder = [
            'User',           // Base user table
            'Stock',          // Base stock table
            'Portfolio',      // Depends on User
            'Transaction',    // Depends on User, Portfolio, Stock
            'Achievement',    // Base achievement table
            'UserAchievement', // Bridge table for user achievements
            'Event',          // Market events
            'UserSettings'    // User preferences
        ];

        foreach ($tableOrder as $model) {
            $modelClass = "App\\Models\\{$model}";
            $modelClass::createTable();
        }
    }
}
```

#### 2.5 Data Migration Strategy
1. **Export Current Data**: Use MongoDB export tools to extract existing data
2. **Transform Data**: Create PHP scripts to convert MongoDB documents to MySQL records
3. **Import Data**: Use Eloquent models to insert transformed data
4. **Validate Migration**: Compare record counts and key relationships
5. **Create Rollback Scripts**: Backup procedures for quick reversion

### Phase 3: Core Application Migration

#### 3.1 Authentication System Migration

**From TypeScript/JWT:**
```typescript
// src/actions/auth/authActions.ts
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const user = await User.findOne({ email: credentials.email }).select('+password');
  if (!user || !(await user.comparePassword(credentials.password))) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
  return { user: user.toObject(), token };
};
```

**To PHP/Slim (Following Mytherra Pattern):**
```php
// src/Actions/AuthActions.php
class AuthActions
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function loginUser(array $credentials): array
    {
        $user = $this->userRepository->findByEmail($credentials['email']);
        
        if (!$user || !password_verify($credentials['password'], $user->password)) {
            throw new UnauthorizedException('Invalid credentials');
        }
        
        $payload = [
            'user_id' => $user->id,
            'role' => $user->role,
            'exp' => time() + (24 * 60 * 60)
        ];
        
        $token = JWT::encode($payload, $_ENV['JWT_SECRET'], 'HS256');
        
        return [
            'user' => $user->toArray(),
            'token' => $token
        ];
    }
}
```

#### 3.2 Model Migration Examples

**User Model (Following Mytherra Pattern):**
```php
// src/Models/User.php
class User extends Model
{
    protected $table = 'users';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'id', 'email', 'username', 'password', 'first_name', 
        'last_name', 'avatar_url', 'role', 'starting_balance',
        'is_active', 'last_login_at', 'email_verified_at'
    ];
    
    protected $hidden = ['password'];
    
    protected $casts = [
        'is_active' => 'boolean',
        'starting_balance' => 'decimal:2',
        'last_login_at' => 'datetime',
        'email_verified_at' => 'datetime'
    ];

    public static function createTable()
    {
        if (!Schema::schema()->hasTable('users')) {
            Schema::schema()->create('users', function (Blueprint $table) {
                // Table definition here
            });
        }
    }
    
    // Relationships
    public function portfolio()
    {
        return $this->hasOne(Portfolio::class);
    }
    
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
    
    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
                    ->withPivot(['earned_at', 'progress'])
                    ->withTimestamps();
    }
}
```

**Repository Pattern (Following Mytherra's External/ Structure):**
```php
// src/External/UserRepository.php
class UserRepository
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findById(string $id): ?User
    {
        return User::find($id);
    }

    public function createUser(array $userData): User
    {
        if (!isset($userData['id'])) {
            $userData['id'] = 'user-' . uniqid();
        }
        
        $userData['password'] = password_hash($userData['password'], PASSWORD_DEFAULT);
        
        return User::create($userData);
    }
}
```

#### 3.3 Controller Migration Pattern (Following Mytherra's ApiResponseTrait)

**From Express Controller:**
```typescript
export const getPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const portfolio = await getPortfolioData(userId);
    res.json(createSuccessResponse(portfolio));
  } catch (error) {
    next(error);
  }
};
```

**To Slim Controller (Mytherra Pattern):**
```php
// src/Controllers/PortfolioController.php
class PortfolioController
{
    use ApiResponseTrait;
    
    public function __construct(
        private PortfolioActions $portfolioActions
    ) {}
    
    public function getPortfolio(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->portfolioActions->getPortfolioData(
                $request->getAttribute('user_id')
            ),
            'getting portfolio data',
            'Portfolio not found'
        );
    }
}
```

**ApiResponseTrait Implementation:**
```php
// src/Traits/ApiResponseTrait.php
trait ApiResponseTrait
{
    protected function handleApiAction(
        Response $response,
        callable $action,
        string $errorContext,
        ?string $notFoundMessage = null,
        int $successStatus = 200
    ): Response {
        try {
            $result = $action();
            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $result
            ], $successStatus);
        } catch (ResourceNotFoundException $error) {
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => $notFoundMessage ?? 'Resource not found'
            ], 200);
        } catch (\Exception $error) {
            error_log("Error {$errorContext}: " . $error->getMessage());
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }
}
```

### Phase 4: Feature-Specific Migrations

#### 4.1 Stock Trading System
- **Price Updates**: Convert MongoDB aggregation pipelines to Eloquent query builder
- **Transaction Processing**: Implement MySQL transactions using Eloquent's DB::transaction()
- **Portfolio Calculations**: Migrate complex calculations to PHP with proper decimal handling
- **Real-time Updates**: Implement WebSocket or polling mechanisms for live price updates

#### 4.2 Achievement System  
- **Progress Tracking**: Convert MongoDB embedded documents to pivot tables (user_achievements)
- **Achievement Logic**: Migrate TypeScript business logic to PHP Actions
- **Trigger Events**: Implement achievement checking in relevant Actions classes

#### 4.3 Event System
- **Market Events**: Convert event generation algorithms to PHP
- **Event Impact**: Migrate stock price manipulation logic
- **Notification System**: Implement event-driven notifications using database triggers or queues

#### 4.4 Leaderboard System
- **Ranking Calculations**: Convert MongoDB aggregation to SQL queries with rankings
- **Performance Metrics**: Migrate complex portfolio analytics to MySQL stored procedures or PHP calculations
- **Caching**: Implement Redis caching for frequently accessed leaderboard data

#### 4.5 Route Definition (Following Mytherra's api.php Pattern)

**Routes Structure:**
```php
// src/Routes/api.php
$app->group('/api', function (RouteCollectorProxy $group) {
    // Authentication routes
    $group->post('/auth/register', [AuthController::class, 'register']);
    $group->post('/auth/login', [AuthController::class, 'login']);
    $group->get('/auth/me', [AuthController::class, 'getCurrentUser']);
    
    // Portfolio routes
    $group->get('/portfolio', [PortfolioController::class, 'getPortfolio']);
    $group->post('/portfolio/reset', [PortfolioController::class, 'resetPortfolio']);
    
    // Stock routes
    $group->get('/stocks', [StockController::class, 'getAllStocks']);
    $group->get('/stocks/{id}', [StockController::class, 'getStockById']);
    $group->get('/stocks/{id}/history', [StockController::class, 'getStockHistory']);
    
    // Transaction routes
    $group->post('/transactions/buy', [TransactionController::class, 'buyStock']);
    $group->post('/transactions/sell', [TransactionController::class, 'sellStock']);
    $group->get('/transactions', [TransactionController::class, 'getTransactions']);
    
    // Achievement routes
    $group->get('/achievements', [AchievementController::class, 'getUserAchievements']);
    $group->get('/achievements/all', [AchievementController::class, 'getAllAchievements']);
    
    // Leaderboard routes
    $group->get('/leaderboard', [LeaderboardController::class, 'getLeaderboard']);
    $group->get('/leaderboard/friends', [LeaderboardController::class, 'getFriendsLeaderboard']);
    
    // Event routes
    $group->get('/events', [EventController::class, 'getActiveEvents']);
    $group->get('/events/history', [EventController::class, 'getEventHistory']);
});
```

#### 4.6 Dependency Injection Container (Following Mytherra's ContainerConfig)

**Container Configuration:**
```php
// src/Utils/ContainerConfig.php
class ContainerConfig
{
    public static function createContainer(): Container
    {
        $containerBuilder = new ContainerBuilder();
        
        $containerBuilder->addDefinitions([
            // Database
            DatabaseService::class => fn() => DatabaseService::getInstance(),
            
            // Repositories
            UserRepository::class => DI\autowire(),
            PortfolioRepository::class => DI\autowire(),
            StockRepository::class => DI\autowire(),
            TransactionRepository::class => DI\autowire(),
            
            // Actions
            AuthActions::class => DI\autowire(),
            PortfolioActions::class => DI\autowire(),
            StockActions::class => DI\autowire(),
            TransactionActions::class => DI\autowire(),
            
            // Controllers
            AuthController::class => DI\autowire(),
            PortfolioController::class => DI\autowire(),
            StockController::class => DI\autowire(),
            TransactionController::class => DI\autowire(),
        ]);
        
        return $containerBuilder->build();
    }
}
```

### Phase 5: API Integration and Testing

#### 5.1 API Compatibility
- Maintain existing API endpoint structure
- Ensure response format consistency
- Implement same validation rules

#### 5.2 Testing Migration (Following PHPUnit Patterns)

**Feature Test Example:**
```php
// tests/Feature/AuthTest.php
class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Initialize test database
        $this->initTestDatabase();
    }

    public function testUserRegistration()
    {
        $userData = [
            'email' => 'test@example.com',
            'username' => 'testuser',
            'password' => 'password123',
            'first_name' => 'Test',
            'last_name' => 'User'
        ];

        $response = $this->postJson('/api/auth/register', $userData);

        $this->assertEquals(201, $response->getStatusCode());
        $responseData = json_decode($response->getBody(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('token', $responseData['data']);
        $this->assertArrayHasKey('user', $responseData['data']);
    }

    public function testUserLogin()
    {
        // Create test user
        $user = $this->createTestUser([
            'email' => 'test@example.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT)
        ]);
        
        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);
        
        $this->assertEquals(200, $response->getStatusCode());
        $responseData = json_decode($response->getBody(), true);
        $this->assertTrue($responseData['success']);
        $this->assertArrayHasKey('token', $responseData['data']);
    }

    private function createTestUser(array $data): User
    {
        return User::create(array_merge([
            'id' => 'test-user-' . uniqid(),
            'username' => 'testuser',
            'email' => 'test@example.com',
            'password' => password_hash('password123', PASSWORD_DEFAULT)
        ], $data));
    }
}
```

**Unit Test Example:**
```php
// tests/Unit/PortfolioActionsTest.php
class PortfolioActionsTest extends TestCase
{
    private PortfolioActions $portfolioActions;
    private MockObject $portfolioRepository;

    protected function setUp(): void
    {
        parent::setUp();
        $this->portfolioRepository = $this->createMock(PortfolioRepository::class);
        $this->portfolioActions = new PortfolioActions($this->portfolioRepository);
    }

    public function testCalculatePortfolioValue()
    {
        $mockPortfolio = $this->createMockPortfolio();
        
        $this->portfolioRepository
            ->expects($this->once())
            ->method('findById')
            ->with('portfolio-123')
            ->willReturn($mockPortfolio);

        $result = $this->portfolioActions->calculatePortfolioValue('portfolio-123');
        
        $this->assertIsArray($result);
        $this->assertArrayHasKey('total_value', $result);
        $this->assertArrayHasKey('profit_loss', $result);
    }
}
```

## Risk Mitigation

### Data Integrity
- **Validation**: Implement comprehensive input validation
- **Constraints**: Add database constraints and foreign keys
- **Backup**: Create backup procedures before migration

### Performance Considerations
- **Indexing**: Optimize database indexes for query patterns
- **Caching**: Implement Redis caching for frequently accessed data
- **Query Optimization**: Profile and optimize database queries

### Security
- **SQL Injection**: Use parameterized queries exclusively
- **Authentication**: Implement JWT middleware for all protected routes
- **Input Sanitization**: Validate and sanitize all user inputs

## Implementation Timeline

### Week 1-2: Foundation Setup
- Set up PHP project structure following Mytherra patterns
- Configure development environment with MySQL
- Create DatabaseService singleton and database initialization scripts
- Set up Composer dependencies and autoloading
- Implement basic ContainerConfig with DI

### Week 3-4: Core Infrastructure  
- Create all Eloquent models with createTable() methods
- Implement DatabaseSchemaManager for table creation
- Set up ApiResponseTrait and exception handling
- Create basic repository pattern following External/ structure
- Implement authentication Actions and Controllers

### Week 5-6: Trading System Core
- Migrate stock management system
- Implement portfolio system with proper decimal handling
- Create transaction processing with MySQL transactions
- Set up stock price update mechanisms
- Implement basic portfolio calculations

### Week 7-8: Advanced Features
- Migrate achievement system with pivot tables
- Implement market event system
- Create leaderboard functionality with SQL rankings
- Set up user settings and preferences
- Implement data seeding scripts

### Week 9-10: Testing and Optimization
- Comprehensive PHPUnit testing (Feature + Unit tests)
- Performance optimization and query tuning
- Database indexing optimization
- API endpoint testing and validation
- Documentation updates and deployment preparation

## Post-Migration Tasks

1. **Performance Monitoring**: Set up application performance monitoring
2. **Error Tracking**: Implement error logging and tracking
3. **Documentation**: Update API documentation
4. **Deployment**: Configure production environment
5. **Training**: Team training on PHP/Slim architecture

## Success Criteria

- [ ] All existing API endpoints functional with same response format
- [ ] Complete data migration from MongoDB to MySQL with data integrity
- [ ] Performance meets or exceeds current Node.js benchmarks
- [ ] All PHPUnit tests passing (Feature and Unit tests)
- [ ] Security standards maintained (JWT auth, input validation, SQL injection prevention)
- [ ] Database follows Mytherra architectural patterns
- [ ] ApiResponseTrait provides consistent error handling
- [ ] Repository pattern properly implemented in External/ directory
- [ ] Models include createTable() methods for schema management
- [ ] DatabaseService singleton properly configured
- [ ] Documentation updated to reflect new PHP architecture

## Rollback Plan

1. **Database Backup**: Maintain MongoDB backup before migration starts
2. **Version Control**: Tag Node.js version before any PHP changes
3. **Parallel Deployment**: Run both Node.js and PHP systems in parallel during transition
4. **Data Export Scripts**: Create MySQL to MongoDB export scripts for emergency rollback
5. **Environment Switching**: Maintain ability to switch between Node.js and PHP backends via environment configuration
6. **Quick Rollback Procedure**: Documented step-by-step process to revert to Node.js version within 15 minutes

---

*This migration document has been updated to follow the exact architectural patterns established in the Mytherra project, ensuring consistency with the DatabaseService singleton, Eloquent Capsule Manager, ApiResponseTrait, and External/ repository structure. The migration maintains all core Tradeborn Realms functionality while adopting proven PHP patterns.*
