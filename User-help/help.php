<?php require_once __DIR__.'/bootstrap.php'; require_login(); ?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="site-shared.js?v=nav-hover-notice-4"></script>
    <title>Help & Support — News In Green</title>
    <link rel="stylesheet" href="help.css">
<link rel="stylesheet" href="site-shared.css?v=navpop-fix-2">

  <link rel="stylesheet" href="page-transition.css?v=3-retro-slider">
  <script src="page-transition.js?v=3-retro-slider" defer></script>
</head>

<body class="light-mode nig-inner-desk-page nig-day-desk-target">
    <header class="site-header">
        <div class="header-inner">
            <a href="home.php" class="brand">
                <span class="brand-mark">N</span>
                <span class="brand-text">News <em>In Green</em></span>
            </a>

            <nav class="main-nav" aria-label="Primary">
                <a href="home.php">Home</a>
                <a href="dashboard.php">Dashboard</a>
                <a href="browse.php">Browse</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="submit.php">Submit an article</a>
                <a href="subscriptions.php">Subscriptions</a>
                
            </nav>

            <div class="header-actions">
                <button
                    id="theme-toggle"
                    class="theme-toggle"
                    type="button"
                    aria-label="Switch theme"
                    onclick="toggleTheme()">
                    <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                    </span>
                    <span class="toggle-label" id="toggle-label">Day</span>
                </button>
                <a href="login.html" class="btn-logout">Log out</a>
            </div>
        </div>
    </header>
    <main class="help-main">
        <!-- Hero Section with Search and Quick Tags -->
        <section class="help-hero">
            <span class="sub-title">HELP CENTER</span>
            <h1>How can we help?</h1>
            <p class="hero-desc">Search our guides or ask a question.</p>

            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input id="help-search" type="text" placeholder="Search questions or answers..." aria-label="Search help questions">
            </div>
            <p id="help-search-status" class="search-status" aria-live="polite"></p>

            <div class="quick-tags">
                <span class="tag-label">Common questions:</span>
                <a href="#getting-started" class="tag">What is News In Green?</a>
                <a href="#submitting" class="tag">How to submit an article?</a>
                <a href="#account" class="tag">How do bookmarks work?</a>
                <a href="#troubleshooting" class="tag">Login & password help</a>
            </div>
        </section>

        <!-- Category 1: Getting Started -->
        <section class="help-topics" id="getting-started">
            <h2>Getting Started & Basics</h2>
            <div class="cards-grid">
                <div class="topic-card">
                    <h3>What is News In Green and how does it work?</h3>
                    <p>Learn about our student-run news portal covering campus life, events, academics, and sports.</p>
                </div>
                <div class="topic-card">
                    <h3>Do I need an account to read news?</h3>
                    <p>No, all news articles are public! However, creating an account lets you save bookmarks and submit
                        articles.</p>
                </div>
                <div class="topic-card">
                    <h3>How do I switch between dark and light modes?</h3>
                    <p>Click the theme toggle button on the top right header to switch display modes at any time.</p>
                </div>
                <div class="topic-card">
                    <h3>How do bookmarks work?</h3>
                    <p>Click the bookmark icon on any news card to save it to your personal Bookmarks page for quick
                        reading later.</p>
                </div>
            </div>
        </section>
        
        <!-- Category 2: Submitting Articles -->
        <section class="help-topics" id="submitting" style="margin-top: 50px;">
            <h2>Submitting & Article Publishing</h2>
            <div class="cards-grid">
                <div class="topic-card">
                    <h3>How do I submit an article?</h3>
                    <p>Log in to your student account, navigate to the Account section in the footer, and select "Submit
                        an article".</p>
                </div>
                <div class="topic-card">
                    <h3>Am I eligible to become a student contributor?</h3>
                    <p>Any registered student or faculty member can write and submit drafts for review by our editor
                        team.</p>
                </div>
                <div class="topic-card">
                    <h3>How long does article approval take?</h3>
                    <p>Submitted articles are usually reviewed by our editorial team within 24 to 48 hours before going
                        live.</p>
                </div>
                <div class="topic-card">
                    <h3>Can I edit my article after publishing?</h3>
                    <p>You can request minor updates or corrections by contacting the editors at
                        newsroom@newsingreen.edu.</p>
                </div>
            </div>
        </section>

        <!-- Category 3: Account & Subscriptions -->
        <section class="help-topics" id="account" style="margin-top: 50px;">
            <h2>Account & Newsletter Management</h2>
            <div class="cards-grid">
                <div class="topic-card">
                    <h3>How do I subscribe to the weekly newsletter?</h3>
                    <p>Enter your email address in the subscription box on the home page or turn on email notifications
                        in settings.</p>
                </div>
                <div class="topic-card">
                    <h3>How can I update my profile details?</h3>
                    <p>Log in and open your profile settings to change your name, avatar, or registered email address.
                    </p>
                </div>
            </div>
        </section>

        <!-- Category 4: Technical Support -->
        <section class="help-topics" id="troubleshooting" style="margin-top: 50px;">
            <h2>Technical & Troubleshooting</h2>
            <div class="cards-grid">
                <div class="topic-card">
                    <h3>What should I do if I forgot my password?</h3>
                    <p>Click "Log in" on the top header, select "Forgot Password", and follow the instructions sent to
                        your email.</p>
                </div>
                <div class="topic-card">
                    <h3>Who do I contact for website bugs or issues?</h3>
                    <p>Reach out to our developer team directly at newsroom@newsingreen.edu with details of the issue.
                    </p>
                </div>
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
                <a href="subscriptions.php">Subscriptions</a>
                <a href="submit.php">Submit an article</a>
            </div>
        </div>
        <div class="footer-bottom">
            <span>&copy; 2026 News In Green</span>
        </div>
    </footer>
    <script src="help.js"></script>
</body>
</html>