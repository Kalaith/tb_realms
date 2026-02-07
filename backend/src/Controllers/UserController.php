<?php

namespace App\Controllers;

use App\Http\Response;
use App\Http\Request;
use App\Actions\UserActions;
use App\Traits\ApiResponseTrait;

class UserController
{
    use ApiResponseTrait;

    public function __construct(
        private UserActions $userActions
    ) {}

    /**
     * Get all users (admin only)
     * GET /api/users
     */
    public function getAllUsers(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->userActions->getAllUsers($request->getQueryParams()),
            'fetching users',
            'Failed to fetch users'
        );
    }

    /**
     * Get user by ID
     * GET /api/users/{id}
     */
    public function getUserById(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->userActions->getUserById($args['id']),
            'fetching user',
            'User not found'
        );
    }

    /**
     * Update user profile
     * PUT /api/users/{id}
     */
    public function updateUser(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->userActions->updateUser($args['id'], $request->getParsedBody()),
            'updating user',
            'Failed to update user'
        );
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    public function deleteUser(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->userActions->deleteUser($args['id']),
            'deleting user',
            'Failed to delete user'
        );
    }

    /**
     * Get user's public profile
     * GET /api/users/{id}/profile
     */
    public function getUserProfile(Request $request, Response $response, array $args): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->userActions->getUserProfile($args['id']),
            'fetching user profile',
            'Profile not found'
        );
    }
}
