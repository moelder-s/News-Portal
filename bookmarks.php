```php
<?php
session_start();

require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$user_id = (int) $_SESSION['user_id'];

if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && isset($_POST['remove_bookmark'])) {

    if (
        !isset($_POST['csrf_token']) ||
        !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])
    ) {
        exit('Invalid request. Please refresh the page.');
    }

    $article_id = filter_input(
        INPUT_POST,
        'article_id',
        FILTER_VALIDATE_INT
    );

    if ($article_id) {
        $stmt = $conn->prepare(
            "DELETE FROM bookmarks
             WHERE user_id = ? AND article_id = ?"
        );

        $stmt->bind_param('ii', $user_id, $article_id);
        $stmt->execute();
        $stmt->close();
    }

    header('Location: bookmarks.php');
    exit;
}

$stmt = $conn->prepare(
    "SELECT articles.id,
            articles.title,
            articles.category,
            articles.url
     FROM bookmarks
     INNER JOIN articles
        ON bookmarks.article_id = articles.id
     WHERE bookmarks.user_id = ?
     ORDER BY bookmarks.id DESC"
);

$stmt->bind_param('i', $user_id);
$stmt->execute();

$result = $stmt->get_result();
$bookmarks = $result->fetch_all(MYSQLI_ASSOC);

$stmt->close();
?>

<main>
    <section class="title-section">
        <h2>Your Bookmarks</h2>
        <p>Articles you've saved to read later.</p>
    </section>

    <?php if (empty($bookmarks)): ?>

        <section class="empty-box">
            <h3>No bookmarks yet</h3>
            <p>Save an article from the Browse page to see it here.</p>
            <a href="browse.php" class="btn-browse">
                Browse Articles
            </a>
        </section>

    <?php else: ?>

        <section class="bookmark-list">

            <?php foreach ($bookmarks as $article): ?>

                <article class="bookmark-card">

                    <div>
                        <h4>
                            <a href="<?= htmlspecialchars(
                                $article['url'] ?: 'browse.php',
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>">
                                <?= htmlspecialchars(
                                    $article['title'],
                                    ENT_QUOTES,
                                    'UTF-8'
                                ) ?>
                            </a>
                        </h4>

                        <p class="bookmark-meta">
                            <?= htmlspecialchars(
                                $article['category'] ?? 'General',
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>
                        </p>
                    </div>

                    <form method="POST" action="bookmarks.php">
                        <input
                            type="hidden"
                            name="csrf_token"
                            value="<?= htmlspecialchars(
                                $_SESSION['csrf_token'],
                                ENT_QUOTES,
                                'UTF-8'
                            ) ?>"
                        >

                        <input
                            type="hidden"
                            name="article_id"
                            value="<?= (int) $article['id'] ?>"
                        >

                        <button
                            type="submit"
                            name="remove_bookmark"
                            value="1"
                        >
                            Remove Bookmark
                        </button>
                    </form>

                </article>

            <?php endforeach; ?>

        </section>

    <?php endif; ?>
</main>
```