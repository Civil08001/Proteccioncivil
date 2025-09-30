<?php
include '../config/database.php';
header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM unidades ORDER BY id DESC");
    $units = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($units);
} catch(PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>