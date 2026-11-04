
<?php
require_once __DIR__ . '/bootstrap.php';

// Get the latest four news articles
$latestNews = [];

try {
    $stmt = $conn->query(
        'SELECT id, title, category, description, image, created_at
         FROM news_articles
         ORDER BY created_at DESC, id DESC
         LIMIT 4'
    );

    $latestNews = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (Throwable $e) {
    error_log('News In Green home feed: ' . $e->getMessage());
}

// Check login session
$isLoggedIn = isset($_SESSION['user_id'])
    && !isset($_GET['preview_guest']);

$userName = $isLoggedIn
    ? ($_SESSION['user_name'] ?? 'User')
    : 'Guest';

// Protect against HTML injection
$safeName = htmlspecialchars(
    $userName,
    ENT_QUOTES | ENT_SUBSTITUTE,
    'UTF-8'
);

// Escape output safely
if (!function_exists('esc')) {
    function esc($value): string {
        return htmlspecialchars(
            (string)$value,
            ENT_QUOTES | ENT_SUBSTITUTE,
            'UTF-8'
        );
    }
}

$loginPage = 'login.html';
$registerPage = 'register.html';

$fallbacks = [
    'Sports'   => 'Sports.jpg',
    'Academic' => 'Academic.jpg',
    'Events'   => 'Events.jpg',
    'General'  => 'General.jpg'
];
?>

<!DOCTYPE html>
<html lang="en" data-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>News In Green</title>

    <script src="site-shared.js"></script>

    <link rel="stylesheet" href="home.css">
    <link rel="stylesheet" href="site-shared.css">
</head>

<body>

    <!-- HEADER -->
    <header class="topbar">
        <div class="topbar-inner">

            <a class="brand"
               href="home.php"
               aria-label="News In Green home">

                <span class="brand-mark">N</span>
                <span class="brand-divider"></span>

                <span class="brand-text">
                    <span class="brand-eyebrow">
                        News In Green
                    </span>

                    <span class="brand-title">
                        Campus News.
                    </span>
                </span>

            </a>

            <div class="topbar-right">

                <span class="greeting" id="greeting-text">
                    <?php if ($isLoggedIn): ?>
                        Hello, <?= $safeName ?>
                    <?php else: ?>
                        Hello, Guest
                    <?php endif; ?>
                </span>

                <button
                    id="theme-toggle"
                    class="theme-btn"
                    type="button"
                    aria-label="Toggle theme"
                    aria-pressed="true">

                    <svg class="icon-moon"
                         viewBox="0 0 24 24"
                         aria-hidden="true">
                        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
                    </svg>

                    <svg class="icon-sun"
                         viewBox="0 0 24 24"
                         aria-hidden="true">
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
                    </svg>

                </button>

            </div>
        </div>
    </header>

    <!-- HERO -->
    <section class="portal-hero">
        <div>
            <small>WELCOME TO</small>
            <h1>News In Green</h1>
            <p>
                Stories that shape a greener,
                brighter NSBM.
            </p>
        </div>

        <div class="portal-greeting">
            Good Morning
        </div>
    </section>

    <!-- LATEST NEWS -->
    <section
        class="portal-feed"
        id="latest-news"
        aria-labelledby="latest-news-title">

        <h2 id="latest-news-title">
            Latest campus news
        </h2>

        <p>
            Read all published stories without
            creating an account.
        </p>

        <div class="portal-news-grid">

            <?php foreach ($latestNews as $story): ?>

                <?php
                $category = (string)($story['category'] ?? 'General');

                $categoryImage = $fallbacks[$category]
                    ?? 'campus-background.jpg';

                $candidate = trim(
                    (string)($story['image'] ?? '')
                );

                $validImage = (
                    $candidate !== ''
                    && !str_contains($candidate, '..')
                    && preg_match(
                        '~^[a-zA-Z0-9_\-/]+\.(jpg|jpeg|png|webp|gif)$~i',
                        $candidate
                    )
                );

                $imageSrc = $validImage
                    ? $candidate
                    : $categoryImage;
                ?>

                <article
                    class="portal-news-card"
                    data-category="<?= esc($category) ?>">

                    <img
                        class="portal-news-photo"
                        loading="lazy"
                        src="<?= esc($imageSrc) ?>"
                        data-fallback="<?= esc($categoryImage) ?>"
                        alt="<?= esc($story['title']) ?>"
                        onerror="if(this.dataset.retry!=='yes'){this.dataset.retry='yes';this.src=this.dataset.fallback}else{this.hidden=true}">

                    <small>
                        <?= esc($category) ?>
                        ·
                        <?= esc($story['created_at']) ?>
                    </small>

                    <h3>
                        <?= esc($story['title']) ?>
                    </h3>

                    <p>
                        <?= esc($story['description']) ?>
                    </p>

                    <a
                        class="portal-news-open"
                        href="article.php?id=<?= (int)$story['id'] ?>"
                        aria-label="<?= esc('Read full article: ' . $story['title']) ?>">

                        <span class="portal-sr-only">
                            Read full article
                        </span>

                        <span class="portal-card-arrow"
                              aria-hidden="true">

                            <svg viewBox="0 0 24 24">
                                <path d="M5 12h14M13 6l6 6-6 6"/>
                            </svg>

                        </span>

                    </a>

                </article>

            <?php endforeach; ?>

            <?php if (empty($latestNews)): ?>

                <p>
                    There are no published news articles yet.
                    New stories will appear here.
                </p>

            <?php endif; ?>

        </div>
    </section>

    <!-- PAGE TITLE -->
    <section class="container page-head">

        <span class="page-head-icon"
              aria-hidden="true">

            <svg viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="2"/>
                <rect x="14" y="3" width="7" height="7" rx="2"/>
                <rect x="3" y="14" width="7" height="7" rx="2"/>
                <rect x="14" y="14" width="7" height="7" rx="2"/>
            </svg>

        </span>

        <h1 id="page-title">
            News Portal
        </h1>

    </section>

    <!-- BROWSE FILTERS -->
    <nav class="browse-bar" aria-label="Browse">

        <div class="container browse-row">

            <span class="browse-label">
                Browse:
            </span>

            <div class="pills"
                 role="group"
                 aria-label="Filter sections">

                <button
                    class="pill is-active"
                    type="button"
                    aria-pressed="true"
                    data-filter="all"
                    data-title="Campus Portal">
                    All
                </button>

                <button
                    class="pill"
                    type="button"
                    aria-pressed="false"
                    data-filter="news"
                    data-title="Campus News">
                    Campus News
                </button>

                <button
                    class="pill"
                    type="button"
                    aria-pressed="false"
                    data-filter="services"
                    data-title="Student Services">
                    Student Services
                </button>

            </div>
        </div>
    </nav>

    <!-- MAIN CONTENT -->
    <main class="container">

        <section
            class="tiles"
            id="tiles"
            aria-label="Portal sections">

            <!-- ACADEMIC -->
            <a
                class="tile"
                href="browse.php?category=Academic"
                data-group="news"
                style="--img:url('Academic.jpg')">

                <span class="tile-badge"
                      style="color:#648ee2">

                    <svg viewBox="0 0 24 24"
                         aria-hidden="true">
                        <path d="M2 9l10-5 10 5-10 5L2 9z"/>
                        <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5"/>
                        <path d="M22 9v6"/>
                    </svg>

                </span>

                <span class="tile-arrow"
                      aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </span>

                <span class="tile-title">
                    Academic
                </span>

            </a>

            <!-- EVENTS -->
            <a
                class="tile"
                href="browse.php?category=Events"
                data-group="news"
                style="--img:url('Events.jpg')">

                <span class="tile-badge"
                      style="color:#ea580c">

                    <svg viewBox="0 0 24 24"
                         aria-hidden="true">
                        <rect x="3" y="5" width="18" height="16" rx="3"/>
                        <path d="M8 3v4M16 3v4M3 10h18"/>
                    </svg>

                </span>

                <span class="tile-arrow"
                      aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </span>

                <span class="tile-title">
                    Events
                </span>

            </a>

            <!-- SPORTS -->
            <a
                class="tile"
                href="browse.php?category=Sports"
                data-group="news"
                style="--img:url('Sports.jpg')">

                <span class="tile-badge"
                      style="color:#16a34a">

                    <svg viewBox="0 0 24 24"
                         aria-hidden="true">
                        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/>
                        <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>
                    </svg>

                </span>

                <span class="tile-arrow"
                      aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </span>

                <span class="tile-title">
                    Sports
                </span>

            </a>

            <!-- GENERAL -->
            <a
                class="tile"
                href="browse.php?category=General"
                data-group="news"
                style="--img:url('General.jpg')">

                <span class="tile-badge"
                      style="color:#7c3aed">

                    <svg viewBox="0 0 24 24"
                         aria-hidden="true">
                        <path d="M4 10v4h3l8 4V6L7 10H4z"/>
                        <path d="M18.5 9.5a4 4 0 0 1 0 5"/>
                    </svg>

                </span>

                <span class="tile-arrow"
                      aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </span>

                <span class="tile-title">
                    General
                </span>

            </a>

            <!-- SUBMIT ARTICLE -->
            <a
                class="tile"
                href="<?= $isLoggedIn ? 'submit.php' : esc($loginPage) ?>"
                data-group="services"
                style="--img:url('Article.jpg')">

                <span class="tile-badge"
                      style="color:#0d9488">

                    <svg viewBox="0 0 24 24"
                         aria-hidden="true">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>

                </span>

                <span class="tile-arrow"
                      aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </span>

                <span class="tile-title">
                    Submit an Article
                </span>

            </a>

            <!-- LOGIN / DASHBOARD -->
            <a
                class="tile"
                href="<?= $isLoggedIn ? 'dashboard.php' : esc($loginPage) ?>"
                data-group="services"
                style="--img:url('Login.webp')">

                <span class="tile-badge"
                      style="color:#0284c7">

                    <svg viewBox="0 0 24 24"
                         aria-hidden="true">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>

                </span>

                <span class="tile-arrow"
                      aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M13 6l6 6-6 6"/>
                    </svg>
                </span>

                <span class="tile-title">
                    <?= $isLoggedIn ? 'My Dashboard' : 'Student Login' ?>
                </span>

            </a>

        </section>

    </main>

    <!-- FOOTER -->
    <footer class="footer">

        <div class="container footer-inner">

            <span>
                &copy; 2026 News In Green
            </span>

            <nav class="footer-links" aria-label="More">

                <?php if ($isLoggedIn): ?>
                    <a href="logout.php">
                        Log out
                    </a>
                <?php else: ?>
                    <a href="<?= esc($loginPage) ?>">
                        Log in
                    </a>
                <?php endif; ?>

                <a href="<?= $isLoggedIn ? 'browse.php' : esc($loginPage) ?>">
                    Browse
                </a>

                <a href="<?= $isLoggedIn ? 'bookmarks.php' : esc($loginPage) ?>">
                    Bookmarks
                </a>

                <a href="<?= $isLoggedIn ? 'subscriptions.php' : esc($loginPage) ?>">
                    Subscriptions
                </a>

                <a href="<?= $isLoggedIn ? 'dashboard.php' : esc($loginPage) ?>">
                    Dashboard
                </a>

                <?php if (!$isLoggedIn): ?>
                    <a href="<?= esc($registerPage) ?>">
                        Register
                    </a>
                <?php endif; ?>

            </nav>

        </div>

    </footer>

    <!-- JAVASCRIPT -->
    <script src="home.js"></script>

</body>
</html>
