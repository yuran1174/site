<?php

declare(strict_types=1);

return [
    'session' => [
        'use_only_cookies' => filter_var(getenv('SESSION_USE_ONLY_COOKIES') ?: 'true', FILTER_VALIDATE_BOOL),
        'use_strict_mode' => filter_var(getenv('SESSION_USE_STRICT_MODE') ?: 'true', FILTER_VALIDATE_BOOL),
        'cookie_httponly' => filter_var(getenv('SESSION_COOKIE_HTTPONLY') ?: 'true', FILTER_VALIDATE_BOOL),
        'cookie_secure' => filter_var(getenv('SESSION_COOKIE_SECURE') ?: 'false', FILTER_VALIDATE_BOOL),
        'cookie_samesite' => getenv('SESSION_COOKIE_SAMESITE') ?: 'Lax',
        'cookie_path' => getenv('SESSION_COOKIE_PATH') ?: '/',
        'cookie_domain' => getenv('SESSION_COOKIE_DOMAIN') ?: '',
    ],
];
