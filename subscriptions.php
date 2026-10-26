
<?php
session_start();
include "db.php";

header("Content-Type: application/json");

// Until login is ready, user 1 is used.
// Later change this to the group's session variable.
$user_id = isset($_SESSION['user_id']) ? (int) $_SESSION['user_id'] : 1;

$allowed = ["academic", "events", "sports", "general"];

$action = isset($_POST['action']) ? $_POST['action'] : "list";
$category = isset($_POST['category']) ? $_POST['category'] : "";

if ($action === "subscribe" && in_array($category, $allowed)) {
    $stmt = $conn->prepare("INSERT IGNORE INTO subscriptions (user_id, category) VALUES (?, ?)");
    $stmt->bind_param("is", $user_id, $category);
    $stmt->execute();

} elseif ($action === "unsubscribe" && in_array($category, $allowed)) {
    $stmt = $conn->prepare("DELETE FROM subscriptions WHERE user_id = ? AND category = ?");
    $stmt->bind_param("is", $user_id, $category);
    $stmt->execute();

} elseif ($action === "subscribe_all") {
    foreach ($allowed as $item) {
        $stmt = $conn->prepare("INSERT IGNORE INTO subscriptions (user_id, category) VALUES (?, ?)");
        $stmt->bind_param("is", $user_id, $item);
        $stmt->execute();
    }

} elseif ($action === "clear_all") {
    $stmt = $conn->prepare("DELETE FROM subscriptions WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
}

// Always send back the current list
$stmt = $conn->prepare("SELECT category FROM subscriptions WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$list = [];
while ($row = $result->fetch_assoc()) {
    $list[] = $row['category'];
}

echo json_encode(["ok" => true, "subscribed" => $list]);
?>