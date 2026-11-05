<?php
// Compatibility endpoint for removing a bookmark from the saved-articles page.
require_once __DIR__ . '/bootstrap.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();
    $articleId = (int) ($_POST['article_id'] ?? 0);
    $conn->prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?')
        ->execute([user_id(), $articleId]);
}

header('Location: bookmarks.php');
exit;
