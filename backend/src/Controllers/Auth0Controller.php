<?php

namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Models\User;
use App\Traits\ResponseTrait;

class Auth0Controller
{
    use ResponseTrait;

    /**
     * Verify and create/update user from Auth0 token
     */
    public function verifyUser(Request $request, Response $response): Response
    {
        try {
            // Get user data from request body (sent by frontend)
            $data = json_decode($request->getBody()->getContents(), true);
            
            if (!$data || !isset($data['auth0_id'])) {
                return $this->errorResponse($response, 'Invalid request data', 400);
            }

            // Get authenticated user from middleware (for verification)
            $auth0User = $request->getAttribute('auth0_user');
            
            // Verify the auth0_id matches the token
            if ($auth0User->sub !== $data['auth0_id']) {
                return $this->errorResponse($response, 'Auth0 ID mismatch', 400);
            }

            // Try to find existing user by Auth0 ID
            $user = User::where('auth0_id', $data['auth0_id'])->first();
            
            if (!$user) {
                // Create new user with game-specific defaults
                $user = User::create([
                    'auth0_id' => $data['auth0_id'],
                    'email' => $data['email'] ?? '',
                    'username' => $data['username'] ?? explode('@', $data['email'] ?? 'user')[0],
                    'first_name' => $data['given_name'] ?? '',
                    'last_name' => $data['family_name'] ?? '',
                    'display_name' => $data['name'] ?? $data['username'] ?? 'Player',
                    'role' => 'player', // Default role for TB Realms
                    'is_active' => true,
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
            } else {
                // Update existing user with latest data
                $user->update([
                    'email' => $data['email'] ?? $user->email,
                    'username' => $data['username'] ?? $user->username,
                    'first_name' => $data['given_name'] ?? $user->first_name,
                    'last_name' => $data['family_name'] ?? $user->last_name,
                    'display_name' => $data['name'] ?? $user->display_name,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
            }
            
            return $this->successResponse($response, [
                'user' => [
                    'id' => $user->id,
                    'auth0_id' => $user->auth0_id,
                    'email' => $user->email,
                    'username' => $user->username,
                    'display_name' => $user->display_name,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at
                ],
                'message' => 'User verified successfully'
            ]);
            
        } catch (\Exception $e) {
            return $this->errorResponse($response, 'User verification failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get current authenticated user info
     */
    public function getCurrentUser(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            
            if (!$user) {
                return $this->errorResponse($response, 'User not found', 404);
            }
            
            return $this->successResponse($response, [
                'user' => [
                    'id' => $user['id'],
                    'auth0_id' => $user['auth0_id'] ?? null,
                    'email' => $user['email'],
                    'username' => $user['username'],
                    'display_name' => $user['display_name'],
                    'role' => $user['role'],
                    'is_active' => $user['is_active'],
                    'created_at' => $user['created_at'],
                    'updated_at' => $user['updated_at']
                ]
            ]);
            
        } catch (\Exception $e) {
            return $this->errorResponse($response, 'Failed to get user info: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Validate current session (used by frontend to check auth status)
     */
    public function validateSession(Request $request, Response $response): Response
    {
        try {
            $user = $request->getAttribute('user');
            $auth0User = $request->getAttribute('auth0_user');
            
            return $this->successResponse($response, [
                'user' => [
                    'id' => $user['id'],
                    'auth0_id' => $user['auth0_id'] ?? null,
                    'email' => $user['email'],
                    'username' => $user['username'],
                    'display_name' => $user['display_name'],
                    'role' => $user['role'],
                    'is_active' => $user['is_active']
                ],
                'auth0_data' => [
                    'sub' => $auth0User->sub ?? null,
                    'email' => $auth0User->email ?? null,
                    'name' => $auth0User->name ?? null
                ]
            ]);
            
        } catch (\Exception $e) {
            return $this->errorResponse($response, 'Session validation failed: ' . $e->getMessage(), 500);
        }
    }
}