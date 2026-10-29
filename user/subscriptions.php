<?php require_once __DIR__.'/bootstrap.php'; require_login(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscriptions — News In Green</title>
    <meta name="description" content="Manage your category subscriptions on News In Green, the student-run news portal.">
    <link rel="stylesheet" href="subscriptions.css">
    <script src="subscriptions.js" defer></script>
</head>

<body class="light-mode">

    <!-- HEADER -->
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
                <a href="bookmarks.php">Bookmarks</a>
                <a href="submit.php">Submit an article</a>
                <a href="subscriptions.php" class="active" aria-current="page"><span>Subscriptions</span><span id="sub-notification-badge" class="notification-badge" hidden>0</span></a>
                <a href="help.php">Help/Contact</a>
            </nav>

            <div class="header-actions">
                <button id="theme-toggle" class="theme-toggle" type="button"
                    aria-label="Switch to dark mode" aria-pressed="true">
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    <span class="toggle-label">Day</span>
                </button>

                <a href="login.html" class="btn-ghost">Log out</a>
            </div>

            <button class="nav-burger" id="nav-burger" type="button"
                aria-label="Open menu" aria-expanded="false">
                <span></span><span></span><span></span>
            </button>

        </div>
    </header>

    <!-- SUBSCRIPTIONS PAGE -->
    <main class="subs-page">
        <input type="hidden" id="csrf-token" value="<?= esc(csrf()) ?>">
        <section class="subs-panel">

            <div class="subs-greeting">
                <div>
                    <h1>Subscriptions</h1>
                    <p>Choose the categories you want to hear about. Subscribed categories are highlighted first on your homepage.</p>
                </div>
                <a href="dashboard.php" class="btn-ghost">Back to dashboard</a>
            </div>

            <div class="sub-summary">
                <span id="sub-count">0 of 4 categories subscribed</span>
                <div class="sub-summary-buttons">
                    <button type="button" id="subscribe-all" class="btn-ghost">Subscribe to all</button>
                    <button type="button" id="clear-all" class="btn-ghost">Clear all</button>
                </div>
            </div>

            <div class="sub-grid">

                <label class="sub-card">
                    <div class="sub-info">
                        <h4>Academic</h4>
                        <p>Faculty news, research, courses, and exams.</p>
                    </div>
                    <input type="checkbox" class="sub-check" value="academic">
                    <span class="switch" aria-hidden="true"></span>
                </label>

                <label class="sub-card">
                    <div class="sub-info">
                        <h4>Events</h4>
                        <p>Campus events, fairs, and cultural nights.</p>
                    </div>
                    <input type="checkbox" class="sub-check" value="events">
                    <span class="switch" aria-hidden="true"></span>
                </label>

                <label class="sub-card">
                    <div class="sub-info">
                        <h4>Sports</h4>
                        <p>Match results, team news, and tournaments.</p>
                    </div>
                    <input type="checkbox" class="sub-check" value="sports">
                    <span class="switch" aria-hidden="true"></span>
                </label>

                <label class="sub-card">
                    <div class="sub-info">
                        <h4>General</h4>
                        <p>Campus-wide announcements and updates.</p>
                    </div>
                    <input type="checkbox" class="sub-check" value="general">
                    <span class="switch" aria-hidden="true"></span>
                </label>

            </div>

            <p id="sub-message" class="sub-message" role="status" aria-live="polite"></p>

            <section class="sub-notifications" id="notifications" aria-labelledby="notifications-title">
                <div class="notification-heading">
                    <div>
                        <h2 id="notifications-title">Your notifications <span id="notification-unread-count" class="unread-count" hidden>0 unread</span></h2>
                        <p>Updates from the categories you follow. New activity is checked automatically while this page is open.</p>
                    </div>
                    <button type="button" id="mark-all-read" class="btn-ghost">Mark all as read</button>
                </div>
                <div id="notification-list" class="notification-list" aria-live="polite" aria-busy="true">
                    <p class="notifications-empty">Loading your notifications…</p>
                </div>
            </section>

        </section>
        <div id="notification-toast" class="notification-toast" role="status" aria-live="polite" hidden></div>
    </main>

    <!-- FOOTER -->
    <footer class="site-footer">
        <div class="footer-inner">

            <div class="footer-brand">
                <div class="brand">
                    <span class="brand-mark">N</span>
                    <span class="brand-text">News <em>In Green</em></span>
                </div>
                <p>The student-run news portal covering academics, events, sport, and campus life.</p>
            </div>

            <div class="footer-col">
                <h3>Sections</h3>
                <a href="browse.php#academic">Academic</a>
                <a href="browse.php#events">Events</a>
                <a href="browse.php#sports">Sports</a>
                <a href="browse.php#general">General</a>
            </div>

            <div class="footer-col">
                <h3>Account</h3>
                <a href="login.html">Log out</a>
                <a href="register.html">Register</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="subscriptions.php">Subscriptions</a>
                <a href="submit.php">Submit an article</a>
                <a href="help.php">Help/Contact</a>
            </div>

            <div class="footer-col">
                <h3>Contact</h3>
                <a href="mailto:newsroom@newsingreen.edu">newsroom@newsingreen.edu</a>
                <span>123 University Avenue, Colombo</span>
            </div>

        </div>

        <div class="footer-bottom">
            &copy; 2026 News In Green
        </div>
    </footer>

</body>
</html>
