<?php
$host = "localhost";
$username = "root";
$password = ""; 
$dbname = "news_in_green";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database Connection Failed: " . $conn->connect_error]));
}
?>