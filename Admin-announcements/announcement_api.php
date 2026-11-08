<?php
// announcements_api.php
// GET    -> list all announcements
// POST   -> create   (JSON: {title,type,category})
// DELETE -> remove   (?id=5)
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/db.php';

// TODO: admin login check here, e.g.
// session_start(); if (empty($_SESSION['is_admin'])) { http_response_code(403); echo json_encode(['error'=>'Forbidden']); exit; }

$method = $_SERVER['REQUEST_METHOD'];
$allowedTypes      = ['Featured', 'Breaking'];
$allowedCategories = ['Academic', 'Events', 'Sports', 'General'];

try {
    if ($method === 'GET') {
        $rows = $pdo->query(
            "SELECT id, title, type, category FROM announcements ORDER BY id DESC"
        )->fetchAll();
        echo json_encode($rows);

    } elseif ($method === 'POST') {
        $data     = json_decode(file_get_contents('php://input'), true) ?? [];
        $title    = trim($data['title'] ?? '');
        $type     = $data['type'] ?? '';
        $category = $data['category'] ?? '';

        if ($title === '' || mb_strlen($title) > 140
            || !in_array($type, $allowedTypes, true)
            || !in_array($category, $allowedCategories, true)) {
            http_response_code(422);
            echo json_encode(['error' => 'Invalid input']);
            exit;
        }

        $stmt = $pdo->prepare(
            "INSERT INTO announcements (title, type, category) VALUES (?, ?, ?)"
        );
        $stmt->execute([$title, $type, $category]);
        http_response_code(201);
        echo json_encode(['id' => (int)$pdo->lastInsertId()]);

    } elseif ($method === 'DELETE') {
        $id = (int)($_GET['id'] ?? 0);
        if ($id <= 0) {
            http_response_code(422);
            echo json_encode(['error' => 'Invalid id']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM announcements WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['deleted' => $stmt->rowCount()]);

    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}