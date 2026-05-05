<?php

declare(strict_types=1);

namespace App\Actions;

use App\Repositories\UserRepository;

final class AuthActions
{
    public function __construct(private readonly UserRepository $userRepository)
    {
    }

    /**
     * @return array<string, mixed>
     */
    public function getCurrentUser(string|int $userId): array
    {
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            throw new \RuntimeException('User not found.');
        }

        return $user->toArray();
    }
}
