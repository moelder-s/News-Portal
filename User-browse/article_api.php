<?php
require_once __DIR__ . '/bootstrap.php';
require_login();

$sql = "SELECT a.id, a.title, a.category, a.description, a.image, a.content, a.created_at,
               CASE WHEN b.id IS NULL THEN 0 ELSE 1 END AS is_bookmarked
        FROM news_articles a
        LEFT JOIN bookmarks b ON b.article_id = a.id AND b.user_id = ?
        ORDER BY a.created_at DESC, a.id DESC";
$q = $conn->prepare($sql);
$q->execute([user_id()]);
json_out(['success' => true, 'articles' => $q->fetchAll()]);
