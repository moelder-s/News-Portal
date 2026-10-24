
<?php

header("Content-Type: application/json");

session_start();

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Method not allowed."
    ]);
    exit;
}

require "db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request."
    ]);
    exit;
}

$email = strtolower(trim($data["email"] ?? ""));
$password = $data["password"] ?? "";

if (!filter_var($email, FILTER_VALIDATE_EMAIL)
    || !is_string($password)
    || $password === "") {

    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Enter a valid email and password."
    ]);
    exit;
}

$sql = "SELECT id, full_name, email, password
        FROM users WHERE email = :email";

$stmt = $conn->prepare($sql);
$stmt->execute([":email" => $email]);

$user = $stmt->fetch();

if ($user && password_verify($password, $user["password"])) {

    session_regenerate_id(true);

    $_SESSION["user_id"] = $user["id"];
    $_SESSION["user_name"] = $user["full_name"];
    $_SESSION["user_email"] = $user["email"];

    echo json_encode([
        "success" => true,
        "message" => "Login successful!"
    ]);

} else {

    http_response_code(401);

    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
}

?>
