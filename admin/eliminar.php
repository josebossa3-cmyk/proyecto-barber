<?php
require_once '../includes/funciones.php';
proteger_panel();
require_once '../includes/config.php';

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    header('Location: dashboard.php');
    exit();
}

try {
    // Verificar que el turno existe antes de eliminar
    $stmt_check = $conexion->prepare("SELECT id FROM turnos WHERE id = ?");
    if ($stmt_check) {
        $stmt_check->bind_param('i', $id);
        $stmt_check->execute();
        $resultado = $stmt_check->get_result();
        
        if ($resultado->num_rows === 0) {
            header('Location: dashboard.php?error=turno_no_encontrado');
            exit();
        }
        $stmt_check->close();
    }
    
    // Eliminar el turno
    $stmt = $conexion->prepare("DELETE FROM turnos WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Error en preparación: " . $conexion->error);
    }
    
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        throw new Exception("Error al eliminar: " . $stmt->error);
    }
    
    $stmt->close();
    header('Location: dashboard.php?success=turno_eliminado');
    exit();
    
} catch (Exception $e) {
    header('Location: dashboard.php?error=' . urlencode($e->getMessage()));
    exit();
}
