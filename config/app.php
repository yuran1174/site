<?php

declare(strict_types=1);

return [
    'env' => getenv('APP_ENV') ?: 'development',
    'debug' => filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOL),
    'url' => getenv('APP_URL') ?: 'http://localhost',
    'timezone' => getenv('APP_TIMEZONE') ?: 'Europe/Moscow',
    'display_errors' => filter_var(getenv('APP_DISPLAY_ERRORS') ?: (getenv('APP_DEBUG') ?: 'false'), FILTER_VALIDATE_BOOL),
    'log_errors' => filter_var(getenv('APP_LOG_ERRORS') ?: 'true', FILTER_VALIDATE_BOOL),
];
