<?php
header('Content-Type: application/json');
require_once 'db.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (isset($data['question']) && !empty(trim($data['question']))) {
    $question = trim($data['question']);

    $stmt = $conn->prepare("INSERT INTO help_questions (question) VALUES (?)");
    $stmt->bind_param("s", $question);

    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(["status" => "success", "message" => "Question submitted successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["status" => "error", "message" => "Database insert error: " . $stmt->error]);
    }
    $stmt->close();
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Question cannot be empty."]);
}

$conn->close();
?>