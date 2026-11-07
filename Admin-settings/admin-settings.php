<?php
// Admin settings page (Change password).
// TEST VERSION: it uses its own test database (admin_test) through admin_db.php.
// When the leader joins admin and user tables into one database, delete the lines
// marked TEST and put this instead:   require_once __DIR__ . '/../bootstrap.php';

if (session_status() !== PHP_SESSION_ACTIVE) session_start();     // TEST
require_once __DIR__ . '/admin_db.php';                            // TEST

if (!function_exists('esc')) {                                     // TEST
    function esc($v) { return htmlspecialchars((string) $v, ENT_QUOTES, 'UTF-8'); }
}
if (!function_exists('csrf')) {                                    // TEST
    function csrf() {
        if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
        return $_SESSION['csrf'];
    }
}
if (!function_exists('verify_csrf')) {                             // TEST
    function verify_csrf() {
        if (!hash_equals(csrf(), (string) ($_POST['csrf'] ?? ''))) {
            http_response_code(419);
            exit('Invalid form token');
        }
    }
}

// ---- Which admin is using this page? ----
// Until the admin login is ready, the test admin 880005 is used.
// When the admin login sets $_SESSION['admin_id'], this page uses it automatically.
$admin_id = isset($_SESSION['admin_id']) ? (int) $_SESSION['admin_id'] : 880005;

// ---- DEV ONLY: create the test admin once (password: Admin@123) ----
// Delete this block when the real admin login is finished.
$check = $conn->prepare("SELECT id FROM admin_users WHERE id = ?");
$check->execute([$admin_id]);
if (!$check->fetch()) {
    $make = $conn->prepare(
        "INSERT INTO admin_users (id, full_name, email, password_hash, role, is_active)
         VALUES (?, 'Admin', ?, ?, 'admin', 1)"
    );
    $make->execute([
        $admin_id,
        'admin' . $admin_id . '@newsingreen.edu',
        password_hash('Admin@123', PASSWORD_DEFAULT)
    ]);
}

// ---- Change password (Update) ----
$message = "";
$type = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $current = $_POST['current'] ?? "";
    $new = $_POST['new'] ?? "";
    $confirm = $_POST['confirm'] ?? "";

    $stmt = $conn->prepare("SELECT password_hash FROM admin_users WHERE id = ? AND is_active = 1");
    $stmt->execute([$admin_id]);
    $row = $stmt->fetch();

    if ($current === "" || $new === "" || $confirm === "") {
        $message = "Please fill in all the fields.";
        $type = "err";
    } elseif (!$row || !password_verify($current, $row['password_hash'])) {
        $message = "Current password is incorrect.";
        $type = "err";
    } elseif (strlen($new) < 8) {
        $message = "New password must be at least 8 characters.";
        $type = "err";
    } elseif ($new === $current) {
        $message = "New password must be different from the current password.";
        $type = "err";
    } elseif ($new !== $confirm) {
        $message = "New passwords do not match.";
        $type = "err";
    } else {
        $update = $conn->prepare("UPDATE admin_users SET password_hash = ? WHERE id = ?");
        $update->execute([password_hash($new, PASSWORD_DEFAULT), $admin_id]);
        $message = "Password updated successfully.";
        $type = "ok";
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Settings — News In Green Admin</title>

    <link rel="stylesheet" href="settings.css">
    <script src="settings.js" defer></script>
</head>

<body class="day">

    <!-- HEADER -->
    <header class="topbar">
        <div class="brand">
            <span class="logo">N</span>
            <span>News <em>In Green</em></span>
            <span class="dot"></span>
            <strong>Settings</strong>
        </div>

        <nav>
            <a class="logout" href="admin-login.php">Log out</a>

            <button id="themeToggle" class="theme" type="button"
                    aria-label="Toggle day and night theme" aria-pressed="false">
                <span class="switch"></span>
                <span id="themeLabel">Day</span>
            </button>

            <a class="home" href="admin-dashboard.php">Home</a>

            <a class="profile" href="settings.php"><b>A</b> Admin</a>
        </nav>
    </header>

    <!-- MAIN -->
    <main class="settings-main">

        <!-- CHANGE PASSWORD -->
        <section class="glass settings-card">
            <h2>Change password</h2>

            <form id="pw-form" class="card-body" method="post" action="settings.php" novalidate>

                <input type="hidden" name="csrf" value="<?php echo esc(csrf()); ?>">

                <p id="msg" class="msg <?php echo esc($type); ?>" role="status" aria-live="polite"><?php echo esc($message); ?></p>

                <div class="form-group">
                    <label for="current">Current password</label>
                    <input type="password" id="current" name="current"
                           autocomplete="current-password">
                </div>

                <div class="form-group">
                    <label for="new">New password</label>
                    <input type="password" id="new" name="new"
                           autocomplete="new-password">
                </div>

                <div class="form-group">
                    <label for="confirm">Confirm new password</label>
                    <input type="password" id="confirm" name="confirm"
                           autocomplete="new-password">
                </div>

                <div class="form-actions">
                    <button type="submit" class="primary-btn">Update password</button>
                </div>

            </form>
        </section>

        <!-- ADMIN ID -->
        <section class="glass settings-card">
            <h2>Admin ID</h2>

            <div class="card-body">
                <p class="admin-id-text">
                    Your admin ID is <strong id="admin-id"><?php echo esc($admin_id); ?></strong> and can't be changed from here.
                </p>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="site-footer">
            <span><strong>News <em>In Green</em></strong> · Admin Settings</span>
            <span>© <span id="year"></span> News In Green</span>
        </footer>

    </main>

</body>

</html>
