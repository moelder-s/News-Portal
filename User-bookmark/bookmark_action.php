<?php
require_once __DIR__ . '/bootstrap.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['success' => false, 'message' => 'POST required.'], 405);
}

$token = (string)($_POST['csrf'] ?? '');
if (!hash_equals(csrf(), $token)) {
    json_out(['success' => false, 'message' => 'Your session token expired. Refresh the page and try again.'], 419);
}

$articleId = (int)($_POST['article_id'] ?? 0);
if ($articleId < 1) {
    json_out(['success' => false, 'message' => 'Invalid article.'], 422);
}

$article = $conn->prepare('SELECT id FROM news_articles WHERE id = ?');
$article->execute([$articleId]);
if (!$article->fetch()) {
    json_out(['success' => false, 'message' => 'Article not found.'], 404);
}

$check = $conn->prepare('SELECT id FROM bookmarks WHERE user_id = ? AND article_id = ?');
$check->execute([user_id(), $articleId]);

if ($check->fetch()) {
    $conn->prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?')
        ->execute([user_id(), $articleId]);
    $saved = false;
} else {
    $conn->prepare('INSERT INTO bookmarks (user_id, article_id) VALUES (?, ?)')
        ->execute([user_id(), $articleId]);
    $saved = true;
}

json_out(['success' => true, 'saved' => $saved]);
