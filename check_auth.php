<?php
require_once '../db.php';
session_start();

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    try {
        $stmt = $pdo->prepare('SELECT id, name, email, is_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode([
                'success' => true,
                'user' => $user
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'Пользователь не найден'
            ]);
        }
    } catch(PDOException $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Ошибка при проверке авторизации'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Не авторизован'
    ]);
}
?> 