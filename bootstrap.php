<?php

declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
require_once __DIR__ . '/db.php';
function logged(): bool
{
    return isset($_SESSION['user_id']);
}
function require_login(): void
{
    if (!logged()) {
        header('Location: login.html');
        exit;
    }
}
function user_id(): int
{
    return (int)($_SESSION['user_id'] ?? 0);
}
function esc($v): string
{
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}
function csrf(): string
{
    if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['csrf'];
}
function verify_csrf(): void
{
    if (!hash_equals(csrf(), (string)($_POST['csrf'] ?? ''))) {
        http_response_code(419);
        exit('Invalid form token');
    }
}
function json_out(array $a, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($a);
    exit;
}
function categories(): array
{
    return ['Academic', 'Sports', 'Events', 'General'];
}
