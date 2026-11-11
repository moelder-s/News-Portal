<?php

declare(strict_types=1);

$host = "sql200.infinityfree.com";
$dbname = "if0_43363323_newsportal";
$username = "if0_43363323";
$password = "news880514";

try {
    $conn = new PDO(
        "mysql:host=$host;port=3306;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log("Database connection failed: " . $e->getMessage());

    http_response_code(500);
    header("Content-Type: application/json; charset=utf-8");

    echo json_encode([
        "success" => false,
        "message" => "Database connection failed."
    ]);

    exit;
}
