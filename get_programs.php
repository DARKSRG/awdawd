<?php
require_once '../db.php';
session_start();

header('Content-Type: application/json');

try {
    $stmt = $pdo->query('SELECT * FROM programs ORDER BY name');
    $programs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'programs' => $programs
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Ошибка при получении списка программ'
    ]);
}
?> 