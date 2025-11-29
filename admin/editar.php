<?php
require_once '../includes/funciones.php';
proteger_panel();
require_once '../includes/config.php';

$id = intval($_GET['id'] ?? 0);
if (!$id) {
    header('Location: dashboard.php');
    exit();
}

$mensaje = '';
$error = '';
$turno = null;

// Obtener datos del turno
try {
    $stmt = $conexion->prepare("SELECT * FROM turnos WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Error en preparación: " . $conexion->error);
    }
    
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $turno = $resultado->fetch_assoc();
    $stmt->close();
    
    if (!$turno) {
        header('Location: dashboard.php');
        exit();
    }
} catch (Exception $e) {
    $error = 'Error al obtener el turno: ' . $e->getMessage();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente       = trim($_POST['cliente'] ?? '');
    $email         = trim($_POST['email'] ?? '');
    $servicio      = trim($_POST['servicio'] ?? '');
    $fecha         = trim($_POST['fecha'] ?? '');
    $hora          = trim($_POST['hora'] ?? '');
    $barbero       = trim($_POST['barbero'] ?? '');
    $pago          = trim($_POST['pago'] ?? '');
    $duracionMin   = intval($_POST['duracionMinutos'] ?? 0);

    // Validar campos requeridos
    if (!$cliente || !$email || !$servicio || !$fecha || !$hora || !$barbero || !$pago) {
        $error = 'Por favor completa todos los campos requeridos.';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'El email no es válido.';
    } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        $error = 'La fecha debe estar en formato YYYY-MM-DD.';
    } elseif (!preg_match('/^\d{2}:\d{2}$/', $hora)) {
        $error = 'La hora debe estar en formato HH:MM.';
    } else {
        // Actualizar turno
        try {
            $stmt = $conexion->prepare("UPDATE turnos SET cliente=?, email=?, servicio=?, fecha=?, hora=?, barbero=?, pago=?, duracionMinutos=? WHERE id=?");
            if (!$stmt) {
                throw new Exception("Error en preparación: " . $conexion->error);
            }
            
            $stmt->bind_param('sssssssii', $cliente, $email, $servicio, $fecha, $hora, $barbero, $pago, $duracionMin, $id);
            
            if ($stmt->execute()) {
                $mensaje = 'Turno actualizado exitosamente.';
                // Actualizar turno en sesión para que se vea en el formulario
                $turno = [
                    'id' => $id,
                    'cliente' => $cliente,
                    'email' => $email,
                    'servicio' => $servicio,
                    'fecha' => $fecha,
                    'hora' => $hora,
                    'barbero' => $barbero,
                    'pago' => $pago,
                    'duracionMinutos' => $duracionMin
                ];
            } else {
                throw new Exception("Error al actualizar: " . $stmt->error);
            }
            
            $stmt->close();
        } catch (Exception $e) {
            $error = 'Error: ' . $e->getMessage();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editar Turno</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h2 { color: #333; margin-top: 0; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
        input, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-family: inherit; }
        input:focus, select:focus { outline: none; border-color: #4CAF50; }
        .btn-group { display: flex; gap: 10px; margin-top: 20px; }
        button { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .btn-guardar { background: #4CAF50; color: white; flex: 1; }
        .btn-guardar:hover { background: #45a049; }
        .btn-volver { background: #008CBA; color: white; flex: 1; }
        .btn-volver:hover { background: #007399; }
        .alert { padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .turno-id { color: #999; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>✏️ Editar Turno <span class="turno-id">(ID: <?php echo $id; ?>)</span></h2>
        
        <?php if (!empty($mensaje)): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($mensaje); ?></div>
        <?php endif; ?>
        
        <?php if (!empty($error)): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <?php if ($turno): ?>
        <form method="POST">
            <div class="form-group">
                <label for="cliente">Nombre y Apellido *</label>
                <input type="text" id="cliente" name="cliente" value="<?php echo htmlspecialchars($turno['cliente']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" name="email" value="<?php echo htmlspecialchars($turno['email'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="servicio">Servicio *</label>
                <select id="servicio" name="servicio" required>
                    <option value="">Selecciona un servicio</option>
                    <option value="Corte" <?php echo $turno['servicio'] === 'Corte' ? 'selected' : ''; ?>>Corte (30 min)</option>
                    <option value="Corte + Barba" <?php echo $turno['servicio'] === 'Corte + Barba' ? 'selected' : ''; ?>>Corte + Barba (90 min)</option>
                    <option value="Corte + Color" <?php echo $turno['servicio'] === 'Corte + Color' ? 'selected' : ''; ?>>Corte + Color (120 min)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="fecha">Fecha *</label>
                <input type="date" id="fecha" name="fecha" value="<?php echo htmlspecialchars($turno['fecha']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="hora">Hora *</label>
                <input type="time" id="hora" name="hora" value="<?php echo htmlspecialchars($turno['hora']); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="barbero">Barbero *</label>
                <select id="barbero" name="barbero" required>
                    <option value="">Selecciona un barbero</option>
                    <option value="Carlos" <?php echo $turno['barbero'] === 'Carlos' ? 'selected' : ''; ?>>Carlos</option>
                    <option value="Juan" <?php echo $turno['barbero'] === 'Juan' ? 'selected' : ''; ?>>Juan</option>
                    <option value="Diego" <?php echo $turno['barbero'] === 'Diego' ? 'selected' : ''; ?>>Diego</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="pago">Método de Pago *</label>
                <select id="pago" name="pago" required>
                    <option value="">Selecciona un método</option>
                    <option value="efectivo" <?php echo $turno['pago'] === 'efectivo' ? 'selected' : ''; ?>>Efectivo</option>
                    <option value="transferencia" <?php echo $turno['pago'] === 'transferencia' ? 'selected' : ''; ?>>Transferencia</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="duracionMinutos">Duración (minutos)</label>
                <input type="number" id="duracionMinutos" name="duracionMinutos" value="<?php echo htmlspecialchars($turno['duracionMinutos'] ?? '0'); ?>" min="0">
            </div>
            
            <div class="btn-group">
                <button type="submit" class="btn-guardar">Guardar Cambios</button>
                <a href="dashboard.php" class="btn-volver" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">Volver</a>
            </div>
        </form>
        <?php endif; ?>
    </div>
</body>
</html>
