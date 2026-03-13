<?php

declare(strict_types=1);

return [
    'base_path' => getenv('STORAGE_PATH') ?: 'storage',
    'logs_path' => getenv('STORAGE_LOGS_PATH') ?: 'logs',
    'ratelimits_path' => getenv('STORAGE_RATELIMITS_PATH') ?: 'ratelimits',
    'sessions_path' => getenv('STORAGE_SESSIONS_PATH') ?: 'sessions',
    'tmp_path' => getenv('STORAGE_TMP_PATH') ?: 'tmp',
];
