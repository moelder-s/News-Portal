<?php
require_once __DIR__.'/bootstrap.php';require_login();
$message='';$error='';
if($_SERVER['REQUEST_METHOD']==='POST'){
 verify_csrf();
 if(isset($_FILES['avatar']) && $_FILES['avatar']['error']===UPLOAD_ERR_OK){
  $f=$_FILES['avatar'];
  if($f['size']>2*1024*1024)$error='Photo must be under 2 MB.';
  else { $info=@getimagesize($f['tmp_name']);$type=$info['mime']??'';$ext=['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp'][$type]??null;
   if(!$ext)$error='Only JPG, PNG or WebP photos are allowed.';
   else { $dir=__DIR__.'/uploads/avatars';if(!is_dir($dir))mkdir($dir,0755,true);$dest='uploads/avatars/'.bin2hex(random_bytes(16)).'.'.$ext;
    if(move_uploaded_file($f['tmp_name'],__DIR__.'/'.$dest)){
     $q=$conn->prepare('INSERT INTO user_profiles(user_id,avatar_path) VALUES(?,?) ON DUPLICATE KEY UPDATE avatar_path=VALUES(avatar_path)');$q->execute([user_id(),$dest]);$message='Photo updated.';
    } else $error='Upload failed. Check folder permissions.';
   }
  }
 } else $error='Choose a photo first.';
}
$q=$conn->prepare('SELECT u.full_name,u.email,p.avatar_path FROM users u LEFT JOIN user_profiles p ON p.user_id=u.id WHERE u.id=?');$q->execute([user_id()]);$u=$q->fetch();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My Profile — News In Green</title>
    <script src="site-shared.js"></script>
    <link rel="stylesheet" href="site-shared.css">
    <link rel="stylesheet" href="profile.css">
    <script src="profile.js" defer></script>
</head>
<body class="profile-page-body">
    <header class="site-header">
        <div class="header-inner">
            <a class="brand" href="home.php">News In Green</a>
            <div class="header-actions">
                <button id="theme-toggle" type="button">Day / Night</button>
                <a href="dashboard.php">Dashboard</a><a href="logout.php">Log out</a>
            </div>
        </div>
    </header>
    <main class="profile-page" aria-labelledby="profile-title">
        <a class="profile-back" href="dashboard.php"><span aria-hidden="true">←</span> Back to dashboard</a>
        <div class="profile-heading">
            <h1 id="profile-title">My Profile</h1>
            <p>View your account and update your photo.</p>
        </div>
        <?php if($message): ?><p class="profile-feedback is-success" role="status"><?= esc($message) ?></p><?php endif; ?>
        <?php if($error): ?><p class="profile-feedback is-error" role="alert"><?= esc($error) ?></p><?php endif; ?>
        <section class="profile-card" aria-label="Account details and profile photo">
            <div class="profile-summary">
                <div class="profile-avatar" id="profile-avatar">
                    <?php if($u['avatar_path']): ?>
                        <img id="profile-photo" src="<?= esc($u['avatar_path']) ?>" alt="Your profile photo">
                    <?php else: ?>
                        <svg id="profile-placeholder" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                    <?php endif; ?>
                </div>
                <h2>Account details</h2>
                <dl class="profile-details">
                    <div><dt>Name</dt><dd><?= esc($u['full_name']) ?></dd></div>
                    <div><dt>Email</dt><dd><?= esc($u['email']) ?></dd></div>
                </dl>
            </div>
            <div class="profile-editor">
                <h2>Profile photo</h2>
                <form class="profile-form" method="post" enctype="multipart/form-data">
                    <input type="hidden" name="csrf" value="<?= esc(csrf()) ?>">
                    <div class="profile-upload">
                        <svg class="profile-upload-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/></svg>
                        <label for="avatar">Choose a profile picture</label>
                        <p id="avatar-help">JPG, PNG or WebP; maximum 2 MB</p>
                        <input id="avatar" type="file" name="avatar" accept="image/jpeg,image/png,image/webp" aria-describedby="avatar-help avatar-status" required>
                    </div>
                    <p id="avatar-status" class="profile-file-status" role="status" aria-live="polite">Your selected photo will appear in the preview.</p>
                    <div class="profile-form-actions">
                        <a class="profile-cancel" href="dashboard.php">Back to dashboard</a>
                        <button class="profile-save" type="submit">Save photo</button>
                    </div>
                </form>
            </div>
        </section>
    </main>
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

                <a href="logout.php">Log out</a>
                <a href="dashboard.php">Dashboard</a>
                <a href="bookmarks.php">Bookmarks</a>
                <a href="subscriptions.php">Subscription</a>
                <a href="submit.php">Submit an article</a>

            </div>


            <!-- CONTACT -->

        </div>


        <!-- COPYRIGHT -->
        <div class="footer-bottom">
            &copy; 2026 News In Green
        </div>

    </footer>
</body>
</html>
