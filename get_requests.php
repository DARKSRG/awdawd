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

try {
    if ($_SESSION['is_admin']) {
        // Для админа показываем все запросы
        $stmt = $pdo->query('
            SELECT r.*, u.name as user_name, p.name as program_name 
            FROM requests r 
            JOIN users u ON r.user_id = u.id 
            JOIN programs p ON r.program_id = p.id 
            ORDER BY r.created_at DESC
        ');
    } else {
        // Для обычного пользователя показываем только его запросы
        $stmt = $pdo->prepare('
            SELECT r.*, p.name as program_name 
            FROM requests r 
            JOIN programs p ON r.program_id = p.id 
            WHERE r.user_id = ? 
            ORDER BY r.created_at DESC
        ');
        $stmt->execute([$_SESSION['user_id']]);
    }
    
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'requests' => $requests
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при получении списка запросов'
    ]);
}
?> 