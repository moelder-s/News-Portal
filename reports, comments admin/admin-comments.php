<?php
// Presentation page only. Database integration will be added separately.
declare(strict_types=1);
header("Content-Type: text/html; charset=UTF-8");
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Comments — News In Green Admin</title>
    <link rel="stylesheet" href="comments.css">
    <script src="comments.js" defer></script>
</head>

<body class="day">
    <header class="topbar">
        <div class="brand"><span class="logo">N</span><span>News <em>In Green</em></span><span
                class="dot"></span><strong>Comments</strong></div>
        <nav><a class="logout" href="#" data-placeholder="logout">Log out</a><button id="themeToggle" class="theme"
                type="button" aria-label="Toggle day and night theme"><span class="switch"></span><span
                    id="themeLabel">Day</span></button><a class="home" href="#" data-placeholder="home">Home</a><span
                class="profile"><b>A</b> Admin</span></nav>
    </header>
    <main>
        <section class="moderation-heading">
            <div>
                <p class="eyebrow">ADMIN PANEL</p>
                <h1>Comment Moderation</h1>
                <p>Review, approve or reject comments from readers.</p>
            </div>
        </section>
        <section class="moderation-stats">
            <article class="metric metric-blue"><span class="metric-icon"><svg viewBox="0 0 24 24">
                        <path d="M4 5h16v12H9l-5 3V5z" />
                        <path d="M8 11h.01M12 11h.01M16 11h.01" />
                    </svg></span>
                <div>Total Comments<strong id="totalCount">0</strong></div>
            </article>
            <article class="metric metric-gold"><span class="metric-icon"><svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 6v6l4 2" />
                    </svg></span>
                <div>Pending Review<strong id="pendingCount">0</strong></div>
            </article>
            <article class="metric metric-green"><span class="metric-icon"><svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="m7 12 3 3 7-7" />
                    </svg></span>
                <div>Approved<strong id="approvedCount">0</strong></div>
            </article>
            <article class="metric metric-red"><span class="metric-icon"><svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="9" />
                        <path d="m8 8 8 8M16 8l-8 8" />
                    </svg></span>
                <div>Rejected<strong id="rejectedCount">0</strong></div>
            </article>
        </section>
        <section class="glass moderation-panel">
            <div class="moderation-toolbar">
                <h2>Comments awaiting moderation <span id="pendingBadge" class="pending-badge"></span></h2>
                <div class="moderation-controls"><input id="commentSearch" type="search"
                        placeholder="Search commenter, comment or article..." aria-label="Search comments"><select
                        id="statusFilter" aria-label="Filter by status">
                        <option value="pending">Pending</option>
                        <option value="all">All Comments</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select></div>
            </div>
            <div class="table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Commenter</th>
                            <th>Comment</th>
                            <th>Article</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="commentRows"></tbody>
                </table>
            </div>
            <p id="emptyMessage" class="empty" hidden>Nothing waiting for moderation right now.</p>
            <div class="moderation-footer"><span id="pageInfo"></span>
                <div class="page-controls"><button id="prevPage" type="button">‹ Prev</button><span
                        id="pageNumbers"></span><button id="nextPage" type="button">Next ›</button></div>
            </div>
        </section>
        <p class="demo-note">Comments will appear here when connected to your database.</p>
    </main>
    <div id="moderationToast" role="status" aria-live="polite"></div>
</body>

</html>