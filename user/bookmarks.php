<?php
require_once __DIR__ . '/bootstrap.php';
require_login();

$sql = "SELECT a.*, b.created_at AS bookmarked_at
        FROM bookmarks b
        JOIN news_articles a ON a.id = b.article_id
        WHERE b.user_id = ?
        ORDER BY b.created_at DESC, a.created_at DESC, a.id DESC";
$q = $conn->prepare($sql);
$q->execute([user_id()]);
$savedArticles = $q->fetchAll();

function bookmark_fallback_image(string $category): string
{
    $images = [
        'academic' => 'Article.jpg',
        'events' => 'Events.jpg',
        'sports' => 'Sports.jpg',
        'general' => 'General.jpg',
    ];
    return $images[strtolower(trim($category))] ?? 'Article.jpg';
}

function bookmark_image_source(?string $image, string $category): string
{
    $candidate = trim((string)$image);
    if ($candidate !== '') {
        if (filter_var($candidate, FILTER_VALIDATE_URL)) {
            $scheme = strtolower((string)parse_url($candidate, PHP_URL_SCHEME));
            if (in_array($scheme, ['http', 'https'], true)) return $candidate;
        } else {
            $relative = ltrim($candidate, "/\\");
            if (!str_contains($relative, '..')) {
                $path = __DIR__ . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relative);
                if (is_file($path)) return $relative;
            }
        }
    }
    return bookmark_fallback_image($category);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bookmarks — News In Green</title>
    <link rel="stylesheet" href="bookmarks.css">
    <script src="bookmarks.js" defer></script>
</head>
<body class="dark-mode">
    <header class="site-header">
        <div class="header-inner">
            <a href="home.php" class="brand">
                <span class="brand-mark">N</span>
                <span class="brand-text">News <em>In Green</em></span>
            </a>
            <nav class="main-nav" id="main-nav" aria-label="Primary">
                <a href="home.php">Home</a>
                <a href="dashboard.php">Dashboard</a>
                <a href="browse.php">Browse</a>
                <a href="bookmarks.php" class="active" aria-current="page">Bookmarks</a>
                <a href="submit.php">Submit an article</a>
                <a href="subscriptions.php">Subscription</a>
                <a href="help.php">Help &amp; Support</a>
            </nav>
            <div class="header-actions">
                <button id="theme-toggle" class="theme-toggle" type="button" aria-pressed="false" onclick="toggleTheme()" aria-label="Toggle light and dark theme">
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    <span class="toggle-label">Night</span>
                </button>
                <a href="logout.php" class="btn-ghost">Log out</a>
            </div>
            <button class="nav-burger" id="nav-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>

    <main>
        <section class="title-section">
            <h2>Your bookmarks</h2>
            <p>Articles you've saved to read later. Only visible to you when signed in.</p>
        </section>

        <?php if (!$savedArticles): ?>
            <section class="empty-box">
                <h3>No bookmarks yet</h3>
                <p>Save an article from the Browse page or full article page and it will appear here.</p>
                <a href="browse.php" class="btn-browse">Browse articles</a>
            </section>
        <?php else: ?>
            <section class="bookmark-list" id="bookmark-list" aria-label="Saved articles">
                <?php foreach ($savedArticles as $item):
                    $image = bookmark_image_source($item['image'] ?? null, (string)$item['category']);
                    $fallback = bookmark_fallback_image((string)$item['category']);
                ?>
                    <article class="bookmark-card">
                        <img class="bookmark-card-image" src="<?= esc($image) ?>" alt="<?= esc($item['title']) ?>" loading="lazy" onerror="this.onerror=null;this.src='<?= esc($fallback) ?>';">
                        <div class="bookmark-card-content">
                            <span class="article-category"><?= esc($item['category']) ?></span>
                            <h4><a href="article.php?id=<?= (int)$item['id'] ?>"><?= esc($item['title']) ?></a></h4>
                            <p class="bookmark-description"><?= esc($item['description']) ?></p>
                            <p class="bookmark-meta">Published: <?= esc($item['created_at']) ?></p>
                        </div>
                        <div class="bookmark-card-actions">
                            <a class="bookmark-read-button" href="article.php?id=<?= (int)$item['id'] ?>">Read article →</a>
                            <form method="post" action="bookmarks_action.php" onsubmit="return confirm('Remove this article from your bookmarks?');">
                                <input type="hidden" name="csrf" value="<?= esc(csrf()) ?>">
                                <input type="hidden" name="article_id" value="<?= (int)$item['id'] ?>">
                                <button type="submit" class="bookmark-remove-button">Remove bookmark</button>
                            </form>
                        </div>
                    </article>
                <?php endforeach; ?>
            </section>
        <?php endif; ?>
    </main>

    <footer class="site-footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <a href="home.php" class="brand"><span class="brand-mark">N</span><span class="brand-text">News <em>In Green</em></span></a>
                <p>The student-run news portal covering academics, events, sport, and campus life.</p>
            </div>
            <div class="footer-col">
                <h3>Sections</h3>
                <a href="browse.php#academic">Academic</a><a href="browse.php#events">Events</a><a href="browse.php#sports">Sports</a><a href="browse.php#general">General</a>
            </div>
            <div class="footer-col">
                <h3>Account</h3>
                <a href="logout.php">Log out</a><a href="bookmarks.php">Bookmarks</a><a href="subscriptions.php">Subscription</a><a href="submit.php">Submit an article</a>
            </div>
            <div class="footer-col">
                <h3>Contact</h3>
                <a href="mailto:newsroom@newsingreen.edu">newsroom@newsingreen.edu</a><span>123 University Avenue, Colombo</span>
            </div>
        </div>
        <div class="footer-bottom">&copy; 2026 News In Green</div>
    </footer>
    <script>
      document.getElementById('nav-burger')?.addEventListener('click', function () {
        const open = document.getElementById('main-nav')?.classList.toggle('open') || false;
        this.setAttribute('aria-expanded', String(open));
      });
    </script>
</body>
</html>
