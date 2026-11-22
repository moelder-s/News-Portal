<?php
require_once __DIR__ . '/bootstrap.php';


$id = (int)($_GET['id'] ?? 0);
$q = $conn->prepare('SELECT * FROM news_articles WHERE id = ?');
$q->execute([$id]);
$a = $q->fetch();

if (!$a) {
    http_response_code(404);
    exit('Article not found');
}

function article_category_fallback(string $category): string
{
    $images = [
        'academic' => 'Article.jpg',
        'events' => 'Events.jpg',
        'sports' => 'Sports.jpg',
        'general' => 'General.jpg',
    ];

    return $images[strtolower(trim($category))] ?? 'Article.jpg';
}

function article_image_source(?string $image, string $category): string
{
    $candidate = trim((string)$image);

    if ($candidate !== '') {
        // Remote image URLs are allowed only over HTTP or HTTPS.
        if (filter_var($candidate, FILTER_VALIDATE_URL)) {
            $scheme = strtolower((string)parse_url($candidate, PHP_URL_SCHEME));
            if (in_array($scheme, ['http', 'https'], true)) {
                return $candidate;
            }
        } else {
            // Use a local image only if the file actually exists in the project.
            $relative = ltrim($candidate, "/\\");
            if (!str_contains($relative, '..')) {
                $localPath = __DIR__ . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relative);
                if (is_file($localPath)) {
                    return $relative;
                }
            }
        }
    }

    // The supplied project has these category photos; use them when a DB path is missing.
    return article_category_fallback($category);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_login();
    verify_csrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'comment') {
        $body = trim((string)($_POST['body'] ?? ''));
        if (mb_strlen($body) >= 2 && mb_strlen($body) <= 2000) {
            $conn->prepare(
                "INSERT INTO article_comments (article_id, user_id, body, status) VALUES (?, ?, ?, 'Pending')"
            )->execute([$id, user_id(), $body]);
        }
        header('Location: article.php?id=' . $id . '#comments');
        exit;
    }

    if ($action === 'bookmark') {
        $savedCheck = $conn->prepare('SELECT id FROM bookmarks WHERE user_id = ? AND article_id = ?');
        $savedCheck->execute([user_id(), $id]);

        if ($savedCheck->fetch()) {
            $conn->prepare('DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?')
                ->execute([user_id(), $id]);
        } else {
            $conn->prepare('INSERT INTO bookmarks (user_id, article_id) VALUES (?, ?)')
                ->execute([user_id(), $id]);
        }

        header('Location: article.php?id=' . $id);
        exit;
    }
}

$saved = false;
if (logged()) {
    $s = $conn->prepare('SELECT 1 FROM bookmarks WHERE user_id = ? AND article_id = ?');
    $s->execute([user_id(), $id]);
    $saved = (bool)$s->fetchColumn();
}

$c = $conn->prepare(
    "SELECT ac.body, ac.created_at, u.full_name
     FROM article_comments ac
     JOIN users u ON u.id = ac.user_id
     WHERE ac.article_id = ? AND (ac.status = 'Approved' OR (ac.status = 'Pending' AND ac.user_id = ?))
     ORDER BY ac.created_at DESC"
);
$c->execute([$id, user_id()]);
$comments = $c->fetchAll();

$fallbackImage = article_category_fallback((string)$a['category']);
$imageSource = article_image_source($a['image'] ?? null, (string)$a['category']);
$articleContent = trim((string)($a['content'] ?? ''));
$authorName = 'NSBM News Desk';
try {
    $byline = $conn->prepare('SELECT author FROM article_submissions WHERE title=? AND category=? AND content=? ORDER BY id DESC LIMIT 1');
    $byline->execute([$a['title'], $a['category'], $a['content']]);
    $authorName = (string)($byline->fetchColumn() ?: 'NSBM News Desk');
} catch (Throwable $e) { error_log('Article author lookup: '.$e->getMessage()); }
$viewCount = 0;
try {
    $last = (int)($_SESSION['nig_viewed_articles'][$id] ?? 0);
    if (time() - $last > 600) {
        $saveView = $conn->prepare('INSERT INTO article_views(article_id,user_id) VALUES(?,?)');
        $saveView->execute([$id, logged() ? user_id() : null]);
        $_SESSION['nig_viewed_articles'][$id] = time();
    }
    $views = $conn->prepare('SELECT COUNT(*) FROM article_views WHERE article_id=?');
    $views->execute([$id]);
    $viewCount = (int)$views->fetchColumn();
} catch (Throwable $e) { error_log('Article view count: '.$e->getMessage()); }
?>
<!doctype html>
<html lang="en">
<head>
    <script src="site-shared.js?v=perf-final-1"></script>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= esc($a['title']) ?> | News In Green</title>
    <link rel="stylesheet" href="article.css">
<link rel="stylesheet" href="site-shared.css?v=one-row-mobile-20261107-4">

  <link rel="stylesheet" href="page-transition.css?v=noflash-native-20261107-4">
  <script src="page-transition.js?v=noflash-native-20261107-4" defer></script>
</head>
<body class="nig-day-desk-target nig-inner-desk-page">
    

    <header class="site-header">
        <div class="header-inner">
            <a href="home.php" class="brand">
                <span class="brand-mark">N</span>
                <span class="brand-text">News <em>In Green</em></span>
            </a>

            <nav class="main-nav" id="main-nav">
                <a href="home.php">Home</a>
                <a href="dashboard.php">Dashboard</a>
                <a href="browse.php" class="active">Browse</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="submit.php">Submit an article</a>
                <a href="subscriptions.php">Subscription</a>
                
            </nav>

            <div class="header-actions">
                <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false">
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    <span class="toggle-label">Night</span>
                </button>
                <a href="logout.php" id="logout-link" class="btn-ghost">Log out</a>
            </div>

            <button class="nav-burger" id="nav-burger" type="button" aria-label="Open menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>

    <main class="article-page nig-story-page">
        <article class="article-reader nig-story-reader">
            <div class="nig-story-hero">
                <div class="nig-story-hero-photo"><img class="nig-story-hero-image" src="<?= esc($imageSource) ?>" alt="<?= esc($a['title']) ?>" onerror="this.onerror=null;this.src='<?= esc($fallbackImage) ?>';" loading="eager" decoding="async"></div>
                <a class="back-link nig-story-back" href="browse.php">← Back to News Archive</a>
                <div class="nig-story-hero-caption">
                    <div class="nig-story-meta"><span><?= esc(date('Y-m-d', strtotime((string)$a['created_at']))) ?></span><span>·</span><span><?= $viewCount ?> views</span></div>
                    <span class="nig-story-category"><?= esc($a['category']) ?></span>
                    <h1><?= esc($a['title']) ?></h1>
                    <p class="nig-story-author">By <strong><?= esc($authorName) ?></strong> · NSBM News Desk contributor</p>
                </div>
            </div>
            <div class="nig-story-paper">
                <?php if (!empty($a['description'])): ?>
                    <p class="nig-story-lead"><?= nl2br(esc($a['description'])) ?></p>
                <?php endif; ?>
                <div class="article-content">
                    <?= nl2br(esc($articleContent !== '' ? $articleContent : (string)$a['description'])) ?>
                </div>
            </div>
            <div class="article-toolbar">
                <form method="post" class="bookmark-form">
                    <input type="hidden" name="csrf" value="<?= esc(csrf()) ?>">
                    <input type="hidden" name="action" value="bookmark">
                    <button type="submit" class="article-button">
                        <?= $saved ? '✓ Saved — remove bookmark' : '☆ Save bookmark' ?>
                    </button>
                </form>
            </div>

            <section class="comments-section" id="comments">
                <h2>Comments</h2>
                <p class="comments-note">Comments appear publicly after moderation. You can see your own pending comments.</p>

                <form method="post" class="comment-form">
                    <input type="hidden" name="csrf" value="<?= esc(csrf()) ?>">
                    <input type="hidden" name="action" value="comment">
                    <label class="visually-hidden" for="comment-body">Write a comment</label>
                    <textarea id="comment-body" name="body" maxlength="2000" required placeholder="Write a respectful comment"></textarea>
                    <button type="submit" class="article-button">Submit comment</button>
                </form>

                <div class="comments-list">
                    <?php if (!$comments): ?>
                        <p class="no-comments">No approved comments yet. Be the first to share a respectful comment.</p>
                    <?php else: ?>
                        <?php foreach ($comments as $comment): ?>
                            <div class="comment">
                                <div class="comment-heading">
                                    <strong><?= esc($comment['full_name']) ?></strong>
                                    <small><?= esc($comment['created_at']) ?></small>
                                </div>
                                <p><?= nl2br(esc($comment['body'])) ?></p>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </section>
        </article>
    </main>

    <script>
        (() => {
            const nav = document.getElementById('main-nav');
            const burger = document.getElementById('nav-burger');

            burger?.addEventListener('click', () => {
                const isOpen = nav?.classList.toggle('open') ?? false;
                burger.setAttribute('aria-expanded', String(isOpen));
            });
        })();
    </script>
</body>
</html>
