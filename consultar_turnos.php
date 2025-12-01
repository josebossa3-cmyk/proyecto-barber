<?php
header('Content-Type: application/json; charset=utf-8');

try {
    require_once 'includes/config.php';

    $fecha_iso = trim($_GET['fecha_iso'] ?? $_POST['fecha_iso'] ?? '');
    $barbero = trim($_GET['barbero'] ?? $_POST['barbero'] ?? '');

    if (empty($fecha_iso) || empty($barbero)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Parámetros faltantes']);
        exit();
    }

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_iso)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Formato de fecha inválido']);
        exit();
    }

    $stmt = $conexion->prepare("SELECT hora, duracionMinutos FROM turnos WHERE fecha = ? AND barbero = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error en la consulta']);
        exit();
    }

    $stmt->bind_param('ss', $fecha_iso, $barbero);
    $stmt->execute();
    $res = $stmt->get_result();
    $turnos = [];
    while ($r = $res->fetch_assoc()) {
        $turnos[] = [
            'hora' => substr($r['hora'], 0, 5),
            'duracionMinutos' => intval($r['duracionMinutos']) > 0 ? intval($r['duracionMinutos']) : 60,
        ];
    }

    echo json_encode(['success' => true, 'turnos' => $turnos]);
    exit();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error interno']);
    exit();
}
?>