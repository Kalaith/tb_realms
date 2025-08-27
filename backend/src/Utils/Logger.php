<?php

namespace App\Utils;

/**
 * Simple Logger utility
 * Placeholder implementation until Monolog is installed
 */
class Logger
{
    /**
     * Log an error message
     */
    public static function error(string $message, array $context = []): void
    {
        self::log('ERROR', $message, $context);
    }

    /**
     * Log a warning message
     */
    public static function warning(string $message, array $context = []): void
    {
        self::log('WARNING', $message, $context);
    }

    /**
     * Log an info message
     */
    public static function info(string $message, array $context = []): void
    {
        self::log('INFO', $message, $context);
    }

    /**
     * Log a debug message
     */
    public static function debug(string $message, array $context = []): void
    {
        if (($_ENV['APP_DEBUG'] ?? false) && ($_ENV['LOG_LEVEL'] ?? 'info') === 'debug') {
            self::log('DEBUG', $message, $context);
        }
    }

    /**
     * Write log message to file and error log
     */
    private static function log(string $level, string $message, array $context = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
        $logMessage = "[{$timestamp}] {$level}: {$message}{$contextStr}";

        // Log to PHP error log
        error_log($logMessage);

        // Also log to file if storage directory exists
        $logDir = __DIR__ . '/../../storage/logs';
        if (is_dir($logDir)) {
            $logFile = $logDir . '/app.log';
            file_put_contents($logFile, $logMessage . "\n", FILE_APPEND | LOCK_EX);
        }
    }
}
