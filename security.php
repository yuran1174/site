<?php

declare(strict_types=1);

function app_config_value(string $key, mixed $default = null): mixed
{
    if (class_exists(\App\Bootstrap\Config::class)) {
        return \App\Bootstrap\Config::get($key, $default);
    }

    return $default;
}

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

    $cookieSecure = (bool) app_config_value('security.session.cookie_secure', false);
    $isSecure = $cookieSecure || app_is_https();
    $sameSite = (string) app_config_value('security.session.cookie_samesite', 'Lax');
    $sessionPath = app_storage_path((string) app_config_value('storage.sessions_path', 'sessions'));
    app_ensure_dir($sessionPath);

    ini_set('session.use_only_cookies', app_config_value('security.session.use_only_cookies', true) ? '1' : '0');
    ini_set('session.use_strict_mode', app_config_value('security.session.use_strict_mode', true) ? '1' : '0');
    ini_set('session.cookie_httponly', app_config_value('security.session.cookie_httponly', true) ? '1' : '0');
    ini_set('session.cookie_samesite', $sameSite);
    ini_set('session.save_path', $sessionPath);
    if ($isSecure) {
        ini_set('session.cookie_secure', '1');
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => (string) app_config_value('security.session.cookie_path', '/'),
        'domain' => (string) app_config_value('security.session.cookie_domain', ''),
        'secure' => $isSecure,
        'httponly' => (bool) app_config_value('security.session.cookie_httponly', true),
        'samesite' => $sameSite,
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
    $configuredBase = (string) app_config_value('storage.base_path', 'storage');
    $base = app_resolve_project_path($configuredBase);
    if (!is_dir($base)) {
        mkdir($base, 0755, true);
    }

    if ($relativePath === '') {
        return $base;
    }

    return $base . '/' . ltrim(str_replace('\\', '/', $relativePath), '/');
}

function app_resolve_project_path(string $path): string
{
    $normalized = str_replace('\\', '/', $path);
    if (preg_match('/^[A-Za-z]:\//', $normalized) === 1 || str_starts_with($normalized, '/')) {
        return $normalized;
    }

    return __DIR__ . '/' . ltrim($normalized, '/');
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
    $dir = app_storage_path((string) app_config_value('storage.logs_path', 'logs'));
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
    $dir = app_storage_path((string) app_config_value('storage.ratelimits_path', 'ratelimits'));
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
