<?php
require_once __DIR__ . '/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_out(['success' => false, 'message' => 'Method not allowed'], 405);
$d = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$name = trim((string)($d['full_name'] ?? $d['name'] ?? ''));
$email = strtolower(trim((string)($d['email'] ?? '')));
$pass = (string)($d['password'] ?? '');
$faculty = trim((string)($d['faculty'] ?? ''));
$course = trim((string)($d['course'] ?? ''));
$allowedFaculties = ['Faculty of Computing', 'Faculty of Business', 'Faculty of Engineering', 'Faculty of Science', 'Other'];
if (!in_array($faculty, $allowedFaculties, true) || $course === '' || mb_strlen($course) > 65 || str_contains($course, '|')) {
    json_out(['success' => false, 'message' => 'Select a valid faculty and course.'], 422);
}
// The existing schema has user_profiles.faculty but no course column.
// Store both compactly in this existing field; profile.php displays them separately.
$education = $faculty . ' | ' . $course;
if (mb_strlen($education) > 120) json_out(['success' => false, 'message' => 'Course name is too long.'], 422);
if (mb_strlen($name) < 2 || mb_strlen($name) > 100 || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 8) json_out(['success' => false, 'message' => 'Use your name, a valid email and a password of at least 8 characters'], 422);
try {
    $conn->beginTransaction();
    $s = $conn->prepare('INSERT INTO users(full_name,email,password) VALUES(?,?,?)');
    $s->execute([$name, $email, password_hash($pass, PASSWORD_DEFAULT)]);
    $profile = $conn->prepare('INSERT INTO user_profiles(user_id,faculty) VALUES(?,?)');
    $profile->execute([(int)$conn->lastInsertId(), $education]);
    $conn->commit();
    json_out(['success' => true, 'message' => 'Account created']);
} catch (PDOException $e) {
    if ($conn->inTransaction()) $conn->rollBack();
    if ($e->getCode() === '23000') json_out(['success' => false, 'message' => 'Email is already registered'], 409);
    throw $e;
}
