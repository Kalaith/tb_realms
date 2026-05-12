-- Bring older Tradeborn Realms databases up to the WebHatchery auth schema
-- before the main repeatable seed migration runs.
-- Fresh databases do not have a users table yet, so each step no-ops.

SET @schema_name := DATABASE();

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users') > 0
  AND
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'auth0_id') = 0,
  'ALTER TABLE `users` ADD COLUMN `auth0_id` VARCHAR(255) NULL AFTER `id`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users') > 0
  AND
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password') = 0,
  'ALTER TABLE `users` ADD COLUMN `password` VARCHAR(255) NULL AFTER `username`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users') > 0
  AND
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'display_name') = 0,
  'ALTER TABLE `users` ADD COLUMN `display_name` VARCHAR(255) NULL AFTER `last_name`',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'auth0_id') > 0
  AND
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users' AND INDEX_NAME = 'users_auth0_id_unique') = 0,
  'ALTER TABLE `users` ADD UNIQUE KEY `users_auth0_id_unique` (`auth0_id`)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users') > 0,
  'ALTER TABLE `users` MODIFY COLUMN `role` ENUM(''user'',''player'',''admin'',''moderator'') NOT NULL DEFAULT ''player''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users') > 0,
  'UPDATE `users` SET `role` = ''player'' WHERE `role` = ''user''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql := IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE TABLE_SCHEMA = @schema_name AND TABLE_NAME = 'users') > 0,
  'ALTER TABLE `users` MODIFY COLUMN `role` ENUM(''player'',''admin'',''moderator'') NOT NULL DEFAULT ''player''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
