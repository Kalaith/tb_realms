<?php

namespace App\Actions;

use App\External\UserRepository;
use App\Exceptions\UnauthorizedException;
use App\Exceptions\ResourceNotFoundException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AuthActions
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    /**
     * Register a new user
     */
    public function registerUser(array $userData): array
    {
        // Validate required fields
        $requiredFields = ['email', 'username', 'password', 'first_name', 'last_name'];
        foreach ($requiredFields as $field) {
            if (!isset($userData[$field]) || empty($userData[$field])) {
                throw new \InvalidArgumentException("Missing required field: {$field}");
            }
        }

        // Check if user already exists
        if ($this->userRepository->findByEmail($userData['email'])) {
            throw new \InvalidArgumentException('User with this email already exists');
        }

        if ($this->userRepository->findByUsername($userData['username'])) {
            throw new \InvalidArgumentException('User with this username already exists');
        }

        // Create user
        $user = $this->userRepository->createUser($userData);

        // Generate JWT token
        $token = $this->generateJwtToken($user);
        
        // Log token generation for debugging
        error_log('JWT Token generated for new user ' . $user->id . ': ' . substr($token, 0, 50) . '...');

        return [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'username' => $user->username,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role
            ],
            'token' => $token
        ];
    }

    /**
     * Login user
     */
    public function loginUser(array $credentials): array
    {
        if (!isset($credentials['email']) || !isset($credentials['password'])) {
            throw new \InvalidArgumentException('Email and password are required');
        }

        $user = $this->userRepository->findByEmail($credentials['email']);
        
        if (!$user || !password_verify($credentials['password'], $user->password)) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate JWT token
        $token = $this->generateJwtToken($user);
        
        // Log token generation for debugging
        error_log('JWT Token generated for login user ' . $user->id . ': ' . substr($token, 0, 50) . '...');

        return [
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'username' => $user->username,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'role' => $user->role
            ],
            'token' => $token
        ];
    }

    /**
     * Get current user information
     */
    public function getCurrentUser(string|int $userId): array
    {
        $user = $this->userRepository->findById($userId);
        
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }

        return [
            'id' => $user->id,
            'email' => $user->email,
            'username' => $user->username,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'role' => $user->role,
            'starting_balance' => $user->starting_balance,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at,
            'created_at' => $user->created_at
        ];
    }

    /**
     * Generate JWT token
     */
    private function generateJwtToken($user): string
    {
        $jwtSecret = $_ENV['JWT_SECRET'] ?? 'your_jwt_secret_key_here';
        
        $payload = [
            'user_id' => $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'iat' => time(), // issued at
            'exp' => time() + (24 * 60 * 60) // expires in 24 hours
        ];

        return JWT::encode($payload, $jwtSecret, 'HS256');
    }
}
