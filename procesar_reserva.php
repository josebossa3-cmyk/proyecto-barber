<?php
header('Content-Type: application/json; charset=utf-8');

try {
    require_once 'includes/config.php';
    
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    
    if (!is_array($data) || empty($data)) {
        $data = $_POST;
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Método HTTP no permitido'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $nombre    = trim($data['nombre'] ?? '');
    $apellido  = trim($data['apellido'] ?? '');
    $email     = trim($data['email'] ?? '');
    $servicio  = trim($data['servicio'] ?? '');
    $fecha_iso = trim($data['fecha_iso'] ?? '');
    $horario   = trim($data['horario'] ?? '');
    $barbero   = trim($data['barbero'] ?? '');
    $pago      = trim($data['pago'] ?? '');
    $durMin    = intval($data['duracionMinutos'] ?? 0);
    
    $errores = [];
    if (empty($nombre)) $errores[] = 'nombre';
    if (empty($apellido)) $errores[] = 'apellido';
    if (empty($email)) $errores[] = 'email';
    if (empty($servicio)) $errores[] = 'servicio';
    if (empty($fecha_iso)) $errores[] = 'fecha_iso';
    if (empty($horario)) $errores[] = 'horario';
    if (empty($barbero)) $errores[] = 'barbero';
    if (empty($pago)) $errores[] = 'pago';
    
    if (!empty($errores)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Faltan campos requeridos', 'campos_faltantes' => $errores], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email inválido'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_iso)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Formato de fecha inválido'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    if (!preg_match('/^\d{2}:\d{2}$/', $horario)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Formato de hora inválido'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $cliente = $nombre . ' ' . $apellido;
    
    $stmt = $conexion->prepare("INSERT INTO turnos (cliente, email, servicio, fecha, hora, barbero, pago, duracionMinutos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error en la consulta'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $stmt->bind_param('sssssssi', $cliente, $email, $servicio, $fecha_iso, $horario, $barbero, $pago, $durMin);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(['success' => true, 'id_turno' => $stmt->insert_id, 'mensaje' => 'Turno registrado exitosamente'], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al insertar'], JSON_UNESCAPED_UNICODE);
    }
    
    $stmt->close();
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno'], JSON_UNESCAPED_UNICODE);
}

exit();
?>
