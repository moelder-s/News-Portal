
<?php

header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "success" => false,
        "message" => "Invalid request method."
    ]);
    exit;
}

require "db.php";

// Receive data from JavaScript
$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);
    exit;
}

$name = trim($data["name"] ?? "");
$email = strtolower(trim($data["email"] ?? ""));
$password = $data["password"] ?? "";
$confirm = $data["confirm"] ?? "";

// Validate fields
if ($name === "" || strlen($name) > 100) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid full name."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email."
    ]);
    exit;
}

if (strlen($password) < 8) {
    echo json_encode([
        "success" => false,
        "message" => "Password must contain at least 8 characters."
    ]);
    exit;
}

if ($password !== $confirm) {
    echo json_encode([
        "success" => false,
        "message" => "Passwords do not match."
    ]);
    exit;
}

try {

    // Encrypt password using a secure hash
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert new user
    $sql = "INSERT INTO users (full_name, email, password)
            VALUES (:name, :email, :password)";

    $stmt = $conn->prepare($sql);

    $stmt->execute([
        ":name" => $name,
        ":email" => $email,
        ":password" => $hashedPassword
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Registration successful!"
    ]);

} catch (PDOException $e) {

    if ($e->getCode() === "23000") {
        http_response_code(409);

        echo json_encode([
            "success" => false,
            "message" => "This email is already registered."
        ]);

    } else {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Registration failed. Please try again."
        ]);
    }
}

?>
