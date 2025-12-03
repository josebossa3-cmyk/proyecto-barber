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
    $telefono  = trim($data['telefono'] ?? '');
    $servicio  = trim($data['servicio'] ?? '');
    $fecha_iso = trim($data['fecha_iso'] ?? '');
    $horario   = trim($data['horario'] ?? '');
    $barbero   = trim($data['barbero'] ?? '');
    $pago      = trim($data['pago'] ?? '');
    $durMin    = 0;
    
    $errores = [];
    if (empty($nombre)) $errores[] = 'nombre';
    if (empty($apellido)) $errores[] = 'apellido';
    if (empty($telefono)) $errores[] = 'telefono';
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
    
    $telefono_digits = preg_replace('/[^0-9]/', '', $telefono);
    if (strlen($telefono_digits) < 7) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Teléfono inválido'], JSON_UNESCAPED_UNICODE);
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

    $today = new DateTime('today');
    $today->setTime(0,0,0);
    $maxDate = new DateTime('today');
    $maxDate->modify('+2 days');
    $maxDate->setTime(0,0,0);
    $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha_iso);
    if ($fechaObj) $fechaObj->setTime(0,0,0);
    
    if (!$fechaObj || $fechaObj < $today || $fechaObj > $maxDate) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Solo puedes reservar desde hoy hasta 2 días después'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $servicioNorm = preg_replace('/\s+/', ' ', str_replace(['-', '+'], ' ', trim(mb_strtolower($servicio, 'UTF-8'))));
    $allowedServices = ['corte barba' => 90, 'corte color' => 120, 'corte' => 30];
    $durMin = 60;
    $servicioStandard = $servicio;
    
    foreach ($allowedServices as $key => $dur) {
        if ($servicioNorm === $key) {
            $durMin = $dur;
            $servicioStandard = ucfirst(str_replace(['barba', 'color'], ['Barba', 'Color'], $key));
            break;
        }
    }
    $servicio = $servicioStandard;

    $horarioParts = explode(':', $horario);
    if (count($horarioParts) !== 2 || !is_numeric($horarioParts[0]) || !is_numeric($horarioParts[1])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Formato de hora inválido'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    $hh = intval($horarioParts[0]);
    $mm = intval($horarioParts[1]);
    if ($hh < 0 || $hh > 23 || $mm < 0 || $mm > 59) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Hora fuera de rango válido'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    $startMin = $hh * 60 + $mm;
    $openMin = 9 * 60;
    $closeMin = 21 * 60;
    if ($startMin < $openMin || ($startMin + $durMin) > $closeMin) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Horario no disponible para la duración seleccionada'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    try {
        $stmtCheck = $conexion->prepare("SELECT hora, duracionMinutos FROM turnos WHERE fecha = ? AND barbero = ?");
        if ($stmtCheck) {
            $stmtCheck->bind_param('ss', $fecha_iso, $barbero);
            $stmtCheck->execute();
            $resCheck = $stmtCheck->get_result();
            
            while ($r = $resCheck->fetch_assoc()) {
                $parts = explode(':', substr($r['hora'],0,5));
                $existStart = intval($parts[0]) * 60 + intval($parts[1]);
                $existDur = intval($r['duracionMinutos']) > 0 ? intval($r['duracionMinutos']) : 60;
                $existEnd = $existStart + $existDur;
                $newStart = $startMin;
                $newEnd = $startMin + $durMin;

                if ($newStart < $existEnd && $existStart < $newEnd) {
                    http_response_code(409);
                    echo json_encode(['success' => false, 'error' => 'Horario no disponible: conflicto con otro turno'], JSON_UNESCAPED_UNICODE);
                    exit();
                }
            }
            $stmtCheck->close();
        }
    } catch (Exception $e) {
    }
    
    $barberosPermitidos = ['samuel', 'ale', 'alexis'];
    if (!in_array(mb_strtolower($barbero, 'UTF-8'), $barberosPermitidos, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Barbero no válido'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $pagosPermitidos = ['efectivo', 'transferencia'];
    if (!in_array(mb_strtolower($pago, 'UTF-8'), $pagosPermitidos, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Método de pago no válido'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $cliente = $nombre . ' ' . $apellido;
    
    $stmt = $conexion->prepare("INSERT INTO turnos (cliente, telefono, servicio, fecha, hora, barbero, pago, duracionMinutos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error en la consulta'], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $stmt->bind_param('sssssssi', $cliente, $telefono, $servicio, $fecha_iso, $horario, $barbero, $pago, $durMin);
    
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
