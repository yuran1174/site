<?php

declare(strict_types=1);

return [
    'driver' => getenv('DB_DRIVER') ?: 'sqlite',
    'path' => getenv('DB_PATH') ?: 'db/game.sqlite',
];
