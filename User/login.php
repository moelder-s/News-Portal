<?php
require_once __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['success' => false, 'message' => 'Method not allowed'], 405);
$d = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$email = strtolower(trim((string)($d['email'] ?? '')));
$pass = (string)($d['password'] ?? '');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $pass === '') json_out(['success' => false, 'message' => 'Please enter valid login details'], 422);
$q = $conn->prepare('SELECT id,full_name,password FROM users WHERE email=? LIMIT 1');
$q->execute([$email]);
$u = $q->fetch();
if (!$u || !password_verify($pass, $u['password'])) json_out(['success' => false, 'message' => 'Invalid email or password'], 401);
session_regenerate_id(true);
$_SESSION['user_id'] = (int)$u['id'];
$_SESSION['user_name'] = $u['full_name'];
json_out(['success' => true, 'redirect' => 'dashboard.php']);
