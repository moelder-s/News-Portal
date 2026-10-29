<?php require_once __DIR__.'/bootstrap.php'; require_login(); ?>

<!DOCTYPE html>
<html lang="en" data-theme="light">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Dashboard — News In Green</title>

    <link rel="stylesheet" href="dashboard.css">
    <script src="dashboard.js" defer></script>
</head>

<body>

    <!-- ================= HEADER ================= -->

    <header class="site-header">
        <div class="header-inner">

            <!-- LOGO -->
            <a href="home.php" class="brand">
                <span class="brand-mark">N</span>
                <span class="brand-text">
                    News <em>In Green</em>
                </span>
            </a>

            <!-- NAVIGATION -->
            <nav class="main-nav"
                 id="main-nav"
                 aria-label="Primary navigation">

                <a href="home.php">Home</a>

                <a href="dashboard.php" class="active"
                   aria-current="page">Dashboard</a>

                <a href="browse.php">Browse</a>

                <a href="bookmarks.php">Bookmarks</a>

                <a href="submit.php">Submit an article</a>

                <a href="subscriptions.php">Subscriptions</a>

                <a href="help.php">Help & Support</a>

            </nav>

            <!-- HEADER ACTIONS -->
            <div class="header-actions">

                <!-- DAY / NIGHT SWITCH -->
                <button
                    id="theme-toggle"
                    class="theme-toggle"
                    type="button"
                    aria-label="Switch to night mode"
                    aria-pressed="false">

                    <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                    </span>

                    <span class="toggle-label">Day</span>
                </button>

                <!-- LOG OUT -->
                <a href="logout.php" class="btn-ghost">
                    Log out
                </a>

            </div>

            <!-- MOBILE MENU -->
            <button
                id="nav-burger"
                class="nav-burger"
                type="button"
                aria-label="Open menu"
                aria-controls="main-nav"
                aria-expanded="false">

                <span></span>
                <span></span>
                <span></span>
            </button>

        </div>
    </header>


    <!-- ================= DASHBOARD MAIN ================= -->

    <main class="container">

        <div class="dashboard-main">

            <!-- WELCOME SECTION -->
            <div class="dashboard-greeting">

                <div class="greeting-text">

                    <h1>Welcome back</h1>

                    <p>
                        Here's everything your account can do
                        on News In Green.
                    </p>

                </div>

                <a href="edit-profile.html"
                   class="btn-ghost">
                    Edit profile
                </a>

            </div>


            <!-- ================= STATISTICS ================= -->

            <section class="dashboard-stats"
                     aria-label="Account statistics">

                <div class="stats-row">

                    <div class="stat-card">
                        <h3>Bookmarked articles</h3>
                        <p class="stat-number" id="bookmarks-count"><?php $s=$conn->prepare('SELECT COUNT(*) FROM bookmarks WHERE user_id=?');$s->execute([user_id()]);echo (int)$s->fetchColumn(); ?></p>
                    </div>

                    <div class="stat-card">
                        <h3>Subscribed categories</h3>
                        <p class="stat-number" id="subscriptions-count"><?php $s=$conn->prepare('SELECT COUNT(*) FROM subscriptions WHERE user_id=?');$s->execute([user_id()]);echo (int)$s->fetchColumn(); ?></p>
                    </div>

                    <div class="stat-card">
                        <h3>Articles submitted</h3>
                        <p class="stat-number" id="submissions-count"><?php $s=$conn->prepare('SELECT COUNT(*) FROM submission_owners WHERE user_id=?');$s->execute([user_id()]);echo (int)$s->fetchColumn(); ?></p>
                    </div>

                    <div class="stat-card">
                        <h3>Comments posted</h3>
                        <p class="stat-number" id="comments-count"><?php $s=$conn->prepare('SELECT COUNT(*) FROM article_comments WHERE user_id=?');$s->execute([user_id()]);echo (int)$s->fetchColumn(); ?></p>
                    </div>

                </div>

            </section>


            <!-- ================= SUBMISSIONS ================= -->

            <section class="dashboard-submissions">

                <h2>My submissions</h2>

                <div class="submissions-grid"
                     id="submissions-list"><?php $s=$conn->prepare('SELECT s.title,s.status,s.submitted_at FROM article_submissions s JOIN submission_owners o ON s.id=o.submission_id WHERE o.user_id=? ORDER BY s.submitted_at DESC LIMIT 10');$s->execute([user_id()]);foreach($s->fetchAll() as $item):?><div class="submission-card"><strong><?=esc($item['title'])?></strong><p class="status"><?=esc($item['status'])?></p><small><?=esc($item['submitted_at'])?></small></div><?php endforeach;?>

                    <!-- Example submission -->
                    <div class="submission-card">

                        <div>
                            <h4>The Future of AI in Campus Learning</h4>
                            <p class="status">Pending Review</p>
                        </div>

                        <span class="date">
                            Oct 19, 2026
                        </span>

                    </div>

                </div>

            </section>


            <!-- ================= COMMENTS ================= -->

            <section class="dashboard-comments">

                <h2>My comments</h2>

                <div class="comments-grid"
                     id="comments-list"><?php $s=$conn->prepare("SELECT body,created_at FROM article_comments WHERE user_id=? ORDER BY created_at DESC LIMIT 10");$s->execute([user_id()]);foreach($s->fetchAll() as $cm):?><div class="comment-card"><p><?=esc($cm["body"])?></p><small><?=esc($cm["created_at"])?></small></div><?php endforeach;?>

                    <div class="comment-card">

                        <div>
                            <h4>Campus Cultural Festival</h4>

                            <p class="comment-text">
                                "This was a great event for students!"
                            </p>
                        </div>

                        <span class="date">
                            Oct 18, 2026
                        </span>

                    </div>

                </div>

            </section>


            <!-- ================= QUICK ACTIONS ================= -->

            <section class="dashboard-actions-section">

                <h2>Quick actions</h2>

                <div class="actions-grid">

                    <a href="submit.php" class="action-tile">
                        Submit an article
                    </a>

                    <a href="bookmarks.php" class="action-tile">
                        View bookmarks
                    </a>

                    <a href="subscriptions.php" class="action-tile">
                        Manage subscriptions
                    </a>

                </div>

            </section>

        </div>

    </main>


    <!-- ================= FOOTER ================= -->

    <footer class="site-footer">

        <div class="footer-inner">

            <!-- FOOTER BRAND -->
            <div class="footer-brand">

                <a href="home.php" class="brand">
                    <span class="brand-mark">N</span>

                    <span class="brand-text">
                        News <em>In Green</em>
                    </span>
                </a>

                <p>
                    The student-run news portal covering
                    academics, events, sport, and campus life.
                </p>

            </div>


            <!-- SECTIONS -->
            <div class="footer-col">

                <h3>Sections</h3>

                <a href="browse.php">Academic</a>
                <a href="browse.php">Events</a>
                <a href="browse.php">Sports</a>
                <a href="browse.php">General</a>

            </div>


            <!-- ACCOUNT -->
            <div class="footer-col">

                <h3>Account</h3>

                <a href="login.html">Log in</a>
                <a href="register.html">Register</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="subscriptions.php">Subscription</a>
                <a href="submit.php">Submit an article</a>

            </div>


            <!-- CONTACT -->
            <div class="footer-col">

                <h3>Contact</h3>

                <a href="mailto:newsroom@newsingreen.edu">
                    newsroom@newsingreen.edu
                </a>

                <span>
                    123 University Avenue, Colombo
                </span>

            </div>

        </div>


        <!-- COPYRIGHT -->
        <div class="footer-bottom">
            &copy; 2026 News In Green
        </div>

    </footer>

</body>
</html>
