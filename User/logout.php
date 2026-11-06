<?php
session_start();
$_SESSION = [];
session_regenerate_id(true);
session_destroy();
header('Location: home.php');
exit;
