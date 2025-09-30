<?php
include '../config/database.php';
header('Content-Type: application/json');

try {
    $id = $_POST['id'] ?? null;
    $placa = $_POST['placa'];
    $tipo_unidad = $_POST['tipo_unidad'];
    $encargado = $_POST['encargado'];
    $tripulantes = $_POST['tripulantes'];
    $estado = $_POST['estado'];
    $lat = $_POST['unitLat'] ?? null;
    $lng = $_POST['unitLng'] ?? null;
    
    if ($id) {
        // Actualizar
        $stmt = $pdo->prepare("UPDATE unidades SET placa=?, tipo_unidad=?, encargado=?, tripulantes=?, estado=?, lat=?, lng=? WHERE id=?");
        $stmt->execute([$placa, $tipo_unidad, $encargado, $tripulantes, $estado, $lat, $lng, $id]);
    } else {
        // Insertar
        $stmt = $pdo->prepare("INSERT INTO unidades (placa, tipo_unidad, encargado, tripulantes, estado, lat, lng) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$placa, $tipo_unidad, $encargado, $tripulantes, $estado, $lat, $lng]);
    }
    
    echo json_encode(['success' => true]);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>