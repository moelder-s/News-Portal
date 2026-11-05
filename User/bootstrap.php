<?php

declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/db.php';

/** Return whether a user is authenticated. */
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
    return (int) ($_SESSION['user_id'] ?? 0);
}

/** Escape untrusted values before inserting them into HTML or attributes. */
function esc(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }

    return (string) $_SESSION['csrf'];
}

function verify_csrf(): void
{
    if (!hash_equals(csrf(), (string) ($_POST['csrf'] ?? ''))) {
        http_response_code(419);
        exit('Invalid form token');
    }
}

function json_out(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function categories(): array
{
    return ['Academic', 'Sports', 'Events', 'General'];
}
