<?php require_once __DIR__.'/bootstrap.php';require_login();$mark=$conn->prepare('UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0');$mark->execute([user_id()]);$s=$conn->prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50');$s->execute([user_id()]);$rows=$s->fetchAll();?>
<!doctype html><html lang="en"><head>
    <script src="site-shared.js?v=perf-final-1"></script><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="notifications.css"><title>Notifications | News In Green</title><link rel="stylesheet" href="site-shared.css?v=one-row-mobile-20261107-4">

  <link rel="stylesheet" href="page-transition.css?v=noflash-native-20261107-4">
  <script src="page-transition.js?v=noflash-native-20261107-4" defer></script>
</head><body class="nig-day-desk-target nig-inner-desk-page"><header class="site-header">
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

                <a href="#" id="logout-link" class="btn-ghost">
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
    </header><main class="subs-page"><section class="subs-panel"><h1>Your notifications</h1><p>Your article review decisions and updates from subscribed categories.</p><?php foreach($rows as $n):?><article class="sub-card" style="padding:20px;margin:12px 0"><h3><?php if (!empty($n['article_id'])): ?><a href="article.php?id=<?= (int)$n['article_id'] ?>"><?=esc($n['title'])?></a><?php else: ?><a href="dashboard.php"><?=esc($n['title'])?></a><?php endif; ?></h3><p><?=esc($n['message'])?></p><small><?=esc($n['created_at'])?></small></article><?php endforeach;?><?php if(!$rows):?><p>No notifications yet. Your article submission and approval updates will appear here.</p><?php endif;?></section></main></body></html>
