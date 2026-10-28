<?php
/**
 * All FIVE bookmark PHP files combined, including the uploaded bookmarks.php.
 * Uses the team's existing PDO db.php (keep it beside this file).
 * GET bookmarks.php: page. GET bookmarks.php?api=1: saved IDs/token.
 * POST bookmarks.php: add/remove. CMD: php bookmarks.php --install or --sql.
 * In existing bookmark-buttons.js, replace both fetch URLs:
 * bookmark-action.php -> bookmarks.php?api=1
 */

if (PHP_SAPI !== 'cli' && session_status() !== PHP_SESSION_ACTIVE) session_start();
require_once __DIR__ . '/db.php'; // Existing team PDO connection, unchanged.

// Match these names to the database your team passes to you.
$bookmarkConfig = [
    'users_table' => 'users', 'user_id_column' => 'id',
    'articles_table' => 'articles', 'article_id_column' => 'id',
    'article_title_column' => 'title',
    // Optional column: use null if your team does not have one.
    'article_category_column' => 'category',
    'article_url_column' => 'url', // Optional; ignored if the column is absent.
    'bookmarks_table' => 'bookmarks',
    'session_user_id' => 'user_id',
    'login_page' => 'login.php',
    'browse_page' => 'browse.php',
    // Set only once the article member provides a working detail page.
    // Example: 'article.php?id={id}'
    'article_page' => null,
];

function bm_ident($name) {
    if (!is_string($name) || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $name)) throw new RuntimeException('Invalid bookmark column/table configuration.');
    return '`' . $name . '`';
}
function bm_h($text) { return htmlspecialchars((string)$text, ENT_QUOTES, 'UTF-8'); }
function bm_safe_url($url) {
    return is_string($url) && filter_var($url, FILTER_VALIDATE_URL)
        && in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?? ''), ['http', 'https'], true)
        ? $url : null;
}
function bm_user() {
    global $bookmarkConfig;
    $value = $_SESSION[$bookmarkConfig['session_user_id']] ?? null;
    $id = filter_var($value, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
    return $id === false ? null : $id;
}
function bm_token() {
    if (empty($_SESSION['bookmark_csrf'])) $_SESSION['bookmark_csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['bookmark_csrf'];
}
function bm_check_token($token) {
    return is_string($token) && hash_equals(bm_token(), $token);
}
function bm_columns($table) {
    global $conn;
    return $conn->query('SHOW COLUMNS FROM ' . bm_ident($table))->fetchAll(PDO::FETCH_ASSOC);
}
function bm_account_exists($user) {
    global $conn, $bookmarkConfig;
    $s = $conn->prepare('SELECT 1 FROM ' . bm_ident($bookmarkConfig['users_table']) . ' WHERE ' . bm_ident($bookmarkConfig['user_id_column']) . '=?');
    $s->execute([$user]); return (bool)$s->fetchColumn();
}
function bm_saved($user) {
    global $conn, $bookmarkConfig;
    $s=$conn->prepare('SELECT article_id FROM ' . bm_ident($bookmarkConfig['bookmarks_table']) . ' WHERE user_id=?');
    $s->execute([$user]); return array_map('intval', $s->fetchAll(PDO::FETCH_COLUMN));
}

// Table setup is available only in CMD; opening this page never creates tables.
if (PHP_SAPI === 'cli') {
    if (!in_array('--install', $argv, true) && !in_array('--sql', $argv, true)) {
        echo "Use: php bookmarks.php --install\nOr: php bookmarks.php --sql\n"; exit;
    }
try {
    $c=$bookmarkConfig;
    function bm_reference_type($table,$column) {
        global $conn;
        $rows=bm_columns($table);
        foreach ($rows as $row) if ($row['Field'] === $column) {
            $type=strtolower($row['Type']);
            if (!preg_match('/^(tinyint|smallint|mediumint|int|bigint)(\(\d+\))?( unsigned)?$/D',$type)) throw new RuntimeException('Referenced IDs must be positive integer columns.');
            $s=$conn->prepare('SHOW INDEX FROM ' . bm_ident($table)); $s->execute();
            $keys=[];
            foreach ($s->fetchAll(PDO::FETCH_ASSOC) as $key) if ((int)$key['Non_unique']===0) $keys[$key['Key_name']][]=$key['Column_name'];
            if (!in_array([$column],$keys,true)) throw new RuntimeException("$table.$column must be a primary or single-column unique key.");
            return strtoupper($type);
        }
        throw new RuntimeException("Missing column: $table.$column");
    }
    $ut=bm_reference_type($c['users_table'],$c['user_id_column']);
    $at=bm_reference_type($c['articles_table'],$c['article_id_column']);
    $articleColumns=array_column(bm_columns($c['articles_table']),'Field');
    if (!in_array($c['article_title_column'],$articleColumns,true)) throw new RuntimeException('Article title column not found; update the settings at the top of bookmarks.php.');
    foreach ([$c['users_table'],$c['articles_table']] as $name) {
        $s=$conn->prepare('SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?');$s->execute([$name]);
        if (strcasecmp((string)$s->fetchColumn(),'InnoDB')!==0) throw new RuntimeException('Referenced tables must use InnoDB. No existing table was changed.');
    }
    $b=bm_ident($c['bookmarks_table']);$u=bm_ident($c['users_table']);$ui=bm_ident($c['user_id_column']);$a=bm_ident($c['articles_table']);$ai=bm_ident($c['article_id_column']);
    $s=$conn->prepare('SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=?');$s->execute([$c['bookmarks_table']]);
    if ($s->fetchColumn()) throw new RuntimeException('A bookmarks table already exists. Installer did not change it. Compare its columns before using this feature.');
    $sql="CREATE TABLE $b (\n id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,\n user_id $ut NOT NULL,\n article_id $at NOT NULL,\n created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,\n UNIQUE KEY unique_user_article (user_id,article_id),\n FOREIGN KEY (user_id) REFERENCES $u ($ui) ON DELETE CASCADE,\n FOREIGN KEY (article_id) REFERENCES $a ($ai) ON DELETE CASCADE\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    // --sql prints the exact SQL for your current tables, without changing anything.
    if (in_array('--sql',$argv,true)) { echo $sql . "\n"; exit; }
    $conn->exec($sql);
    echo "Bookmark table created in the team's configured database. Existing users and articles were not changed.\n";
} catch (Throwable $e) { fwrite(STDERR, "Stopped: " . $e->getMessage() . "\n"); exit(1); }

exit;
}

if (isset($_GET['api']) || $_SERVER['REQUEST_METHOD'] !== 'GET') {


function bm_reply($status, $data) {
    http_response_code($status); header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store'); echo json_encode($data); exit;
}
$user=bm_user();
if (!$user) bm_reply(401, ['success'=>false,'message'=>'Please sign in first.']);
try {
    if (!bm_account_exists($user)) bm_reply(401,['success'=>false,'message'=>'Please sign in with a current team account.']);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        bm_reply(200,['success'=>true,'csrf_token'=>bm_token(),'article_ids'=>bm_saved($user)]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { header('Allow: GET, POST'); bm_reply(405,['success'=>false,'message'=>'Use POST to change bookmarks.']); }
    $json = stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') === 0;
    $data = $json ? json_decode(file_get_contents('php://input'),true) : $_POST;
    if (!is_array($data)) bm_reply(400,['success'=>false,'message'=>'Invalid request.']);
    if (!bm_check_token($data['csrf_token'] ?? null)) bm_reply(403,['success'=>false,'message'=>'Refresh this page and try again.']);
    $id=filter_var($data['article_id'] ?? null, FILTER_VALIDATE_INT, ['options'=>['min_range'=>1]]);
    $action=$data['action'] ?? (isset($data['remove_bookmark']) ? 'remove' : null);
    if (!$id || !in_array($action,['add','remove'],true)) bm_reply(400,['success'=>false,'message'=>'Invalid article ID or action.']);
    $table=bm_ident($bookmarkConfig['bookmarks_table']);
    if ($action === 'add') {
        $s=$conn->prepare('SELECT 1 FROM ' . bm_ident($bookmarkConfig['articles_table']) . ' WHERE ' . bm_ident($bookmarkConfig['article_id_column']) . '=?');
        $s->execute([$id]);
        if (!$s->fetchColumn()) bm_reply(404,['success'=>false,'message'=>'Article not found.']);
        $s=$conn->prepare("INSERT INTO $table (user_id,article_id) VALUES (?,?) ON DUPLICATE KEY UPDATE id=id");
    } else {
        $s=$conn->prepare("DELETE FROM $table WHERE user_id=? AND article_id=?");
    }
    $s->execute([$user,$id]);
    if ($json) bm_reply(200,['success'=>true,'saved'=>$action==='add','article_id'=>$id]);
    header('Location: bookmarks.php',true,303); exit;
} catch (Throwable $e) {
    error_log('Bookmark: ' . $e->getMessage());
    bm_reply(503,['success'=>false,'message'=>'Bookmarks are not ready. Check the team database and run php bookmarks.php --install from CMD.']);
}

}


$user=bm_user();
if (!$user) { header('Location: ' . $bookmarkConfig['login_page']); exit; }
header('Cache-Control: no-store');
$bookmarks=[]; $bookmarkError='';
try {
    if (!bm_account_exists($user)) { header('Location: ' . $bookmarkConfig['login_page']); exit; }
    $a=bm_ident($bookmarkConfig['articles_table']); $b=bm_ident($bookmarkConfig['bookmarks_table']);
    $id=bm_ident($bookmarkConfig['article_id_column']); $title=bm_ident($bookmarkConfig['article_title_column']);
    $columns=array_column(bm_columns($bookmarkConfig['articles_table']),'Field');
    if (!in_array($bookmarkConfig['article_id_column'],$columns,true) || !in_array($bookmarkConfig['article_title_column'],$columns,true)) throw new RuntimeException('Check article column names.');
    $category=$bookmarkConfig['article_category_column'];
    $categorySql=$category && in_array($category,$columns,true) ? 'a.'.bm_ident($category) : "'General'";
    $urlColumn=$bookmarkConfig['article_url_column'];
    $urlSql=$urlColumn && in_array($urlColumn,$columns,true) ? 'a.'.bm_ident($urlColumn) : 'NULL';
    $s=$conn->prepare("SELECT b.article_id,b.created_at,a.$title AS title,$urlSql AS url,$categorySql AS category FROM $b b INNER JOIN $a a ON a.$id=b.article_id WHERE b.user_id=? ORDER BY b.id DESC");
    $s->execute([$user]); $bookmarks=$s->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    error_log('Bookmarks page: ' . $e->getMessage());
    http_response_code(503);
    $bookmarkError='Check the article table names in the settings at the top of bookmarks.php and ask your team to run php bookmarks.php --install from CMD.';
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
                <button id="theme-toggle" class="theme-toggle"
                        type="button" aria-pressed="false"
                        onclick="toggleTheme()"
                        aria-label="Toggle light and dark theme">
                    <span class="toggle-track">
                        <span class="toggle-thumb"></span>
                    </span>
                    <span class="toggle-label">Night</span>
                </button>

                <a href="home.php" class="btn-ghost">Home</a>
            </div>

            <button class="nav-burger" id="nav-burger"
                    type="button" aria-label="Open menu"
                    aria-expanded="false" aria-controls="main-nav">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <main>
        <section class="title-section">
            <h2>Your bookmarks</h2>
            <p>Articles you've saved to read later. Only visible to you when signed in.</p>
        </section>

        <?php if ($bookmarkError): ?>
        <section class="empty-box" role="alert"><h3>Bookmarks are not ready</h3><p><?= bm_h($bookmarkError) ?></p></section>
        <?php elseif (!$bookmarks): ?>
        <section class="empty-box"><h3>No bookmarks yet</h3><p>Save an article using the Browse page's bookmark button.</p><a href="<?= bm_h($bookmarkConfig['browse_page']) ?>" class="btn-browse">Browse articles</a></section>
        <?php else: ?>
        <section class="bookmark-list" id="bookmark-list">
        <?php foreach ($bookmarks as $article): ?>
        <article class="bookmark-card"><div>
            <?php $articleLink = $bookmarkConfig['article_page']
                ? str_replace('{id}', rawurlencode((string)$article['article_id']), $bookmarkConfig['article_page'])
                : bm_safe_url($article['url']); ?>
            <h4><?php if ($articleLink): ?>
            <a href="<?= bm_h($articleLink) ?>"><?= bm_h($article['title']) ?></a>
            <?php else: ?><?= bm_h($article['title']) ?><?php endif; ?></h4>
            <p class="bookmark-meta"><?= bm_h($article['category']) ?> | Saved <?= bm_h($article['created_at']) ?></p>
        </div><form action="bookmarks.php" method="post">
            <input type="hidden" name="csrf_token" value="<?= bm_h(bm_token()) ?>">
            <input type="hidden" name="article_id" value="<?= (int)$article['article_id'] ?>">
            <input type="hidden" name="action" value="remove">
            <button type="submit" class="btn-browse">Remove bookmark</button>
        </form></article>
        <?php endforeach; ?>
        </section>
        <?php endif; ?>
    </main>

    <footer class="site-footer">
        <div class="footer-inner">
            <div class="footer-brand">
                <a href="home.php" class="brand">
                    <span class="brand-mark">N</span>
                    <span class="brand-text">News <em>In Green</em></span>
                </a>
                <p>
                    The student-run news portal covering academics,
                    events, sport, and campus life.
                </p>
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
                <a href="home.php">Account home</a>
                <a href="register.php">Register</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="subscriptions.php">Subscription</a>
                <a href="submit.php">Submit an article</a>
            </div>

            <div class="footer-col">
                <h3>Contact</h3>
                <a href="mailto:newsroom@newsingreen.edu">
                    newsroom@newsingreen.edu
                </a>
                <span>123 University Avenue, Colombo</span>
            </div>
        </div>

        <div class="footer-bottom">
            &copy; 2026 News In Green
        </div>
    </footer>
</body>
</html>