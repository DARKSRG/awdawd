<?php
require_once '../db.php';
session_start();

header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Необходимо указать имя, email и пароль'
    ]);
    exit;
}

try {
    // Проверка существования email
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'error' => 'Пользователь с таким email уже существует'
        ]);
        exit;
    }

    // Создание нового пользователя
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    $stmt->execute([
        $data['name'],
        $data['email'],
        password_hash($data['password'], PASSWORD_DEFAULT)
    ]);

    $userId = $pdo->lastInsertId();
    $_SESSION['user_id'] = $userId;
    $_SESSION['is_admin'] = false;

    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $userId,
            'name' => $data['name'],
            'email' => $data['email'],
            'is_admin' => false
        ]
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при регистрации'
    ]);
}
?> 