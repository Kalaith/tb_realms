<?php

declare(strict_types=1);

namespace App\Actions;

use App\Core\Environment;
use App\Repositories\UserRepository;
use Firebase\JWT\JWT;

final class CreateGuestSessionAction
{
    public function __construct(private readonly UserRepository $userRepository)
    {
    }

    /**
     * @return array{token: string, user: array<string, mixed>}
     */
    public function execute(): array
    {
        $guestId = 'guest_' . bin2hex(random_bytes(16));
        $displayName = 'Guest ' . strtoupper(substr($guestId, -6));
        $user = $this->userRepository->createGuestUser($guestId, $displayName);
        $issuedAt = time();

        $payload = [
            'sub' => $guestId,
            'user_id' => $guestId,
            'username' => (string) $user->username,
            'display_name' => (string) ($user->display_name ?: $displayName),
            'role' => 'guest',
            'roles' => ['guest'],
            'auth_type' => 'guest',
            'is_guest' => true,
            'iat' => $issuedAt,
        ];

        return [
            'token' => JWT::encode($payload, Environment::required('JWT_SECRET'), 'HS256'),
            'user' => [
                'id' => $guestId,
                'local_user_id' => (int) $user->id,
                'username' => (string) $user->username,
                'display_name' => (string) ($user->display_name ?: $displayName),
                'roles' => ['guest'],
                'role' => 'guest',
                'is_guest' => true,
                'auth_type' => 'guest',
                'guest_user_id' => $guestId,
            ],
        ];
    }
}
