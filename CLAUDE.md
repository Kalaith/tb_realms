# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tradeborn Realms is a fantasy trading simulation web application built with a modern full-stack architecture:
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: PHP 8.1+ + Slim Framework + Eloquent ORM + MySQL
- **Authentication**: JWT-based with Auth0 integration support

The application simulates a fantasy stock market where players trade shares in guilds, magical commodities, mythical beasts, and empire bonds.

## Common Development Commands

### Frontend Development (from `frontend/` directory)
```bash
# Install dependencies
npm install

# Start development server (runs on port 5173)
npm run dev

# Build for production
npm run build

# Run linting and fix errors
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check

# Run tests
npm run test          # Watch mode
npm run test:run      # Run once
npm run test:coverage # With coverage

# Type checking
npm run type-check

# Complete CI pipeline
npm run ci            # lint + type-check + format + test + build
npm run ci:quick      # lint + type-check + format (no tests)

# Preview production build
npm run preview
```

### Backend Development (from `backend/` directory)
```bash
# Install PHP dependencies
composer install

# Start development server (runs on port 5002)
composer run start
# OR directly:
php -S localhost:5002 -t public

# Run tests
composer run test

# Test setup and initialization
composer run test:setup
composer run test:init
```

### Project Deployment
```bash
# Deploy to preview environment (H:\xampp\htdocs)
.\publish.ps1

# Deploy to production (F:\WebHatchery)
.\publish.ps1 -Production

# Deploy only frontend
.\publish.ps1 -Frontend

# Deploy only backend
.\publish.ps1 -Backend

# Clean deploy with verbose output
.\publish.ps1 -All -Clean -Verbose
```

## Architecture Overview

### Frontend Architecture
- **React 19**: Modern React with latest features and TypeScript integration
- **Vite**: Fast build tool with HMR (Hot Module Replacement)
- **Tailwind CSS 4.x**: Utility-first styling with Vite plugin integration
- **API Services**: Centralized service classes extending `BaseApiService`
- **Type Safety**: Comprehensive TypeScript interfaces in `entities/` directory
- **Authentication**: Context-based auth with JWT token management

### Backend Architecture (Actions Pattern)
The backend follows a strict separation of concerns using the Actions Pattern:

1. **Controllers** (`src/Controllers/`): Handle HTTP requests/responses only
   - `AuthController.php` - Authentication endpoints
   - `StockController.php` - Market data endpoints
   - `PortfolioController.php` - User portfolio management
   - `TransactionController.php` - Trading operations

2. **Actions** (`src/Actions/`): Contains all business logic and state mutations
   - `AuthActions.php` - User authentication business logic
   - `StockActions.php` - Market data processing
   - `PortfolioActions.php` - Portfolio calculations and updates
   - `TransactionActions.php` - Trade execution logic

3. **Models** (`src/Models/`): Eloquent ORM models for database interactions
   - `User.php` - User account management
   - `Stock.php` - Market asset definitions
   - `Portfolio.php` - User portfolio state
   - `Transaction.php` - Trading history

4. **Repositories** (`src/External/`): Data access abstraction layer
   - `UserRepository.php` - User data operations
   - `StockRepository.php` - Market data access
   - `PortfolioRepository.php` - Portfolio data management

5. **Middleware** (`src/Middleware/`): Request processing
   - `JwtAuthMiddleware.php` - JWT token validation
   - `CorsMiddleware.php` - Cross-origin request handling

### Key Architectural Patterns

#### API Service Pattern (Frontend)
All API interactions follow a standardized pattern using `BaseApiService`:

```typescript
// Services extend BaseApiService for consistency
export class StockService extends BaseApiService<Stock> {
  constructor() {
    super('stocks', mockData);
  }

  // Custom methods follow the same response patterns
  async getMarketData(): Promise<ApiResponse<MarketData>> {
    // Implementation uses standard error handling
  }
}
```

#### Authentication Flow
1. User submits credentials via `LoginForm` or `RegisterForm`
2. `AuthController` validates request and delegates to `AuthActions`
3. `AuthActions` verifies credentials and generates JWT token
4. Frontend stores token in localStorage via `AuthContext`
5. Subsequent requests include token via axios interceptor
6. `JwtAuthMiddleware` validates tokens on protected routes

#### Database Schema
- **Users**: Authentication and profile data
- **Stocks**: Market assets with pricing data
- **Portfolios**: User account balances and holdings
- **Transactions**: Trading history and audit trail
- **Watchlists**: User-selected stocks for monitoring
- **Achievements**: Gamification and progress tracking

## Configuration and Environment

### Frontend Environment Variables
- **Development**: Uses `.env.preview` for local development
- **Production**: Uses `.env.production` for production builds
- **API Integration**: `VITE_API_URL` points to backend server
- **Base Path**: `VITE_BASE_PATH` configures routing for subdirectory deployment

### Backend Environment Variables
- **Database**: MySQL connection parameters (`DB_*` variables)
- **Authentication**: JWT secret key configuration
- **CORS**: Allowed origins for cross-origin requests
- **Environment**: `APP_ENV` for environment-specific behavior

### Deployment Modes
The project supports two deployment modes via the `publish.ps1` script:

1. **Subfolder Deployment** (default): Deploys to `/tb_realms/` subdirectory
2. **Root Deployment**: Set `DEPLOY_TO_ROOT=true` in `.env` for root deployment

## Testing Strategy

### Frontend Testing
- **Vitest**: Unit testing framework with jsdom environment
- **React Testing Library**: Component testing utilities
- **Coverage**: Code coverage reporting with v8 provider
- **TypeScript**: Compile-time error checking

### Backend Testing
- **PHPUnit**: Unit and integration testing framework
- **Mock Data**: Comprehensive test data fixtures
- **Database**: Separate testing database configuration
- **CI Integration**: Automated testing in deployment pipeline

## Security Features

### Authentication Security
- **Password Hashing**: bcrypt with PHP `password_hash()`
- **JWT Tokens**: HS256 algorithm with 24-hour expiration
- **Token Validation**: Middleware-based request authentication
- **User Verification**: Account status and role checking

### API Security
- **CORS Configuration**: Restricts allowed origins
- **Input Validation**: Server-side request validation
- **Error Handling**: Secure error messages without information leakage
- **Authorization**: Role-based access control

## Development Workflow

### Local Development Setup
1. **Backend Setup**:
   - Run `composer install` in `backend/`
   - Copy `.env.example` to `.env` and configure database
   - Start server with `composer run start`

2. **Frontend Setup**:
   - Run `npm install` in `frontend/`
   - Start development server with `npm run dev`

3. **Database**:
   - Create MySQL database
   - Run initialization scripts if available

### Code Quality Standards
- **TypeScript**: Strict mode enabled, no `any` types allowed
- **ESLint**: Enforced linting rules with automatic fixing
- **Prettier**: Consistent code formatting
- **PHP Standards**: PSR-12 coding standards (based on Copilot instructions)
- **Testing**: Comprehensive test coverage required

### Git Workflow
- **Main Branch**: `master` (production-ready code)
- **Development**: Feature branches from `master`
- **Pull Requests**: Required for all changes with code review
- **CI/CD**: Automated testing and deployment pipeline

## Key Files and Directories

### Frontend Structure
```
frontend/src/
├── api/              # API service classes
├── components/       # React components
│   ├── auth/        # Authentication UI
│   ├── game/        # Game-specific components
│   └── ui/          # Reusable UI components
├── contexts/        # React Context providers
├── entities/        # TypeScript type definitions
├── pages/           # Page components
└── utils/           # Utility functions
```

### Backend Structure
```
backend/src/
├── Actions/         # Business logic layer
├── Controllers/     # HTTP request handlers
├── Models/          # Eloquent ORM models
├── External/        # Repository pattern implementations
├── Middleware/      # Request processing middleware
├── Routes/          # API routing definitions
└── Utils/           # Helper classes and utilities
```

### Configuration Files
- `frontend/vite.config.ts` - Vite build configuration
- `frontend/package.json` - Node.js dependencies and scripts
- `backend/composer.json` - PHP dependencies and scripts
- `backend/public/index.php` - Application entry point
- `publish.ps1` - Deployment automation script

## Important Development Notes

### API Response Format
All API responses follow a consistent format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
```

### Authentication Context
Use `AuthContext` for authentication state management:
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### Environment-Specific Builds
The build system automatically selects appropriate environment files:
- Frontend: `.env.preview` or `.env.production`
- Backend: `.env.preview` or `.env.production`

### Database Migrations
Database schema changes should be handled through proper migration scripts and coordinated with the deployment process.