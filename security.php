<?php

declare(strict_types=1);

function app_is_https(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') {
        return true;
    }

    return (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443;
}

function app_start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        if (!isset($_SESSION['_csrf_token'])) {
            $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
        }
        return;
    }

    ini_set('session.use_only_cookies', '1');
    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');
    if (app_is_https()) {
        ini_set('session.cookie_secure', '1');
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => app_is_https(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();

    if (!isset($_SESSION['_csrf_token'])) {
        $_SESSION['_csrf_token'] = bin2hex(random_bytes(32));
    }
}

function app_csrf_token(): string
{
    app_start_session();
    return (string) ($_SESSION['_csrf_token'] ?? '');
}

function app_request_json(): array
{
    static $input = null;

    if ($input !== null) {
        return $input;
    }

    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw ?: '', true);
    $input = is_array($decoded) ? $decoded : [];

    return $input;
}

function app_request_csrf_token(): string
{
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (is_string($headerToken) && $headerToken !== '') {
        return $headerToken;
    }

    $json = app_request_json();
    if (isset($json['csrf']) && is_string($json['csrf'])) {
        return $json['csrf'];
    }

    if (isset($_POST['csrf']) && is_string($_POST['csrf'])) {
        return $_POST['csrf'];
    }

    return '';
}

function app_verify_csrf(?string $token = null): bool
{
    app_start_session();
    $expected = (string) ($_SESSION['_csrf_token'] ?? '');
    $actual = $token ?? app_request_csrf_token();

    return $expected !== '' && $actual !== '' && hash_equals($expected, $actual);
}

function app_storage_path(string $relativePath = ''): string
{
    $base = __DIR__ . '/storage';
    if (!is_dir($base)) {
        mkdir($base, 0755, true);
    }

    if ($relativePath === '') {
        return $base;
    }

    return $base . '/' . ltrim(str_replace('\\', '/', $relativePath), '/');
}

function app_ensure_dir(string $path): void
{
    if (!is_dir($path)) {
        mkdir($path, 0755, true);
    }
}

function app_client_ip(): string
{
    $keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    foreach ($keys as $key) {
        $value = trim((string) ($_SERVER[$key] ?? ''));
        if ($value === '') {
            continue;
        }

        if ($key === 'HTTP_X_FORWARDED_FOR') {
            $parts = explode(',', $value);
            $value = trim((string) ($parts[0] ?? ''));
        }

        return substr($value, 0, 64);
    }

    return 'unknown';
}

function app_security_log(string $event, array $context = []): void
{
    $dir = app_storage_path('logs');
    app_ensure_dir($dir);

    $entry = [
        'ts' => gmdate('c'),
        'event' => $event,
        'ip' => app_client_ip(),
        'user_id' => (int) ($_SESSION['user_id'] ?? 0),
        'session_id' => session_id(),
        'context' => $context,
    ];

    $line = json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($line === false) {
        return;
    }

    file_put_contents($dir . '/security.log', $line . PHP_EOL, FILE_APPEND | LOCK_EX);
}

function app_rate_limit(string $scope, int $limit, int $windowSeconds, ?string $identity = null): array
{
    $dir = app_storage_path('ratelimits');
    app_ensure_dir($dir);

    $id = $identity ?? app_client_ip();
    $key = hash('sha256', $scope . '|' . $id);
    $path = $dir . '/' . $key . '.json';
    $now = time();

    $attempts = [];
    if (is_file($path)) {
        $raw = file_get_contents($path);
        $decoded = json_decode($raw ?: '[]', true);
        if (is_array($decoded)) {
            $attempts = array_values(array_filter($decoded, static function ($ts) use ($now, $windowSeconds): bool {
                return is_int($ts) && ($now - $ts) < $windowSeconds;
            }));
        }
    }

    if (count($attempts) >= $limit) {
        $oldest = (int) ($attempts[0] ?? $now);
        return [
            'allowed' => false,
            'retry_after' => max(1, $windowSeconds - ($now - $oldest)),
        ];
    }

    $attempts[] = $now;
    file_put_contents($path, json_encode($attempts), LOCK_EX);

    return [
        'allowed' => true,
        'retry_after' => 0,
    ];
}
