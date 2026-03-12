<?php

declare(strict_types=1);

namespace App\Application\Auth;

use App\Http\ApiResponse;
use RuntimeException;

final class AuthController
{
    public function __construct(private readonly AuthService $service) {}

    public function handle(string $method, array $input, array $post, array $get): never
    {
        if ($method === 'GET') {
            $action = (string) ($get['action'] ?? '');
            if ($action === 'me') {
                ApiResponse::success($this->service->me());
            }

            ApiResponse::error('Method not allowed', 405);
        }

        $action = (string) ($input['action'] ?? $post['action'] ?? '');

        switch ($action) {
            case 'login':
                $this->requireCsrf('login');
                $this->limitOrFail('auth:login', 10, 300, 'login');

                try {
                    ApiResponse::success($this->service->login(
                        (string) ($input['username'] ?? $post['username'] ?? ''),
                        (string) ($input['password'] ?? $post['password'] ?? ''),
                    ));
                } catch (RuntimeException $e) {
                    $message = $e->getMessage();
                    $status = $message === 'Неверный логин или пароль' ? 401 : 422;
                    $reason = $message === 'Заполни все поля' ? 'empty_fields' : 'invalid_credentials';
                    app_security_log($message === 'Неверный логин или пароль' ? 'auth_login_failed' : 'auth_validation_failed', [
                        'action' => 'login',
                        'reason' => $reason,
                        'username' => (string) ($input['username'] ?? $post['username'] ?? ''),
                    ]);
                    ApiResponse::error($message, $status);
                }

            case 'register':
                $this->requireCsrf('register');
                $this->limitOrFail('auth:register', 5, 600, 'register');

                try {
                    ApiResponse::success($this->service->register(
                        (string) ($input['username'] ?? $post['username'] ?? ''),
                        (string) ($input['password'] ?? $post['password'] ?? ''),
                        (string) ($input['confirm'] ?? $post['confirm'] ?? ''),
                    ));
                } catch (RuntimeException $e) {
                    $message = $e->getMessage();
                    $username = (string) ($input['username'] ?? $post['username'] ?? '');
                    $status = match ($message) {
                        'Этот логин уже занят' => 409,
                        default => 422,
                    };
                    $event = $message === 'Этот логин уже занят' ? 'auth_register_duplicate' : 'auth_validation_failed';
                    app_security_log($event, [
                        'action' => 'register',
                        'username' => $username,
                        'reason' => match ($message) {
                            'Заполни все поля' => 'empty_fields',
                            'Логин: 3–20 символов, только буквы, цифры, _' => 'bad_username',
                            'Пароль минимум 6 символов' => 'short_password',
                            'Пароли не совпадают' => 'password_mismatch',
                            default => 'duplicate_username',
                        },
                    ]);
                    ApiResponse::error($message, $status);
                }

            case 'logout':
                $this->requireCsrf('logout');
                $this->limitOrFail('auth:logout', 20, 300, 'logout', session_id() . '|' . app_client_ip());
                $this->service->logout();
                ApiResponse::success();

                // no break
            default:
                app_security_log('auth_unknown_action', ['action' => $action]);
                ApiResponse::error('Unknown action', 400);
        }
    }

    private function requireCsrf(string $action): void
    {
        if (app_verify_csrf()) {
            return;
        }

        app_security_log('csrf_failed', ['endpoint' => 'auth', 'action' => $action]);
        ApiResponse::error('CSRF token invalid', 403);
    }

    private function limitOrFail(string $scope, int $limit, int $windowSeconds, string $action, ?string $identity = null): void
    {
        $result = app_rate_limit($scope, $limit, $windowSeconds, $identity);
        if (($result['allowed'] ?? false) === true) {
            return;
        }

        app_security_log('rate_limited', [
            'endpoint' => 'auth',
            'action' => $action,
            'scope' => $scope,
            'retry_after' => $result['retry_after'] ?? 0,
        ]);

        ApiResponse::error('Слишком много запросов. Попробуй позже.', 429, [
            'retryAfter' => (int) ($result['retry_after'] ?? 60),
        ]);
    }
}
