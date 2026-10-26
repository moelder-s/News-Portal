<?php
header('Content-Type: application/json; charset=utf-8');

// Allow POST requests only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid request method.'
    ]);
    exit;
}

// Database connection
$conn = new mysqli('localhost', 'root', '', 'news_in_green');

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed.'
    ]);
    exit;
}

$conn->set_charset('utf8mb4');

// Get form values
$title = trim($_POST['title'] ?? '');
$category = trim($_POST['category'] ?? '');
$author = trim($_POST['author'] ?? '');
$image = trim($_POST['image'] ?? '');
$content = trim($_POST['content'] ?? '');

// Validate fields
$allowedCategories = ['Academic', 'Events', 'Sports', 'General'];

if (
    $title === '' ||
    mb_strlen($title) > 120 ||
    $author === '' ||
    mb_strlen($author) > 60 ||
    !in_array($category, $allowedCategories, true) ||
    mb_strlen($content) < 100
) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please check the form fields. Article content must contain at least 100 characters.'
    ]);
    $conn->close();
    exit;
}

// Validate optional image URL
if ($image !== '') {
    $validUrl = filter_var($image, FILTER_VALIDATE_URL);
    $scheme = strtolower(parse_url($image, PHP_URL_SCHEME) ?? '');

    if (!$validUrl || !in_array($scheme, ['http', 'https'], true)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Please enter a valid image URL.'
        ]);
        $conn->close();
        exit;
    }
}

// Save article to database
$sql = "INSERT INTO article_submissions
        (title, category, author, image_url, content)
        VALUES (?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to prepare article submission.'
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param(
    'sssss',
    $title,
    $category,
    $author,
    $image,
    $content
);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'message' => 'Article submitted successfully for review.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to save the article. Please try again.'
    ]);
}

$stmt->close();
$conn->close();


