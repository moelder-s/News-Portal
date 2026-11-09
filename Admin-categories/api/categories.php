<?php
header('Content-Type: application/json');

$pdo = new PDO(
    'mysql:host=localhost;dbname=categories_db;charset=utf8mb4',
    'root',
    '',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = $_GET['id'] ?? null;
$name   = trim($body['name'] ?? '');

try {
    if ($method === 'GET') {
        $rows = $pdo->query('SELECT id, name, 0 AS articles FROM categories ORDER BY id')
                    ->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($rows);

    } elseif ($method === 'POST') {
        if ($name === '') {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            exit;
        }
        $pdo->prepare('INSERT INTO categories (name) VALUES (?)')->execute([$name]);
        http_response_code(201);
        echo json_encode(['id' => (int)$pdo->lastInsertId(), 'name' => $name, 'articles' => 0]);

    } elseif ($method === 'PUT') {
        if ($name === '' || !$id) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            exit;
        }
        $pdo->prepare('UPDATE categories SET name = ? WHERE id = ?')->execute([$name, $id]);
        echo json_encode(['ok' => true]);

    } elseif ($method === 'DELETE') {
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'id required']);
            exit;
        }
        $pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
        echo json_encode(['ok' => true]);
    }
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['error' => 'Category already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Server error']);
    }
}