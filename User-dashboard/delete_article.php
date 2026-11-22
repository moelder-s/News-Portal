<?php
// Delete only the logged-in owner's own exact, unambiguous article.
require_once __DIR__ . '/bootstrap.php';
require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit('POST required'); }
verify_csrf();
$submissionId = filter_input(INPUT_POST, 'submission_id', FILTER_VALIDATE_INT);
if (!$submissionId) { http_response_code(400); exit('Invalid submission'); }
try {
    $conn->beginTransaction();
    $q = $conn->prepare('SELECT s.* FROM article_submissions s JOIN submission_owners o ON o.submission_id=s.id WHERE s.id=? AND o.user_id=? FOR UPDATE');
    $q->execute([$submissionId, user_id()]);
    $submission = $q->fetch();
    if (!$submission) { $conn->rollBack(); http_response_code(403); exit('Not your article'); }
    $find = $conn->prepare("SELECT id,image FROM news_articles WHERE title=? AND category=? AND content=? AND COALESCE(image,'')=COALESCE(?, '') FOR UPDATE");
    $find->execute([$submission['title'], $submission['category'], $submission['content'], $submission['image_url']]);
    $matches=$find->fetchAll();
    if (count($matches) !== 1) { $conn->rollBack(); http_response_code(409); exit('Cannot identify one unique article for this submission. Ask an admin to review it.'); }
    $articleId=(int)$matches[0]['id'];
    // If the existing Admin deleted-history tables are already present,
    // archive the article and its comments WITHOUT creating/modifying any table.
    $available = $conn->query("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('deleted_articles','deleted_article_comments')")->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('deleted_articles', $available, true) && in_array('deleted_article_comments', $available, true)) {
        $original = $conn->prepare('SELECT * FROM news_articles WHERE id=?');
        $original->execute([$articleId]); $a = $original->fetch();
        $conn->prepare('INSERT INTO deleted_articles(original_article_id,title,category,description,image,content,published_at,deleted_by) VALUES(?,?,?,?,?,?,?,NULL)')->execute([$articleId,$a['title'],$a['category'],$a['description'] ?? null,$a['image'] ?? null,$a['content'] ?? null,$a['created_at'] ?? null]);
        $conn->prepare('INSERT INTO deleted_article_comments(original_comment_id,original_article_id,user_id,article_title,body,status,commented_at,deleted_by) SELECT id,article_id,user_id,?,body,status,created_at,NULL FROM article_comments WHERE article_id=?')->execute([$a['title'],$articleId]);
    }
    // Existing foreign keys cascade comment/bookmark/view cleanup.
    $conn->prepare('DELETE FROM news_articles WHERE id=?')->execute([$articleId]);
    $conn->prepare('DELETE FROM article_submissions WHERE id=?')->execute([$submissionId]);
    $conn->commit();
    // Do not delete uploaded files: an admin archive or other content may still reference them.
    header('Location: dashboard.php?article_deleted=1',true,303); exit;
} catch (Throwable $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    error_log('Owner article delete: '.$e->getMessage());
    http_response_code(500); exit('Could not delete this article right now.');
}
