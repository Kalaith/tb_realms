<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\AuthUser;
use App\Models\User;
use PDO;
use RuntimeException;

final class UserRepository extends PdoRepository
{
    private const USER_COLUMNS = [
        'auth0_id',
        'email',
        'username',
        'password',
        'first_name',
        'last_name',
        'display_name',
        'avatar_url',
        'role',
        'starting_balance',
        'is_active',
        'last_login_at',
        'email_verified_at',
        'created_at',
        'updated_at',
    ];

    public function findByEmail(string $email): ?User
    {
        return $this->fetchRecord('SELECT * FROM users WHERE email = :email LIMIT 1', ['email' => $email], User::class);
    }

    public function findByUsername(string $username): ?User
    {
        return $this->fetchRecord('SELECT * FROM users WHERE username = :username LIMIT 1', ['username' => $username], User::class);
    }

    public function findByExternalId(string $externalId): ?User
    {
        return $this->fetchRecord(
            'SELECT * FROM users WHERE auth0_id = :auth0_id LIMIT 1',
            ['auth0_id' => $externalId],
            User::class
        );
    }

    public function findById(string|int $id): ?User
    {
        return $this->fetchRecord('SELECT * FROM users WHERE id = :id LIMIT 1', ['id' => (int) $id], User::class);
    }

    /**
     * @param array<string, mixed> $userData
     */
    public function createUser(array $userData): User
    {
        $now = $this->now();
        if (isset($userData['password']) && is_string($userData['password']) && $userData['password'] !== '') {
            $userData['password'] = password_hash($userData['password'], PASSWORD_DEFAULT);
        }

        $userData = [
            'role' => 'player',
            'starting_balance' => 10000.00,
            'is_active' => 1,
            'created_at' => $now,
            'updated_at' => $now,
            ...$userData,
        ];

        $id = $this->insert('users', $userData, self::USER_COLUMNS);
        $user = $this->findById($id);
        if (!$user) {
            throw new RuntimeException('Created user could not be loaded.');
        }

        return $user;
    }

    /**
     * @param array<string, mixed> $userData
     */
    public function updateUser(string|int $id, array $userData): User
    {
        if (isset($userData['password']) && is_string($userData['password']) && $userData['password'] !== '') {
            $userData['password'] = password_hash($userData['password'], PASSWORD_DEFAULT);
        }
        $userData['updated_at'] = $this->now();

        $this->update('users', $userData, self::USER_COLUMNS, ['id' => (int) $id]);
        $user = $this->findById($id);
        if (!$user) {
            throw new RuntimeException('User not found.');
        }

        return $user;
    }

    public function updateLastLogin(string|int $id): void
    {
        $this->update('users', ['last_login_at' => $this->now(), 'updated_at' => $this->now()], self::USER_COLUMNS, [
            'id' => (int) $id,
        ]);
    }

    /**
     * @return array{users: list<array<string, mixed>>, total: int, page: int, per_page: int}
     */
    public function getAllUsers(int $page = 1, int $perPage = 50): array
    {
        $offset = max(0, ($page - 1) * $perPage);
        $statement = $this->db->prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT :limit OFFSET :offset');
        $statement->bindValue('limit', $perPage, PDO::PARAM_INT);
        $statement->bindValue('offset', $offset, PDO::PARAM_INT);
        $statement->execute();

        return [
            'users' => $statement->fetchAll(),
            'total' => $this->countUsers(),
            'page' => $page,
            'per_page' => $perPage,
        ];
    }

    /**
     * @return list<User>
     */
    public function getAllUsersArray(): array
    {
        return $this->fetchRecords('SELECT * FROM users ORDER BY created_at DESC', [], User::class);
    }

    public function deleteUser(string|int $id): bool
    {
        $statement = $this->db->prepare('DELETE FROM users WHERE id = :id');
        $statement->execute(['id' => (int) $id]);

        return $statement->rowCount() > 0;
    }

    public function resolveOrCreateAuthUser(object $decoded): AuthUser
    {
        $externalId = trim((string) ($decoded->sub ?? $decoded->user_id ?? ''));
        if ($externalId === '') {
            throw new RuntimeException('Token missing user identifier.');
        }

        $isGuest = $this->toBool($decoded->is_guest ?? false) || (string) ($decoded->auth_type ?? '') === 'guest';
        $email = !$isGuest && isset($decoded->email) ? trim((string) $decoded->email) : '';
        $tokenUsername = isset($decoded->username) ? trim((string) $decoded->username) : '';
        $displayName = isset($decoded->display_name) ? trim((string) $decoded->display_name) : '';

        $user = $this->findByExternalId($externalId);
        if (!$user && !$isGuest && $email !== '') {
            $user = $this->findByEmail($email);
        }
        if (!$user && !$isGuest && $tokenUsername !== '') {
            $user = $this->findByUsername($tokenUsername);
        }
        if (!$user && !$isGuest && ctype_digit($externalId)) {
            $user = $this->findById((int) $externalId);
        }

        if ($user) {
            $updates = [
                'auth0_id' => $externalId,
                'last_login_at' => $this->now(),
            ];
            if (!$isGuest && $email !== '') {
                $updates['email'] = $email;
            }
            if ($tokenUsername !== '' && !$this->valueExistsForAnotherUser('username', $tokenUsername, (int) $user->id)) {
                $updates['username'] = $tokenUsername;
            }
            if ($displayName !== '') {
                $updates['display_name'] = $displayName;
            }
            $user = $this->updateUser((int) $user->id, $updates);
        } else {
            $username = $this->uniqueUsername($tokenUsername !== '' ? $tokenUsername : $this->fallbackUsername($externalId, $isGuest));
            $resolvedEmail = $email !== ''
                ? $email
                : $this->uniqueEmail($username, $isGuest ? '@guest.tradeborn.local' : '@local.webhatchery');
            $user = $this->createUser([
                'auth0_id' => $externalId,
                'email' => $resolvedEmail,
                'username' => $username,
                'password' => bin2hex(random_bytes(16)),
                'display_name' => $displayName !== '' ? $displayName : ($isGuest ? $username : $username),
                'role' => 'player',
                'last_login_at' => $this->now(),
            ]);
        }

        $roles = $decoded->roles ?? ($isGuest ? ['guest'] : ['player']);
        if (!is_array($roles)) {
            $roles = [$isGuest ? 'guest' : 'player'];
        }
        $roles = array_values(array_map('strval', $roles));
        if ($this->toBool($decoded->is_admin ?? false) && !in_array('admin', $roles, true)) {
            $roles[] = 'admin';
        }

        return new AuthUser(
            id: $externalId,
            localUserId: (int) $user->id,
            email: $isGuest ? null : (string) $user->email,
            username: (string) $user->username,
            displayName: (string) ($user->display_name ?: $user->username),
            role: $isGuest ? 'guest' : (string) ($user->role ?: 'player'),
            roles: $roles,
            isGuest: $isGuest,
            authType: $isGuest ? 'guest' : 'frontpage',
            guestUserId: $isGuest ? $externalId : null
        );
    }

    public function createGuestUser(string $guestExternalId, string $displayName): User
    {
        $existing = $this->findByExternalId($guestExternalId);
        if ($existing) {
            return $existing;
        }

        $username = $this->uniqueUsername('guest_' . strtolower(substr($guestExternalId, -10)));

        return $this->createUser([
            'auth0_id' => $guestExternalId,
            'email' => $this->uniqueEmail($username, '@guest.tradeborn.local'),
            'username' => $username,
            'password' => bin2hex(random_bytes(16)),
            'display_name' => $displayName,
            'role' => 'player',
            'starting_balance' => 10000.00,
            'is_active' => 1,
            'last_login_at' => $this->now(),
        ]);
    }

    /**
     * @return array<string, int>
     */
    public function moveGuestDataToUser(string $guestExternalId, int $targetUserId): array
    {
        return $this->transaction(function () use ($guestExternalId, $targetUserId): array {
            $guest = $this->findByExternalId($guestExternalId);
            if (!$guest) {
                throw new RuntimeException('Guest account not found.');
            }

            $guestUserId = (int) $guest->id;
            if ($guestUserId === $targetUserId) {
                throw new RuntimeException('Guest account already belongs to the target user.');
            }

            $moved = [
                'portfolios' => 0,
                'transactions' => 0,
                'watchlists' => 0,
                'user_settings' => 0,
                'user_achievements' => 0,
                'users' => 0,
            ];

            $guestPortfolio = $this->fetchRow('SELECT * FROM portfolios WHERE user_id = :user_id LIMIT 1', [
                'user_id' => $guestUserId,
            ]);
            $targetPortfolio = $this->fetchRow('SELECT * FROM portfolios WHERE user_id = :user_id LIMIT 1', [
                'user_id' => $targetUserId,
            ]);

            if ($guestPortfolio && !$targetPortfolio) {
                $statement = $this->db->prepare('UPDATE portfolios SET user_id = :target, updated_at = :updated_at WHERE id = :id');
                $statement->execute([
                    'target' => $targetUserId,
                    'updated_at' => $this->now(),
                    'id' => (int) $guestPortfolio['id'],
                ]);
                $moved['portfolios'] += $statement->rowCount();
            } elseif ($guestPortfolio && $targetPortfolio) {
                $statement = $this->db->prepare(
                    'UPDATE transactions
                     SET user_id = :target_user, portfolio_id = :target_portfolio, updated_at = :updated_at
                     WHERE portfolio_id = :guest_portfolio'
                );
                $statement->execute([
                    'target_user' => $targetUserId,
                    'target_portfolio' => (int) $targetPortfolio['id'],
                    'updated_at' => $this->now(),
                    'guest_portfolio' => (int) $guestPortfolio['id'],
                ]);
                $moved['transactions'] += $statement->rowCount();

                $statement = $this->db->prepare(
                    'UPDATE portfolios
                     SET cash_balance = cash_balance + :cash_balance,
                         total_value = total_value + :total_value,
                         total_invested = total_invested + :total_invested,
                         total_profit_loss = total_profit_loss + :total_profit_loss,
                         updated_at = :updated_at
                     WHERE id = :id'
                );
                $statement->execute([
                    'cash_balance' => (float) $guestPortfolio['cash_balance'],
                    'total_value' => (float) $guestPortfolio['total_value'],
                    'total_invested' => (float) $guestPortfolio['total_invested'],
                    'total_profit_loss' => (float) $guestPortfolio['total_profit_loss'],
                    'updated_at' => $this->now(),
                    'id' => (int) $targetPortfolio['id'],
                ]);
                $moved['portfolios'] += $statement->rowCount();

                $delete = $this->db->prepare('DELETE FROM portfolios WHERE id = :id');
                $delete->execute(['id' => (int) $guestPortfolio['id']]);
            }

            $statement = $this->db->prepare('UPDATE transactions SET user_id = :target, updated_at = :updated_at WHERE user_id = :guest');
            $statement->execute([
                'target' => $targetUserId,
                'updated_at' => $this->now(),
                'guest' => $guestUserId,
            ]);
            $moved['transactions'] += $statement->rowCount();

            $watchlists = $this->fetchRows('SELECT * FROM watchlists WHERE user_id = :user_id', ['user_id' => $guestUserId]);
            foreach ($watchlists as $item) {
                $statement = $this->db->prepare(
                    'INSERT IGNORE INTO watchlists (user_id, stock_id, created_at, updated_at)
                     VALUES (:user_id, :stock_id, :created_at, :updated_at)'
                );
                $statement->execute([
                    'user_id' => $targetUserId,
                    'stock_id' => (int) $item['stock_id'],
                    'created_at' => $item['created_at'] ?? $this->now(),
                    'updated_at' => $this->now(),
                ]);
                $moved['watchlists'] += $statement->rowCount();
            }
            $this->db->prepare('DELETE FROM watchlists WHERE user_id = :user_id')->execute(['user_id' => $guestUserId]);

            $targetSettings = $this->fetchRow('SELECT id FROM user_settings WHERE user_id = :user_id LIMIT 1', [
                'user_id' => $targetUserId,
            ]);
            if (!$targetSettings) {
                $statement = $this->db->prepare('UPDATE user_settings SET user_id = :target, updated_at = :updated_at WHERE user_id = :guest');
                $statement->execute([
                    'target' => $targetUserId,
                    'updated_at' => $this->now(),
                    'guest' => $guestUserId,
                ]);
                $moved['user_settings'] += $statement->rowCount();
            }

            if ($this->tableExists('user_achievements')) {
                $achievements = $this->fetchRows('SELECT * FROM user_achievements WHERE user_id = :user_id', [
                    'user_id' => $guestUserId,
                ]);
                foreach ($achievements as $achievement) {
                    $statement = $this->db->prepare(
                        'INSERT IGNORE INTO user_achievements
                         (user_id, achievement_id, progress, is_earned, earned_at, created_at, updated_at)
                         VALUES (:user_id, :achievement_id, :progress, :is_earned, :earned_at, :created_at, :updated_at)'
                    );
                    $statement->execute([
                        'user_id' => $targetUserId,
                        'achievement_id' => (int) $achievement['achievement_id'],
                        'progress' => $achievement['progress'],
                        'is_earned' => (int) $achievement['is_earned'],
                        'earned_at' => $achievement['earned_at'],
                        'created_at' => $achievement['created_at'] ?? $this->now(),
                        'updated_at' => $this->now(),
                    ]);
                    $moved['user_achievements'] += $statement->rowCount();
                }
                $this->db->prepare('DELETE FROM user_achievements WHERE user_id = :user_id')->execute(['user_id' => $guestUserId]);
            }

            $statement = $this->db->prepare('DELETE FROM users WHERE id = :id');
            $statement->execute(['id' => $guestUserId]);
            $moved['users'] = $statement->rowCount();

            if (array_sum($moved) === 0) {
                throw new RuntimeException('No guest data was moved.');
            }

            return $moved;
        });
    }

    private function countUsers(): int
    {
        $statement = $this->db->prepare('SELECT COUNT(*) FROM users');
        $statement->execute();

        return (int) $statement->fetchColumn();
    }

    private function uniqueUsername(string $baseUsername): string
    {
        $baseUsername = trim(preg_replace('/[^a-zA-Z0-9_]/', '_', $baseUsername) ?? '', '_');
        if ($baseUsername === '') {
            $baseUsername = 'webhatchery_user';
        }

        $username = $baseUsername;
        $counter = 1;
        while ($this->findByUsername($username)) {
            $counter++;
            $username = $baseUsername . '_' . $counter;
        }

        return $username;
    }

    private function uniqueEmail(string $username, string $domain): string
    {
        $base = preg_replace('/[^a-zA-Z0-9_]/', '_', $username) ?: 'webhatchery_user';
        $email = $base . $domain;
        $counter = 1;
        while ($this->findByEmail($email)) {
            $counter++;
            $email = $base . '_' . $counter . $domain;
        }

        return $email;
    }

    private function fallbackUsername(string $externalId, bool $isGuest): string
    {
        $clean = preg_replace('/[^a-zA-Z0-9_]/', '_', $externalId) ?: bin2hex(random_bytes(4));
        return ($isGuest ? 'guest_' : 'wh_user_') . substr($clean, 0, 24);
    }

    private function valueExistsForAnotherUser(string $column, string $value, int $userId): bool
    {
        if (!in_array($column, ['username', 'email', 'auth0_id'], true)) {
            throw new RuntimeException('Unsupported uniqueness column.');
        }

        $statement = $this->db->prepare(sprintf('SELECT id FROM users WHERE %s = :value AND id != :id LIMIT 1', $column));
        $statement->execute(['value' => $value, 'id' => $userId]);

        return (bool) $statement->fetch();
    }

    /**
     * @param array<string, mixed> $params
     * @return array<string, mixed>|null
     */
    private function fetchRow(string $sql, array $params): ?array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);
        $row = $statement->fetch();

        return is_array($row) ? $row : null;
    }

    /**
     * @param array<string, mixed> $params
     * @return list<array<string, mixed>>
     */
    private function fetchRows(string $sql, array $params): array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll();
    }

    private function tableExists(string $table): bool
    {
        $statement = $this->db->prepare('SHOW TABLES LIKE :table_name');
        $statement->execute(['table_name' => $table]);

        return (bool) $statement->fetch();
    }

    private function toBool(mixed $value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_numeric($value)) {
            return (int) $value === 1;
        }
        if (is_string($value)) {
            return in_array(strtolower(trim($value)), ['1', 'true', 'yes'], true);
        }

        return false;
    }
}
