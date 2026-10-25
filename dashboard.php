<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Work+Sans:wght@400;500;600&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="dashboard.css">
    <script>
        /* code for loading the previous dark / light theme values from other pages --important */
        try { if (localStorage.getItem('theme') === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); } catch (e) {}
    </script>
    <script src="dashboard.js" defer></script>

</head>
<body>
    <header class="site-header">
        <div class="header-inner">
            <a href="home.php" class="brand">
                <span class="brand-mark">N</span>
                <span class="brand-text">News <em>In Green</em></span>
            </a>

            <nav class="main-nav" id="main-nav" aria-label="Primary">
                <a href="home.php">Home</a>
                <a href="dashboard.php" class="active">Dashboard</a>
                <a href="browse.php">Browse</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="submit.php">Submit an Article</a>
                <a href="help.php">Help &amp; Support</a>
            </nav>

            <div class="header-actions">
                <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Switch to night mode"
                    aria-pressed="false">
                    <span class="toggle-track"><span class="toggle-thumb"></span></span>
                    <span class="toggle-label">Day</span>
                </button>
                <a href="#" id="logout-link" class="btn btn-ghost">Log out</a>
            </div>

            <button class="nav-burger" id="nav-burger" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav" type="button">
                <span></span><span></span><span></span>
            </button>
        </div>
    </header>

<main class="dashboard-main container">
    
    <section class="dashboard-greeting">
        <div class="greeting-text">
            <h1>Welcome back</h1>
            <p>Here's everything your account can do on News In Green.</p>
        </div>
        
        <a href="profile.php" class="btn-ghost">Edit profile</a>
    </section>

    <section class="stats-row">
        <div class="stat-card">
            <h3>Bookmarked articles</h3>
            <span class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <h3>Subscribed categories</h3>
            <span class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <h3>Articles submitted</h3>
            <span class="stat-number">0</span>
        </div>
        <div class="stat-card">
            <h3>Comments posted</h3>
            <span class="stat-number">0</span>
        </div>
    </section>
<!--My Submissions Section -->
    <section class="dashboard-submissions">
        <h3>My submissions</h3>
        <div class="submissions-grid">
            <!--have to load the connecting part here -->
            <div class="submission-card">
                <div class="submission-info">
                    <h4>The Future of AI in Campus Learning</h4>
                    <span class="status pending">Pending Review</span>
                </div>
                <span class="date">Oct 19, 2026</span>
            </div>
        </div>
    </section>
<!--My Comments Section -->
    <section class="dashboard-comments">
        <h3>My comments</h3>
        <div class="comments-grid">
            <!-- Example --have to load the connecting part here -->
            <div class="comment-card">
                <div class="comment-info">
                    <h4>On: The Future of AI in Campus Learning</h4>
                    <span class="comment-text">"Great article! I really agree with the points made here."</span>
                </div>
                <span class="date">Oct 19, 2026</span>
            </div>
        </div>
    </section>

    <section class="dashboard-actions-section">
        <h3>Quick actions</h3>
        <div class="actions-grid">
            <a href="submit.php" class="action-tile">Submit an article</a>
            <a href="bookmarks.php" class="action-tile">Bookmarks</a>
            <a href="subscriptions.php" class="action-tile">Subscriptions</a>
        </div>
    </section>
</main>

    <footer class="site-footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <span class="brand-mark">N</span>
                <span class="brand-text">News <em>In Green</em></span>
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
                <a href="login.php">Log in</a>
                <a href="register.php">Register</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="subscriptions.php">Subscriptions</a>
                <a href="submit.php">Submit an article</a>
            </div>
            <div class="footer-col">
                <h3>Contact</h3>
                <a href="mailto:newsroom@newsingreen.edu">newsroom@newsingreen.edu</a>
                <span>123 University Avenue, Colombo</span>
            </div>
        </div>
        <div class="footer-bottom">
            <span>&copy; 2026 News In Green</span>
        </div>
    </footer>
    
</body>
</html>

