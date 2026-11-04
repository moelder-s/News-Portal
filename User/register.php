<?php
require_once __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['success' => false, 'message' => 'Method not allowed'], 405);
$d = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$name = trim((string)($d['full_name'] ?? $d['name'] ?? ''));
$email = strtolower(trim((string)($d['email'] ?? '')));
$pass = (string)($d['password'] ?? '');
if (mb_strlen($name) < 2 || mb_strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 8) json_out(['success' => false, 'message' => 'Use your name, a valid email and a password of at least 8 characters'], 422);
try {
    $s = $conn->prepare('INSERT INTO users(full_name,email,password) VALUES(?,?,?)');
    $s->execute([$name, $email, password_hash($pass, PASSWORD_DEFAULT)]);
    json_out(['success' => true, 'message' => 'Account created']);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') json_out(['success' => false, 'message' => 'Email is already registered'], 409);
    throw $e;
}
