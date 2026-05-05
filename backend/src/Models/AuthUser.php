<?php

declare(strict_types=1);

namespace App\Models;

final class AuthUser
{
    /**
     * @param list<string> $roles
     */
    public function __construct(
        public readonly string $id,
        public readonly int $localUserId,
        public readonly ?string $email,
        public readonly string $username,
        public readonly string $displayName,
        public readonly string $role,
        public readonly array $roles,
        public readonly bool $isGuest,
        public readonly string $authType,
        public readonly ?string $guestUserId = null
    ) {
    }

    /**
     * @param array<string, mixed> $values
     */
    public static function fromArray(array $values): self
    {
        $roles = $values['roles'] ?? [];
        if (!is_array($roles)) {
            $roles = [];
        }

        return new self(
            id: (string) ($values['external_id'] ?? $values['id'] ?? ''),
            localUserId: (int) ($values['local_user_id'] ?? $values['id'] ?? 0),
            email: isset($values['email']) ? (string) $values['email'] : null,
            username: (string) ($values['username'] ?? ''),
            displayName: (string) ($values['display_name'] ?? $values['username'] ?? ''),
            role: (string) ($values['role'] ?? 'player'),
            roles: array_values(array_map('strval', $roles)),
            isGuest: (bool) ($values['is_guest'] ?? false),
            authType: (string) ($values['auth_type'] ?? 'frontpage'),
            guestUserId: isset($values['guest_user_id']) ? (string) $values['guest_user_id'] : null
        );
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'id' => $this->localUserId,
            'local_user_id' => $this->localUserId,
            'external_id' => $this->id,
            'email' => $this->email,
            'username' => $this->username,
            'display_name' => $this->displayName,
            'role' => $this->role,
            'roles' => $this->roles,
            'is_guest' => $this->isGuest,
            'auth_type' => $this->authType,
            'guest_user_id' => $this->guestUserId,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function toFrontendArray(): array
    {
        return [
            'id' => $this->isGuest && $this->guestUserId !== null ? $this->guestUserId : (string) $this->localUserId,
            'local_user_id' => $this->localUserId,
            'email' => $this->email,
            'username' => $this->username,
            'display_name' => $this->displayName,
            'role' => $this->role,
            'roles' => $this->roles,
            'is_guest' => $this->isGuest,
            'auth_type' => $this->authType,
            'guest_user_id' => $this->guestUserId,
        ];
    }
}
