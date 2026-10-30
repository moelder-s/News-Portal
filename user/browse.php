<?php require_once __DIR__.'/bootstrap.php'; require_login(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <script src="site-shared.js"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?= esc(csrf()) ?>">
    <title>Browse Articles - News In Green</title>
    <link rel="stylesheet" href="browse.css">
    <script src="browse.js" defer></script>
<link rel="stylesheet" href="site-shared.css">

</head>

<body>

    <!-- Apply saved theme immediately (prevents flash of wrong theme) -->
    

    <!-- HEADER -->
    <header class="site-header">
        <div class="header-inner">

            <a href="home.php" class="brand">
                <span class="brand-mark">N</span>
                <span class="brand-text">
                    News <em>In Green</em>
                </span>
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
                <button id="theme-toggle" class="theme-toggle"
                    type="button" aria-pressed="false">
                    <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                    </span>
                    <span class="toggle-label">Night</span>
                </button>

                <a href="logout.php" id="logout-link" class="btn-ghost">
                    Log out
                </a>
            </div>

            <button class="nav-burger" id="nav-burger"
                type="button" aria-label="Open menu"
                aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>

        </div>
    </header>

    <!-- BROWSE PAGE -->
    <main class="browse-page">
        <section class="browse-container">

            <div class="browse-heading">
                <div>
                    <h1>Browse articles</h1>
                    <p>
                        Filter by category, or search across every
                        approved article on the portal.
                    </p>
                </div>
            </div>

            <!-- CATEGORY BUTTONS -->
            <div class="category-filter">
                <button class="category-btn active"
                    data-category="All" type="button">All</button>

                <button class="category-btn"
                    data-category="Academic" type="button">Academic</button>

                <button class="category-btn"
                    data-category="Events" type="button">Events</button>

                <button class="category-btn"
                    data-category="Sports" type="button">Sports</button>

                <button class="category-btn"
                    data-category="General" type="button">General</button>
            </div>

            <!-- SEARCH AND DATE -->
            <form class="filter-area" id="browse-filters">
                <label class="browse-field search-box" for="search-input">
                    <span>Search articles</span>
                    <input type="search" id="search-input" placeholder="Search articles..." aria-label="Search articles">
                </label>
                <div class="date-filter">
                    <label class="browse-field" for="from-date"><span>From</span><input type="date" id="from-date"></label>
                    <label class="browse-field" for="to-date"><span>To</span><input type="date" id="to-date"></label>
                </div>
                <div class="filter-actions">
                    <button id="filter-btn" type="submit">Filter</button>
                    <button id="clear-btn" type="button">Clear</button>
                </div>
            </form>
            <p id="filter-status" class="browse-filter-status" role="alert" hidden></p>

            <!-- RESULTS -->
            <section class="results-section">
                <h2>Results</h2>
                <p id="results-count" class="browse-result-count" role="status" aria-live="polite"></p>

                <div id="articles-container"
                    class="articles-container" aria-busy="true">
                    <!-- Articles are added by browse.js -->
                </div>

                <div id="empty-message"
                    class="empty-message" hidden>
                    No articles found.
                </div>
            </section>

            <!-- PAGINATION -->
            <div class="pagination">
                <button id="previous-btn" type="button" disabled>
                    Previous
                </button>

                <span>
                    Page <strong id="page-number">1</strong>
                </span>

                <button id="next-btn" type="button" disabled>
                    Next
                </button>
            </div>

        </section>
    </main>

    <!-- FOOTER -->
    <footer class="site-footer">
        <div class="footer-inner">

            <div class="footer-brand">
                <div class="brand">
                    <span class="brand-mark">N</span>
                    <span class="brand-text">
                        News <em>In Green</em>
                    </span>
                </div>
                <p>
                    The student-run news portal covering academics,
                    events, sport, and campus life.
                </p>
            </div>

            <div class="footer-col">
                <h3>Sections</h3>
                <a href="browse.php?category=Academic">Academic</a>
                <a href="browse.php?category=Events">Events</a>
                <a href="browse.php?category=Sports">Sports</a>
                <a href="browse.php?category=General">General</a>
            </div>

            <div class="footer-col">
                <h3>Account</h3>
                <a href="login.html">Log in</a>
                <a href="register.html">Register</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="subscriptions.php">Subscription</a>
                <a href="submit.php">Submit an article</a>
            </div>

        </div>

        <div class="footer-bottom">
            &copy; 2026 News In Green
        </div>
    </footer>

</body>
</html>