<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/subscription_notifications.php';
require_login();
ensure_subscription_notification_tables($conn);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['success' => false, 'message' => 'Method not allowed'], 405);
}
verify_csrf();

$action = (string)($_POST['action'] ?? 'list');
$cat = ucfirst(strtolower(trim((string)($_POST['category'] ?? ''))));
$uid = user_id();

if (in_array($action, ['subscribe', 'unsubscribe'], true) && !in_array($cat, categories(), true)) {
    json_out(['success' => false, 'message' => 'Invalid category'], 422);
}

if ($action === 'subscribe') {
    $insert = $conn->prepare('INSERT IGNORE INTO subscriptions (user_id, category) VALUES (?, ?)');
    $insert->execute([$uid, $cat]);
    seed_subscription_activity($conn, $uid, $cat);
}

if ($action === 'unsubscribe') {
    $conn->prepare('DELETE FROM subscriptions WHERE user_id = ? AND category = ?')->execute([$uid, $cat]);
    $conn->prepare('DELETE FROM subscription_activity_state WHERE user_id = ? AND category = ?')->execute([$uid, $cat]);
}

if ($action === 'subscribe_all') {
    foreach (categories() as $category) {
        $conn->prepare('INSERT IGNORE INTO subscriptions (user_id, category) VALUES (?, ?)')->execute([$uid, $category]);
        seed_subscription_activity($conn, $uid, $category);
    }
}

if ($action === 'clear_all') {
    $conn->prepare('DELETE FROM subscriptions WHERE user_id = ?')->execute([$uid]);
    $conn->prepare('DELETE FROM subscription_activity_state WHERE user_id = ?')->execute([$uid]);
}

if (!in_array($action, ['subscribe', 'unsubscribe', 'subscribe_all', 'clear_all', 'list'], true)) {
    json_out(['success' => false, 'message' => 'Unknown action'], 422);
}

$s = $conn->prepare('SELECT category FROM subscriptions WHERE user_id = ?');
$s->execute([$uid]);
$subscribedCategories = $s->fetchAll(PDO::FETCH_COLUMN);
foreach ($subscribedCategories as $category) {
    seed_subscription_activity($conn, $uid, (string)$category);
}

json_out(['success' => true, 'subscribed' => array_map('strtolower', $subscribedCategories)]);