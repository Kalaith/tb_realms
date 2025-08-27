<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Actions\AuthActions;
use App\Traits\ApiResponseTrait;

class AuthController
{
    use ApiResponseTrait;

    public function __construct(
        private AuthActions $authActions
    ) {}

    /**
     * Register a new user
     * POST /api/auth/register
     */
    public function register(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->authActions->registerUser($request->getParsedBody()),
            'registering user',
            'Registration failed',
            201
        );
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    public function login(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->authActions->loginUser($request->getParsedBody()),
            'logging in user',
            'Invalid credentials'
        );
    }

    /**
     * Get current authenticated user
     * GET /api/auth/me
     */
    public function getCurrentUser(Request $request, Response $response): Response
    {
        return $this->handleApiAction(
            $response,
            fn() => $this->authActions->getCurrentUser($request->getAttribute('user_id')),
            'getting current user',
            'User not found'
        );
    }

    /**
     * Logout user (placeholder for future token invalidation)
     * POST /api/auth/logout
     */
    public function logout(Request $request, Response $response): Response
    {
        return $this->successResponse($response, [
            'message' => 'Successfully logged out'
        ]);
    }
}
