<?php
declare(strict_types=1);

namespace App\Http;

final class ApiResponse
{
    public static function json(array $payload, int $statusCode = 200): never
    {
        if (!headers_sent()) {
            http_response_code($statusCode);
            header('Content-Type: application/json; charset=utf-8');
        }

        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success(array $payload = [], int $statusCode = 200): never
    {
        self::json(['success' => true] + $payload, $statusCode);
    }

    public static function error(string $message, int $statusCode = 200, array $payload = []): never
    {
        self::json(['error' => $message] + $payload, $statusCode);
    }
}
