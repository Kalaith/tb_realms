# Tradeborn Realms Authentication System

> Comprehensive documentation of the login and authentication system

## Overview

Tradeborn Realms implements a secure JWT-based authentication system with both frontend (React/TypeScript) and backend (PHP) components. The system provides user registration, login, session management, and route protection.

## Architecture

### Authentication Flow
1. **Registration/Login** → User submits credentials
2. **Backend Validation** → Credentials verified against database
3. **JWT Generation** → Server creates signed JWT token
4. **Token Storage** → Frontend stores token in localStorage
5. **Authenticated Requests** → Token sent with API calls
6. **Token Validation** → Middleware verifies token on protected routes

### Technology Stack
- **Frontend**: React 18 + TypeScript + Axios
- **Backend**: PHP 8.1+ + Slim Framework + Firebase JWT
- **Database**: MySQL 8.0+ with Eloquent ORM
- **Token Type**: JWT (JSON Web Tokens) with HS256 algorithm

## Backend Implementation

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    avatar_url TEXT NULL,
    role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
    starting_balance DECIMAL(15,2) DEFAULT 10000.00,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    email_verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);
```

### Core Authentication Components

#### 1. AuthController (`src/Controllers/AuthController.php`)
Handles HTTP requests for authentication endpoints:

**Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current authenticated user
- `POST /api/auth/logout` - User logout (client-side token removal)

**Key Methods:**
```php
public function register(Request $request, Response $response): Response
public function login(Request $request, Response $response): Response
public function getCurrentUser(Request $request, Response $response): Response
public function logout(Request $request, Response $response): Response
```

#### 2. AuthActions (`src/Actions/AuthActions.php`)
Contains business logic for authentication operations:

**Key Methods:**
- `registerUser(array $userData): array` - Creates new user account
- `loginUser(array $credentials): array` - Authenticates user credentials
- `getCurrentUser(string|int $userId): array` - Retrieves user information
- `generateJwtToken($user): string` - Creates JWT tokens

**Password Security:**
- Uses PHP's `password_hash()` with default algorithm (bcrypt)
- Passwords verified with `password_verify()`
- Minimum 8-character password requirement (frontend validation)

**JWT Token Structure:**
```php
$payload = [
    'user_id' => $user->id,
    'email' => $user->email,
    'role' => $user->role,
    'iat' => time(),                    // issued at
    'exp' => time() + (24 * 60 * 60)    // expires in 24 hours
];
```

#### 3. User Model (`src/Models/User.php`)
Eloquent model for user data management:

**Features:**
- Mass assignment protection with `$fillable` array
- Password hiding with `$hidden` array
- Type casting for boolean and decimal fields
- Automatic table creation method
- Relationships with Portfolio, Transactions, Achievements, and UserSettings

#### 4. UserRepository (`src/External/UserRepository.php`)
Data access layer for user operations:

**Key Methods:**
- `findByEmail(string $email): ?User`
- `findByUsername(string $username): ?User`
- `findById(string|int $id): ?User`
- `createUser(array $userData): User`

### JWT Authentication Middleware

#### JwtAuthMiddleware (`src/Middleware/JwtAuthMiddleware.php`)
Protects routes requiring authentication:

**Process Flow:**
1. Extracts token from `Authorization: Bearer <token>` header
2. Validates token signature and expiration
3. Verifies user exists and is active
4. Adds user information to request attributes
5. Continues request or returns 401 Unauthorized

**Request Attributes Added:**
- `user_id` - Authenticated user's ID
- `user_role` - User's role (user/admin/moderator)
- `user` - Complete user object

**Error Handling:**
- Missing authorization header
- Invalid header format
- Expired tokens
- Invalid signatures
- Inactive users

### Route Protection

#### Protected vs Public Routes
**Public Routes** (no authentication required):
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/stocks/**` (market data)
- `GET /api/health` (connectivity check)

**Protected Routes** (JWT required):
- `GET /api/auth/me`
- `GET /api/portfolio/**`
- `POST /api/transactions/**`
- `GET /api/watchlist/**`
- All user-specific data endpoints

### Environment Configuration

#### Required Environment Variables
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=tb_realms
DB_USERNAME=your_username
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_2024

# API Configuration
API_DEBUG=true
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Frontend Implementation

### Authentication Context

#### AuthContext (`src/contexts/AuthContext.tsx`)
React context providing authentication state and methods throughout the app:

**State Management:**
```typescript
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
```

**Features:**
- Automatic token restoration on app initialization
- Global authentication state management
- Error handling and loading states
- Custom events for login success

#### AuthProvider Features
- Checks localStorage for existing tokens on mount
- Validates tokens with backend `/auth/me` endpoint
- Clears invalid tokens automatically
- Provides authentication status to all components

### API Client

#### authApi (`src/api/authApi.ts`)
HTTP client for authentication requests:

**Key Functions:**
- `login(credentials: LoginRequest): Promise<AuthUser>`
- `register(userData: RegisterRequest): Promise<AuthUser>`
- `getCurrentUser(): Promise<AuthUser | null>`
- `logout(): void` (client-side token removal)
- `checkServerConnectivity(): Promise<boolean>`

**Features:**
- Automatic token inclusion in requests
- Comprehensive error handling with user-friendly messages
- Connection timeout and retry logic
- Environment-based API URL configuration

**Token Management:**
- Automatic storage in localStorage on successful auth
- Automatic inclusion in subsequent requests via interceptor
- Client-side removal on logout

### UI Components

#### LoginForm (`src/components/auth/LoginForm.tsx`)
User interface for authentication:

**Features:**
- Real-time form validation
- Server connectivity checking
- Loading states and error display
- Responsive design with Tailwind CSS

**Validation:**
- Email format validation
- Required field validation
- Real-time error clearing on input change

#### RegisterForm (`src/components/auth/RegisterForm.tsx`)
User registration interface:

**Features:**
- Comprehensive form validation
- Password confirmation matching
- Username uniqueness checking
- Progressive enhancement

**Validation Rules:**
- Email format validation
- Username minimum 3 characters
- Password minimum 8 characters
- Password confirmation matching
- Required field validation

#### ProtectedRoute (`src/components/auth/ProtectedRoute.tsx`)
Route wrapper for authentication-required pages:

**Features:**
- Automatic redirect to login for unauthenticated users
- Loading spinner during auth check
- Preserves intended destination after login
- Works with React Router location state

### Type Definitions

#### Auth Types (`src/entities/Auth.ts`)
TypeScript interfaces for authentication:

```typescript
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
```

## Security Features

### Password Security
- **Hashing**: PHP `password_hash()` with bcrypt
- **Verification**: PHP `password_verify()`
- **Frontend Validation**: Minimum 8 characters required
- **No Plain Text**: Passwords never stored in plain text

### JWT Security
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Secret Key**: Environment variable (should be 256+ bits)
- **Expiration**: 24-hour token lifetime
- **Claims**: User ID, email, role, issued at, expiration

### Request Security
- **CORS**: Configured for specific origins
- **Headers**: Proper Content-Type and Authorization headers
- **HTTPS**: Recommended for production
- **Token Transmission**: Bearer token in Authorization header

### Input Validation
- **Frontend**: Real-time validation with TypeScript types
- **Backend**: Server-side validation and sanitization
- **Database**: Unique constraints and proper indexing
- **XSS Protection**: Proper escaping of user input

## Configuration and Setup

### Backend Setup
1. **Install Dependencies**:
   ```bash
   composer install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your database and JWT settings
   ```

3. **Database Initialization**:
   ```bash
   php scripts/init-database.php
   ```

4. **JWT Secret Generation**:
   ```bash
   # Generate a secure random key
   openssl rand -hex 32
   ```

### Frontend Setup
1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   # Set VITE_API_URL to your backend URL
   ```

3. **Build and Start**:
   ```bash
   npm run dev    # Development
   npm run build  # Production
   ```

## API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/health` | Server health check |

### Protected Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/auth/me` | Get current user | ✅ |
| GET | `/api/auth/user` | Get current user (alt) | ✅ |
| POST | `/api/auth/logout` | User logout | ✅ |

## Error Handling

### Frontend Error Types
- **CONNECTION_ERROR**: Server unreachable
- **UNAUTHORIZED**: Invalid credentials
- **VALIDATION_ERROR**: Form validation failure
- **SERVER_ERROR**: Internal server error
- **CLIENT_ERROR**: Unexpected client error

### Backend Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message",
    "details": {}
  }
}
```

### Common Error Scenarios
1. **Invalid Credentials**: Wrong email/password combination
2. **Expired Token**: JWT token past expiration time
3. **Missing Token**: No Authorization header provided
4. **User Not Found**: Account deleted or deactivated
5. **Server Offline**: Backend server unreachable

## Testing and Debugging

### Backend Testing
- **PHPUnit**: Unit tests for authentication logic
- **Postman/Bruno**: API endpoint testing
- **Debug Logging**: JWT token validation logging

### Frontend Testing
- **Jest**: Unit tests for authentication components
- **React Testing Library**: Component integration tests
- **Console Logging**: Development-mode error logging

### Debug Information
- JWT token validation logs in backend
- Network request/response inspection
- LocalStorage token verification
- Authentication state debugging

## Production Considerations

### Security Hardening
1. **JWT Secret**: Use cryptographically secure random key (256+ bits)
2. **HTTPS Only**: Enforce SSL/TLS for all authentication requests
3. **Token Expiry**: Implement reasonable expiration times
4. **Rate Limiting**: Prevent brute force attacks
5. **Input Sanitization**: Validate and sanitize all user input

### Performance Optimization
1. **Token Caching**: Efficient token storage and retrieval
2. **Connection Pooling**: Database connection optimization
3. **CDN**: Serve static assets via CDN
4. **Compression**: Enable gzip compression

### Monitoring and Logging
1. **Authentication Events**: Log successful/failed login attempts
2. **Security Events**: Monitor suspicious authentication patterns
3. **Performance Metrics**: Track authentication response times
4. **Error Tracking**: Comprehensive error logging and alerting

## Troubleshooting

### Common Issues

#### "Authorization header missing"
- **Cause**: Frontend not sending token or token not in localStorage
- **Solution**: Check token storage and axios interceptor configuration

#### "Invalid token signature"
- **Cause**: JWT_SECRET mismatch between token generation and validation
- **Solution**: Ensure same JWT_SECRET in environment variables

#### "Token expired"
- **Cause**: JWT token past 24-hour expiration
- **Solution**: Implement token refresh or re-login flow

#### "User not found or inactive"
- **Cause**: User account deleted or deactivated after token issued
- **Solution**: Clear localStorage token and redirect to login

#### "Connection refused"
- **Cause**: Backend server not running or wrong API URL
- **Solution**: Verify backend server status and VITE_API_URL configuration

### Development Tips
1. **Token Inspection**: Use jwt.io to decode and inspect tokens
2. **Network Debugging**: Use browser dev tools to inspect API calls
3. **State Debugging**: Use React DevTools to inspect authentication state
4. **Backend Logs**: Check PHP error logs for authentication issues

---

*This documentation covers the complete authentication system for Tradeborn Realms. For additional information, see the related project files and API documentation.*
