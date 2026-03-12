<?php

declare(strict_types=1);

return [
    'base_path' => getenv('STORAGE_PATH') ?: 'storage',
    'logs_path' => getenv('STORAGE_LOGS_PATH') ?: 'logs',
    'ratelimits_path' => getenv('STORAGE_RATELIMITS_PATH') ?: 'ratelimits',
    'tmp_path' => getenv('STORAGE_TMP_PATH') ?: 'tmp',
];
