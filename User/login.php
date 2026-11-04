
<?php
require_once __DIR__ . '/bootstrap.php';

// Allow only POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out([
        'success' => false,
        'message' => 'Method not allowed'
    ], 405);
    exit;
}

// Get input data
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (stripos($contentType, 'application/json') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        json_out([
            'success' => false,
            'message' => 'Invalid JSON data'
        ], 400);
        exit;
    }
} else {
    $data = $_POST;
}

// Get email and password
$email = strtolower(trim((string)($data['email'] ?? '')));
$password = (string)($data['password'] ?? '');

// Validate input
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
    json_out([
        'success' => false,
        'message' => 'Please enter valid login details'
    ], 422);
    exit;
}

// Find user by email
$query = $conn->prepare(
    'SELECT id, full_name, password
     FROM users
     WHERE email = ?
     LIMIT 1'
);

$query->execute([$email]);
$user = $query->fetch(PDO::FETCH_ASSOC);

// Verify password
if (!$user || !password_verify($password, $user['password'])) {
    json_out([
        'success' => false,
        'message' => 'Invalid email or password'
    ], 401);
    exit;
}

// Start session if needed
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Regenerate session ID for security
session_regenerate_id(true);

// Store user details
$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_name'] = $user['full_name'];

// Login successful
json_out([
    'success' => true,
    'message' => 'Login successful',
    'redirect' => 'dashboard.php'
]);
exit;
?>
