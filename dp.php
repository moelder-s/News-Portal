<?php
$conn = new mysqli(
    "localhost",
    "root",
    "",
    "news_in_green"
);

if ($conn->connect_error) {
    die("Database connection failed!");
}

$conn->set_charset("utf8mb4");

echo "Database connected successfully!";
?>