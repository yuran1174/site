<?php
declare(strict_types=1);

return [
    'driver' => 'sqlite',
    'path' => getenv('DB_PATH') ?: 'db/game.sqlite',
];
