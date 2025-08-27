<?php

namespace App\External;

use App\Models\User;
use App\Exceptions\ResourceNotFoundException;

class UserRepository
{
    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Find user by username
     */
    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    /**
     * Find user by ID
     */
    public function findById(string|int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Create a new user
     */
    public function createUser(array $userData): User
    {
        // Generate ID if not provided
        if (!isset($userData['id'])) {
            $userData['id'] = 'user-' . uniqid();
        }
        
        // Hash password
        if (isset($userData['password'])) {
            $userData['password'] = password_hash($userData['password'], PASSWORD_DEFAULT);
        }

        // Set default values
        $userData['starting_balance'] = $userData['starting_balance'] ?? 10000.00;
        $userData['is_active'] = $userData['is_active'] ?? true;
        $userData['role'] = $userData['role'] ?? 'user';

        return User::create($userData);
    }

    /**
     * Update user information
     */
    public function updateUser(string $id, array $userData): User
    {
        $user = $this->findById($id);
        if (!$user) {
            throw new ResourceNotFoundException("User with ID {$id} not found");
        }

        // Hash password if provided
        if (isset($userData['password'])) {
            $userData['password'] = password_hash($userData['password'], PASSWORD_DEFAULT);
        }

        $user->update($userData);
        return $user->fresh();
    }

    /**
     * Update user's last login timestamp
     */
    public function updateLastLogin(string $id): void
    {
        $user = $this->findById($id);
        if ($user) {
            $user->update(['last_login_at' => now()]);
        }
    }

    /**
     * Get all users with pagination
     */
    public function getAllUsers(int $page = 1, int $perPage = 50): array
    {
        $users = User::orderBy('created_at', 'desc')
                    ->skip(($page - 1) * $perPage)
                    ->take($perPage)
                    ->get();

        return [
            'users' => $users->toArray(),
            'total' => User::count(),
            'page' => $page,
            'per_page' => $perPage
        ];
    }

    /**
     * Get all users without pagination
     */
    public function getAllUsersArray(): array
    {
        return User::orderBy('created_at', 'desc')
            ->get()
            ->all();
    }

    /**
     * Delete user (soft delete if implemented, hard delete otherwise)
     */
    public function deleteUser(string $id): bool
    {
        $user = $this->findById($id);
        if (!$user) {
            throw new ResourceNotFoundException("User with ID {$id} not found");
        }

        return $user->delete();
    }
}
