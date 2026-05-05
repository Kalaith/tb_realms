<?php

declare(strict_types=1);

namespace App\Actions;

use App\Core\Environment;
use App\Models\AuthUser;
use App\Repositories\UserRepository;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use RuntimeException;

final class LinkGuestAccountAction
{
    public function __construct(private readonly UserRepository $userRepository)
    {
    }

    /**
     * @param array<string, mixed> $body
     * @return array<string, mixed>
     */
    public function execute(AuthUser $targetUser, array $body): array
    {
        if ($targetUser->isGuest) {
            throw new RuntimeException('Guest sessions cannot link another guest session.');
        }

        $guestToken = $body['guest_token'] ?? null;
        if (!is_string($guestToken) || trim($guestToken) === '') {
            throw new RuntimeException('Missing guest token.');
        }

        $decoded = JWT::decode($guestToken, new Key(Environment::required('JWT_SECRET'), 'HS256'));
        if ((bool) ($decoded->is_guest ?? false) !== true) {
            throw new RuntimeException('Token is not a guest session.');
        }

        $guestUserId = $decoded->sub ?? $decoded->user_id ?? null;
        if (!is_string($guestUserId) || trim($guestUserId) === '') {
            throw new RuntimeException('Guest token is missing a user identifier.');
        }

        $movedRows = $this->userRepository->moveGuestDataToUser($guestUserId, $targetUser->localUserId);

        return [
            'merged' => true,
            'guest_user_id' => $guestUserId,
            'linked_to_user_id' => (string) $targetUser->localUserId,
            'moved_rows_by_table' => $movedRows,
            'total_moved_rows' => array_sum($movedRows),
        ];
    }
}
