
<?php

declare(strict_types=1);

require_once __DIR__ . '/db_admin.php';

// Only allow POST requests.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    admin_json([
        'success' => false,
        'message' => 'POST request required.'
    ], 405);
    exit;
}

try {
    // Receive registration data.
    $data = admin_input();

    $name = trim((string) ($data['full_name'] ?? ''));
    $email = trim((string) ($data['email'] ?? ''));
    $username = trim((string) ($data['user_id'] ?? ''));
    $password = (string) ($data['password'] ?? '');

    // Validate registration details.
    if (
        $name === '' ||
        strlen($name) > 100 ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        strlen($email) > 150 ||
        !preg_match('/^[A-Za-z0-9_.-]{3,80}$/', $username) ||
        strlen($password) < 8
    ) {
        admin_json([
            'success' => false,
            'message' => 'Enter a valid name, email, user ID and password (minimum 8 characters).'
        ], 422);
        exit;
    }

    // Check whether the email or user ID already exists.
    $existing = admin_row(
        'SELECT id FROM admin_users
         WHERE username = ? OR email = ?
         LIMIT 1',
        [$username, $email]
    );

    if ($existing) {
        admin_json([
            'success' => false,
            'message' => 'Username or email is already registered.'
        ], 409);
        exit;
    }

    // Securely hash the password.
    $passwordHash = password_hash(
        $password,
        PASSWORD_DEFAULT
    );

    // Create the admin account.
    admin_query(
        'INSERT INTO admin_users
         (full_name, email, username, password_hash, role, is_active)
         VALUES (?, ?, ?, ?, ?, ?)',
        [
            $name,
            $email,
            $username,
            $passwordHash,
            'admin',
            1
        ]
    );

    admin_json([
        'success' => true,
        'message' => 'Admin account created successfully. You can now log in.'
    ]);
    exit;

} catch (PDOException $e) {

    error_log('Admin registration database error: ' . $e->getMessage());

    admin_json([
        'success' => false,
        'message' => 'Could not create account. Check database setup.'
    ], 500);
    exit;

} catch (Throwable $e) {

    error_log('Admin registration error: ' . $e->getMessage());

    admin_json([
        'success' => false,
        'message' => 'Registration failed.'
    ], 500);
    exit;
}
