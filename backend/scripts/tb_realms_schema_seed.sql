-- Tradeborn Realms schema + initial seed data
-- Generated from backend model schema definitions and GameDataSeeder

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `auth0_id` VARCHAR(255) NULL,
  `email` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NULL,
  `first_name` VARCHAR(255) NULL,
  `last_name` VARCHAR(255) NULL,
  `display_name` VARCHAR(255) NULL,
  `avatar_url` TEXT NULL,
  `role` ENUM('player','admin','moderator') NOT NULL DEFAULT 'player',
  `starting_balance` DECIMAL(15,2) NOT NULL DEFAULT 10000.00,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login_at` TIMESTAMP NULL,
  `email_verified_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_auth0_id_unique` (`auth0_id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_auth0_id_index` (`auth0_id`),
  KEY `users_email_index` (`email`),
  KEY `users_username_index` (`username`),
  KEY `users_role_index` (`role`),
  KEY `users_is_active_index` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stocks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `symbol` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `guild` VARCHAR(255) NULL,
  `category` VARCHAR(255) NULL,
  `current_price` DECIMAL(10,4) NOT NULL,
  `previous_close` DECIMAL(10,4) NULL,
  `day_change` DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
  `day_change_percentage` DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  `market_cap` BIGINT NULL,
  `volume` BIGINT NOT NULL DEFAULT 0,
  `avg_volume` BIGINT NOT NULL DEFAULT 0,
  `pe_ratio` DECIMAL(8,2) NULL,
  `dividend_yield` DECIMAL(6,4) NULL,
  `beta` DECIMAL(6,4) NULL,
  `week_52_high` DECIMAL(10,4) NULL,
  `week_52_low` DECIMAL(10,4) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `stocks_symbol_unique` (`symbol`),
  KEY `stocks_symbol_index` (`symbol`),
  KEY `stocks_guild_index` (`guild`),
  KEY `stocks_category_index` (`category`),
  KEY `stocks_current_price_index` (`current_price`),
  KEY `stocks_is_active_index` (`is_active`),
  KEY `stocks_market_cap_index` (`market_cap`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `achievements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `type` ENUM('count','value','percentage','streak') NOT NULL DEFAULT 'count',
  `target_value` DECIMAL(15,2) NOT NULL,
  `reward_points` INT NOT NULL DEFAULT 0,
  `reward_title` VARCHAR(255) NULL,
  `icon_url` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `achievements_category_index` (`category`),
  KEY `achievements_type_index` (`type`),
  KEY `achievements_is_active_index` (`is_active`),
  KEY `achievements_sort_order_index` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `portfolios` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `cash_balance` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_value` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_invested` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_profit_loss` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `performance_percentage` DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  `risk_level` ENUM('conservative','moderate','aggressive') NOT NULL DEFAULT 'moderate',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `portfolios_user_id_index` (`user_id`),
  KEY `portfolios_performance_percentage_index` (`performance_percentage`),
  KEY `portfolios_total_value_index` (`total_value`),
  CONSTRAINT `portfolios_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `notifications_enabled` TINYINT(1) NOT NULL DEFAULT 1,
  `email_notifications` TINYINT(1) NOT NULL DEFAULT 1,
  `push_notifications` TINYINT(1) NOT NULL DEFAULT 1,
  `trading_notifications` TINYINT(1) NOT NULL DEFAULT 1,
  `achievement_notifications` TINYINT(1) NOT NULL DEFAULT 1,
  `market_alerts` TINYINT(1) NOT NULL DEFAULT 0,
  `theme_preference` ENUM('light','dark','auto') NOT NULL DEFAULT 'auto',
  `language` VARCHAR(5) NOT NULL DEFAULT 'en',
  `timezone` VARCHAR(50) NOT NULL DEFAULT 'UTC',
  `currency_display` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `portfolio_privacy` ENUM('public','friends','private') NOT NULL DEFAULT 'private',
  `auto_invest_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `risk_tolerance` ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_settings_user_id_unique` (`user_id`),
  KEY `user_settings_user_id_index` (`user_id`),
  KEY `user_settings_theme_preference_index` (`theme_preference`),
  KEY `user_settings_portfolio_privacy_index` (`portfolio_privacy`),
  CONSTRAINT `user_settings_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `market_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `event_type` ENUM('market_crash','bull_run','sector_boom','economic_news','company_news','natural_disaster') NOT NULL,
  `severity` ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  `affected_sectors` JSON NULL,
  `affected_stocks` JSON NULL,
  `impact_percentage` DECIMAL(8,4) NOT NULL DEFAULT 0.0000,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `starts_at` TIMESTAMP NOT NULL,
  `ends_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `market_events_event_type_index` (`event_type`),
  KEY `market_events_severity_index` (`severity`),
  KEY `market_events_is_active_index` (`is_active`),
  KEY `market_events_starts_at_index` (`starts_at`),
  KEY `market_events_ends_at_index` (`ends_at`),
  KEY `market_events_starts_at_ends_at_index` (`starts_at`, `ends_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `watchlists` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `stock_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `watchlists_user_id_stock_id_unique` (`user_id`, `stock_id`),
  KEY `watchlists_user_id_index` (`user_id`),
  KEY `watchlists_stock_id_index` (`stock_id`),
  CONSTRAINT `watchlists_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `watchlists_stock_id_foreign`
    FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `transactions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `portfolio_id` BIGINT UNSIGNED NOT NULL,
  `stock_id` BIGINT UNSIGNED NOT NULL,
  `type` ENUM('buy','sell') NOT NULL,
  `quantity` INT NOT NULL,
  `price_per_share` DECIMAL(10,4) NOT NULL,
  `total_amount` DECIMAL(15,2) NOT NULL,
  `fees` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  KEY `transactions_user_id_portfolio_id_index` (`user_id`, `portfolio_id`),
  KEY `transactions_stock_id_index` (`stock_id`),
  KEY `transactions_type_index` (`type`),
  KEY `transactions_status_index` (`status`),
  KEY `transactions_created_at_index` (`created_at`),
  CONSTRAINT `transactions_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_portfolio_id_foreign`
    FOREIGN KEY (`portfolio_id`) REFERENCES `portfolios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `transactions_stock_id_foreign`
    FOREIGN KEY (`stock_id`) REFERENCES `stocks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_achievements` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `achievement_id` BIGINT UNSIGNED NOT NULL,
  `progress` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `is_earned` TINYINT(1) NOT NULL DEFAULT 0,
  `earned_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_achievements_user_id_achievement_id_unique` (`user_id`, `achievement_id`),
  KEY `user_achievements_user_id_index` (`user_id`),
  KEY `user_achievements_achievement_id_index` (`achievement_id`),
  KEY `user_achievements_is_earned_index` (`is_earned`),
  KEY `user_achievements_earned_at_index` (`earned_at`),
  CONSTRAINT `user_achievements_user_id_foreign`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_achievements_achievement_id_foreign`
    FOREIGN KEY (`achievement_id`) REFERENCES `achievements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Initial seed data

INSERT INTO `stocks` (
  `symbol`, `name`, `category`, `guild`, `current_price`, `day_change_percentage`, `market_cap`, `description`,
  `created_at`, `updated_at`
)
VALUES
  ('TECH', 'TechCorp Industries', 'Technology', 'Innovation Guild', 125.5000,  2.3400, 50000000, 'Leading technology company in magical automation', NOW(), NOW()),
  ('MINE', 'Dwarven Mining Co.', 'Mining', 'Miners Guild', 87.2500, -1.4500, 25000000, 'Premier mining operation in the mountain regions', NOW(), NOW()),
  ('HEAL', 'Divine Healing Arts', 'Healthcare', 'Healers Guild', 230.7500,  4.6700, 75000000, 'Magical healthcare and potion manufacturing', NOW(), NOW()),
  ('WARD', 'Guardian Defense Systems', 'Defense', 'Warriors Guild', 156.8000,  1.2300, 45000000, 'Advanced magical defense and protection services', NOW(), NOW()),
  ('ELEM', 'Elemental Energy Corp', 'Energy', 'Mages Guild', 92.4000, -0.8900, 35000000, 'Harnessing elemental forces for power generation', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `guild` = VALUES(`guild`),
  `current_price` = VALUES(`current_price`),
  `day_change_percentage` = VALUES(`day_change_percentage`),
  `market_cap` = VALUES(`market_cap`),
  `description` = VALUES(`description`),
  `updated_at` = NOW();

INSERT INTO `users` (
  `email`, `username`, `password`, `starting_balance`, `role`, `is_active`, `created_at`, `updated_at`
)
VALUES
  ('demo@tradebornrealms.com', 'demo_trader', '$2y$12$QseXahEegfFyIAUI1Va2vuqoaYucqbRrpkUAWOk7P58wk3RkyCQUe', 10000.00, 'player', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `starting_balance` = VALUES(`starting_balance`),
  `role` = VALUES(`role`),
  `is_active` = VALUES(`is_active`),
  `updated_at` = NOW();
