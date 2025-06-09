<?php
require_once '../db.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    echo json_encode([
        'success' => false,
        'error' => 'Доступ запрещен'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['request_id']) || !isset($data['status'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Необходимо указать ID запроса и статус'
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare('UPDATE requests SET status = ? WHERE id = ?');
    $stmt->execute([$data['status'], $data['request_id']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Запрос не найден'
        ]);
    }
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при обновлении статуса запроса'
    ]);
}
?> 