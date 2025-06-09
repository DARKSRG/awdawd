<?php
require_once '../db.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Необходимо авторизоваться'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['program_id'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Необходимо указать ID программы'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare('INSERT INTO requests (user_id, program_id) VALUES (?, ?)');
    $stmt->execute([$_SESSION['user_id'], $data['program_id']]);
    
    echo json_encode([
        'success' => true,
        'request_id' => $pdo->lastInsertId()
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при создании запроса'
    ]);
}
?> 