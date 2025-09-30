<?php
include '../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'];

try {
    $stmt = $pdo->prepare("DELETE FROM unidades WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>