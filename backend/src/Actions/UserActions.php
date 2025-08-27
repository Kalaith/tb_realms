<?php

namespace App\Actions;

use App\External\UserRepository;
use App\Models\User;
use App\Exceptions\ResourceNotFoundException;
use App\Exceptions\UnauthorizedException;

/**
 * User management business logic
 * Following Mytherra Actions pattern
 */
class UserActions
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    /**
     * Get all users (admin only)
     */
    public function getAllUsers(array $queryParams = []): array
    {
        $users = $this->userRepository->getAllUsersArray();
        
        // Apply filters if provided
        if (!empty($queryParams)) {
            $users = $this->filterUsers($users, $queryParams);
        }
        
        return array_map(function($user) {
            return $this->formatUserData($user);
        }, $users);
    }

    /**
     * Get user by ID
     */
    public function getUserById(string $id): array
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }
        
        return $this->formatUserData($user);
    }

    /**
     * Update user information
     */
    public function updateUser(string $id, array $data): array
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }
        
        // Filter allowed fields for update
        $allowedFields = [
            'username',
            'email',
            'first_name',
            'last_name',
            'avatar_url'
        ];
        
        $updateData = array_intersect_key($data, array_flip($allowedFields));
        
        if (empty($updateData)) {
            throw new \InvalidArgumentException('No valid fields provided for update');
        }
        
        $updatedUser = $this->userRepository->updateUser($id, $updateData);
        
        return $this->formatUserData($updatedUser);
    }

    /**
     * Delete user (admin only)
     */
    public function deleteUser(string $id): array
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }
        
        $success = $this->userRepository->deleteUser($id);
        
        return [
            'success' => $success,
            'message' => $success ? 'User deleted successfully' : 'Failed to delete user'
        ];
    }

    /**
     * Get user's public profile
     */
    public function getUserProfile(string $id): array
    {
        $user = $this->userRepository->findById($id);
        
        if (!$user) {
            throw new ResourceNotFoundException('User not found');
        }
        
        return $this->formatPublicUserData($user);
    }

    /**
     * Filter users based on query parameters
     */
    private function filterUsers(array $users, array $params): array
    {
        // Apply role filter
        if (isset($params['role'])) {
            $users = array_filter($users, function($user) use ($params) {
                return $user->role === $params['role'];
            });
        }
        
        // Apply active status filter
        if (isset($params['is_active'])) {
            $active = filter_var($params['is_active'], FILTER_VALIDATE_BOOLEAN);
            $users = array_filter($users, function($user) use ($active) {
                return $user->is_active === $active;
            });
        }
        
        // Apply search filter
        if (isset($params['search'])) {
            $search = strtolower($params['search']);
            $users = array_filter($users, function($user) use ($search) {
                return strpos(strtolower($user->username), $search) !== false ||
                       strpos(strtolower($user->email), $search) !== false ||
                       strpos(strtolower($user->first_name ?? ''), $search) !== false ||
                       strpos(strtolower($user->last_name ?? ''), $search) !== false;
            });
        }
        
        // Apply sorting
        if (isset($params['sortBy'])) {
            $sortBy = $params['sortBy'];
            $sortDirection = $params['sortDirection'] ?? 'asc';
            
            usort($users, function($a, $b) use ($sortBy, $sortDirection) {
                $valueA = $a->$sortBy ?? '';
                $valueB = $b->$sortBy ?? '';
                
                $comparison = strcasecmp($valueA, $valueB);
                return $sortDirection === 'desc' ? -$comparison : $comparison;
            });
        }
        
        return array_values($users); // Reset array keys
    }

    /**
     * Format user data for API response (admin view)
     */
    private function formatUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'avatar_url' => $user->avatar_url,
            'role' => $user->role,
            'starting_balance' => $user->starting_balance,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
            'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
            'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $user->updated_at->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Format user data for public profile view
     */
    private function formatPublicUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'avatar_url' => $user->avatar_url,
            'created_at' => $user->created_at->format('Y-m-d H:i:s')
        ];
    }
}
