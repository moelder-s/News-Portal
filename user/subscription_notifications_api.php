<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/subscription_notifications.php';
require_login();
ensure_subscription_notification_tables($conn);

$uid = user_id();
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$action = $method === 'POST' ? (string)($_POST['action'] ?? '') : (string)($_GET['action'] ?? 'poll');

if ($method === 'POST') {
    verify_csrf();

    if ($action === 'read') {
        $id = (int)($_POST['id'] ?? 0);
        $s = $conn->prepare("UPDATE notifications SET is_read = 1
            WHERE id = ? AND user_id = ? AND LOCATE('subscription_event=', link_url) > 0");
        $s->execute([$id, $uid]);
        json_out(['success' => true]);
    }

    if ($action === 'read_all') {
        $s = $conn->prepare("UPDATE notifications SET is_read = 1
            WHERE user_id = ? AND LOCATE('subscription_event=', link_url) > 0");
        $s->execute([$uid]);
        json_out(['success' => true]);
    }

    json_out(['success' => false, 'message' => 'Unknown action'], 422);
}

if ($method !== 'GET' || $action !== 'poll') {
    json_out(['success' => false, 'message' => 'Method not allowed'], 405);
}

// Seed missing states for subscriptions created before this notification feature existed.
$s = $conn->prepare('SELECT category FROM subscriptions WHERE user_id = ?');
$s->execute([$uid]);
$categories = $s->fetchAll(PDO::FETCH_COLUMN);

foreach ($categories as $categoryValue) {
    $category = (string)$categoryValue;
    seed_subscription_activity($conn, $uid, $category);

    $stateQuery = $conn->prepare('SELECT last_article_id, last_submission_id, last_comment_id
        FROM subscription_activity_state WHERE user_id = ? AND category = ?');
    $stateQuery->execute([$uid, $category]);
    $state = $stateQuery->fetch();
    if (!$state) {
        continue;
    }

    // 1) New articles published into the followed category.
    $articles = $conn->prepare('SELECT id, title, category FROM news_articles
        WHERE LOWER(category) = LOWER(?) AND id > ? ORDER BY id ASC');
    $articles->execute([$category, (int)$state['last_article_id']]);
    $newArticles = $articles->fetchAll();
    $lastArticleId = (int)$state['last_article_id'];

    foreach ($newArticles as $article) {
        $articleId = (int)$article['id'];
        $title = (string)$article['title'];
        $articleCategory = (string)$article['category'];

        // If this story already came through the submission feed, avoid a second alert.
        $submittedStory = $conn->prepare("SELECT s.id FROM article_submissions s
            INNER JOIN notifications n
                ON n.user_id = ?
               AND n.link_url = CONCAT('subscriptions.php?subscription_event=submission&id=', s.id, '#notifications')
            WHERE LOWER(s.category) = LOWER(?) AND s.title = ?
              AND s.status IN ('Pending', 'Approved') LIMIT 1");
        $submittedStory->execute([$uid, $articleCategory, $title]);
        if (!$submittedStory->fetchColumn()) {
            insert_subscription_notification(
                $conn,
                $uid,
                'New ' . $articleCategory . ' article',
                'A new story is available: “' . $title . '”.',
                'article.php?id=' . $articleId . '&subscription_event=article'
            );
        }
        $lastArticleId = max($lastArticleId, $articleId);
    }

    if ($lastArticleId > (int)$state['last_article_id']) {
        $conn->prepare('UPDATE subscription_activity_state SET last_article_id = ? WHERE user_id = ? AND category = ?')
            ->execute([$lastArticleId, $uid, $category]);
    }

    // 2) New article submissions in the followed category (pending submissions are described as under review).
    $submissions = $conn->prepare('SELECT s.id, s.title, s.category, s.author, s.status, so.user_id AS owner_user_id
        FROM article_submissions s
        LEFT JOIN submission_owners so ON so.submission_id = s.id
        WHERE LOWER(s.category) = LOWER(?) AND s.id > ? ORDER BY s.id ASC');
    $submissions->execute([$category, (int)$state['last_submission_id']]);
    $newSubmissions = $submissions->fetchAll();
    $lastSubmissionId = (int)$state['last_submission_id'];

    foreach ($newSubmissions as $submission) {
        $submissionId = (int)$submission['id'];
        $lastSubmissionId = max($lastSubmissionId, $submissionId);
        if (strtolower((string)$submission['status']) === 'rejected'
            || (isset($submission['owner_user_id']) && (int)$submission['owner_user_id'] === $uid)) {
            continue;
        }

        $author = trim((string)$submission['author']);
        $title = (string)$submission['title'];
        $submissionCategory = (string)$submission['category'];
        $statusText = strtolower((string)$submission['status']) === 'approved' ? 'has been approved' : 'was submitted for review';
        $byline = $author !== '' ? $author : 'A student';

        insert_subscription_notification(
            $conn,
            $uid,
            'New ' . $submissionCategory . ' article submission',
            $byline . ' ' . $statusText . ': “' . $title . '”.',
            'subscriptions.php?subscription_event=submission&id=' . $submissionId . '#notifications'
        );
    }

    if ($lastSubmissionId > (int)$state['last_submission_id']) {
        $conn->prepare('UPDATE subscription_activity_state SET last_submission_id = ? WHERE user_id = ? AND category = ?')
            ->execute([$lastSubmissionId, $uid, $category]);
    }

    // 3) Newly approved comments on followed-category stories. Do not advance the
    // baseline for pending comments, so approval at a later time is still noticed.
    $comments = $conn->prepare("SELECT ac.id AS comment_id, ac.article_id, ac.user_id AS commenter_id,
            ac.body, ac.created_at, u.full_name, a.title AS article_title, a.category
        FROM article_comments ac
        INNER JOIN news_articles a ON a.id = ac.article_id
        INNER JOIN users u ON u.id = ac.user_id
        WHERE LOWER(a.category) = LOWER(?)
          AND ac.id > ?
          AND ac.status = 'Approved'
          AND ac.user_id <> ?
        ORDER BY ac.id ASC");
    $comments->execute([$category, (int)$state['last_comment_id'], $uid]);

    foreach ($comments->fetchAll() as $comment) {
        $commentId = (int)$comment['comment_id'];
        $articleId = (int)$comment['article_id'];
        $commenter = trim((string)$comment['full_name']);
        $articleTitle = (string)$comment['article_title'];
        $snippet = trim(preg_replace('/\\s+/', ' ', (string)$comment['body']) ?? '');
        if (mb_strlen($snippet) > 110) {
            $snippet = mb_substr($snippet, 0, 107) . '…';
        }
        insert_subscription_notification(
            $conn,
            $uid,
            'New comment on a ' . (string)$comment['category'] . ' story',
            $commenter . ' commented on “' . $articleTitle . '”: ' . $snippet,
            'article.php?id=' . $articleId . '&subscription_event=comment&comment=' . $commentId . '#comments'
        );
    }
}

$unreadQuery = $conn->prepare("SELECT COUNT(*) FROM notifications
    WHERE user_id = ? AND is_read = 0 AND LOCATE('subscription_event=', link_url) > 0");
$unreadQuery->execute([$uid]);
$unread = (int)$unreadQuery->fetchColumn();

$listQuery = $conn->prepare("SELECT id, title, message, link_url, is_read, created_at
    FROM notifications
    WHERE user_id = ? AND LOCATE('subscription_event=', link_url) > 0
    ORDER BY id DESC LIMIT 15");
$listQuery->execute([$uid]);
$rows = $listQuery->fetchAll();

json_out(['success' => true, 'unread' => $unread, 'notifications' => $rows]);