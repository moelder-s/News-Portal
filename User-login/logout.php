<?php

declare(strict_types=1);
if (session_status() !== PHP_SESSION_ACTIVE) session_start();
require_once __DIR__ . '/db.php';
try {
    $stmt = $conn->prepare('DELETE FROM user_presence WHERE session_key=?');
    $stmt->execute([hash('sha256', session_id())]);
} catch (Throwable $e) {
    error_log('Logout presence cleanup: ' . $e->getMessage());
}
$_SESSION = [];
session_regenerate_id(true);
session_destroy();
header('Location: home.php');
exit;
