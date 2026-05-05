Tradeborn Realms Backend
========================

PHP backend for the Tradeborn Realms WebHatchery game app.

Architecture
------------

- `public/index.php`: HTTP entry point and dependency wiring.
- `src/Controllers`: thin request handlers.
- `src/Actions`: validation and game/auth orchestration.
- `src/Models`: simple DTO-style runtime objects with array export helpers.
- `src/Repositories`: raw PDO data access with prepared statements.
- `src/Middleware`: WebHatchery bearer-token authentication.
- `database/migrations`: ordered SQL schema and seed migrations.

Environment
-----------

Required backend variables:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `WEB_HATCHERY_LOGIN_URL`
- `APP_ENV`

Missing required variables fail fast during bootstrap. `DB_PASSWORD` may be present and empty for local database setups that use an empty password.

Auth
----

The backend uses shared WebHatchery bearer tokens only. It does not provide local login or registration endpoints.

Unauthenticated protected requests return `401` JSON with `login_url`. Guest play is supported through `POST /api/auth/guest-session`; guest progress is linked by posting a guest JWT to `POST /api/auth/link-guest` while authenticated as a non-guest user.

Migrations
----------

Run migrations manually from the backend directory:

```powershell
.\init-db.ps1
```

The runner executes every sortable SQL file in `database/migrations`. The current migration uses repeatable-safe `CREATE TABLE IF NOT EXISTS` and `ON DUPLICATE KEY UPDATE` seed statements where practical.

Scripts
-------

```powershell
composer run start
composer run test
composer run cs-check
composer run cs-fix
```
