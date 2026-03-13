<?php

declare(strict_types=1);

namespace App\Http\Controllers\Legacy;

use App\Support\LegacySessionBridge;
use App\Support\PhpPageRenderer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class SeasonOnePageController
{
    public function __invoke(Request $request, PhpPageRenderer $renderer): Response
    {
        LegacySessionBridge::bootstrap($request);

        return $renderer->render('season1', [
            'isLoggedIn' => LegacySessionBridge::userId($request) > 0,
            'username' => LegacySessionBridge::username($request) ?: null,
        ]);
    }
}
