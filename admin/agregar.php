<?php
require_once '../includes/funciones.php';
proteger_panel();
require_once '../includes/config.php';

$mensaje = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $cliente       = trim($_POST['cliente'] ?? '');
    $telefono      = trim($_POST['telefono'] ?? '');
    $servicio      = trim($_POST['servicio'] ?? '');
    $fecha         = trim($_POST['fecha'] ?? '');
    $hora          = trim($_POST['hora'] ?? '');
    $barbero       = trim($_POST['barbero'] ?? '');
    $pago          = trim($_POST['pago'] ?? '');
    $duracionMin   = 0;

    if (!$cliente || !$telefono || !$servicio || !$fecha || !$hora || !$barbero || !$pago) {
        $error = 'Por favor completa todos los campos requeridos.';
    } else {
        $telefono_digits = preg_replace('/[^0-9]/', '', $telefono);
        if (strlen($telefono_digits) < 7) {
            $error = 'Teléfono inválido.';
        } elseif (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            $error = 'La fecha debe estar en formato YYYY-MM-DD.';
        } elseif (!preg_match('/^\d{2}:\d{2}$/', $hora)) {
            $error = 'La hora debe estar en formato HH:MM.';
        }
    }

    if (empty($error) && $_SERVER['REQUEST_METHOD'] === 'POST') {
        try {
            $today = new DateTime('today');
            $today->setTime(0,0,0);
            $maxDate = new DateTime('today');
            $maxDate->modify('+2 days');
            $maxDate->setTime(0,0,0);
            $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);
            if ($fechaObj) $fechaObj->setTime(0,0,0);
            
            if (!$fechaObj || $fechaObj < $today || $fechaObj > $maxDate) {
                throw new Exception('Solo puedes reservar desde hoy hasta 2 días después.');
            }

            $servicioNorm = preg_replace('/\s+/', ' ', str_replace(['-', '+'], ' ', trim(mb_strtolower($servicio, 'UTF-8'))));
            $allowedServices = ['corte barba' => 90, 'corte color' => 120, 'corte' => 30];
            $duracionMin = 60;
            $servicioStandard = $servicio;
            
            foreach ($allowedServices as $key => $dur) {
                if ($servicioNorm === $key) {
                    $duracionMin = $dur;
                    $servicioStandard = ucfirst(str_replace(['barba', 'color'], ['Barba', 'Color'], $key));
                    break;
                }
            }
            $servicio = $servicioStandard;
            $parts = explode(':', $hora);
            $startMin = intval($parts[0]) * 60 + intval($parts[1]);
            $stmtCheck = $conexion->prepare("SELECT hora, duracionMinutos FROM turnos WHERE fecha = ? AND barbero = ?");
            if ($stmtCheck) {
                $stmtCheck->bind_param('ss', $fecha, $barbero);
                $stmtCheck->execute();
                $resCheck = $stmtCheck->get_result();
                while ($r = $resCheck->fetch_assoc()) {
                    $p = explode(':', substr($r['hora'],0,5));
                    $existStart = intval($p[0]) * 60 + intval($p[1]);
                    $existDur = intval($r['duracionMinutos']) > 0 ? intval($r['duracionMinutos']) : 60;
                    $existEnd = $existStart + $existDur;

                    $newStart = $startMin;
                    $newEnd = $startMin + $duracionMin;
                    if ($newStart < $existEnd && $existStart < $newEnd) {
                        throw new Exception('Horario no disponible: conflicto con otro turno');
                    }
                }
                $stmtCheck->close();
            }

            $stmt = $conexion->prepare("INSERT INTO turnos (cliente, telefono, servicio, fecha, hora, barbero, pago, duracionMinutos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            if (!$stmt) {
                throw new Exception("Error en preparación: " . $conexion->error);
            }

            $stmt->bind_param('sssssssi', $cliente, $telefono, $servicio, $fecha, $hora, $barbero, $pago, $duracionMin);

            if ($stmt->execute()) {
                $mensaje = 'Turno agregado exitosamente (ID: ' . $stmt->insert_id . ')';
                $_POST = [];
            } else {
                throw new Exception("Error al insertar: " . $stmt->error);
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
    <title>Agregar Turno</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        body { font-family: Arial, sans-serif; background: #460d0dff; margin: 0; padding: 20px; }
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
        .back-link { display: inline-block; margin-top: 20px; color: #008CBA; text-decoration: none; }
        .back-link:hover { text-decoration: underline; }
        
        /* Estilos para horarios */
        .horarios-wrapper { width: 100%; }
        .horarios-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; padding: 10px; background: #f5f5f5; border-radius: 4px; min-height: 100px; }
        .horario-btn { padding: 12px 8px; border: 2px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s; text-align: center; }
        .horario-btn:hover:not(:disabled) { background: #e3f2fd; border-color: #2196F3; transform: translateY(-2px); }
        .horario-btn:disabled { background: #f0f0f0; color: #999; cursor: not-allowed; opacity: 0.6; }
        .horario-btn.selected { background: #4CAF50; color: white; border-color: #4CAF50; }
        .placeholder-text { color: #999; text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>➕ Agregar Nuevo Turno</h2>
        
        <?php if (!empty($mensaje)): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($mensaje); ?></div>
        <?php endif; ?>
        
        <?php if (!empty($error)): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <form method="POST">
            <div class="form-group">
                <label for="cliente">Nombre y Apellido *</label>
                <input type="text" id="cliente" name="cliente" value="<?php echo htmlspecialchars($_POST['cliente'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="telefono">Teléfono *</label>
                <input type="tel" id="telefono" name="telefono" value="<?php echo htmlspecialchars($_POST['telefono'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="servicio">Servicio *</label>
                <select id="servicio" name="servicio" required>
                    <option value="">Selecciona un servicio</option>
                    <option value="corte" <?php echo ($_POST['servicio'] ?? '') === 'corte' ? 'selected' : ''; ?>>Corte (30 min)</option>
                    <option value="corte-barba" <?php echo ($_POST['servicio'] ?? '') === 'corte-barba' ? 'selected' : ''; ?>>Corte + Barba (90 min)</option>
                    <option value="corte-color" <?php echo ($_POST['servicio'] ?? '') === 'corte-color' ? 'selected' : ''; ?>>Corte + Color (120 min)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="fecha">Fecha *</label>
                <input type="date" id="fecha" name="fecha" value="<?php echo htmlspecialchars($_POST['fecha'] ?? ''); ?>" required>
            </div>
            
            <div class="form-group">
                <label for="hora">Horarios disponibles *</label>
                <input type="hidden" id="hora" name="hora" value="<?php echo htmlspecialchars($_POST['hora'] ?? ''); ?>">
                <div class="horarios-wrapper">
                    <div id="horariosContainer" class="horarios-container" data-horarios-seleccionados=""></div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="barbero">Barbero *</label>
                <select id="barbero" name="barbero" required>
                    <option value="">Selecciona un barbero</option>
                    <option value="samuel" <?php echo ($_POST['barbero'] ?? '') === 'samuel' ? 'selected' : ''; ?>>Samuel Barroso (Barbero y Tatuador)</option>
                    <option value="ale" <?php echo ($_POST['barbero'] ?? '') === 'ale' ? 'selected' : ''; ?>>Ale Alegría (Barbero)</option>
                    <option value="alexis" <?php echo ($_POST['barbero'] ?? '') === 'alexis' ? 'selected' : ''; ?>>Alexis (Barbero)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="pago">Método de Pago *</label>
                <select id="pago" name="pago" required>
                    <option value="">Selecciona un método</option>
                    <option value="efectivo" <?php echo ($_POST['pago'] ?? '') === 'efectivo' ? 'selected' : ''; ?>>Efectivo</option>
                    <option value="transferencia" <?php echo ($_POST['pago'] ?? '') === 'transferencia' ? 'selected' : ''; ?>>Transferencia</option>
                </select>
            </div>
            
            <input type="hidden" id="duracionMinutos" name="duracionMinutos" value="<?php echo htmlspecialchars($_POST['duracionMinutos'] ?? ''); ?>">
            
            <div class="btn-group">
                <button type="submit" class="btn-guardar">Guardar Turno</button>
                <a href="dashboard.php" class="btn-volver" style="display: flex; align-items: center; justify-content: center; text-decoration: none;">Volver</a>
            </div>
        </form>
    <script src="../js/script.js?v=2.0"></script>
    <script>
    // Configurar input de fecha: desde hoy hasta 2 días después
    document.addEventListener('DOMContentLoaded', function() {
        const inputFecha = document.getElementById("fecha");
        if (inputFecha) {
            const hoy = new Date();
            const minStr = hoy.toISOString().split("T")[0];
            const max = new Date(hoy);
            max.setDate(hoy.getDate() + 2);
            const maxStr = max.toISOString().split("T")[0];
            
            inputFecha.min = minStr;
            inputFecha.max = maxStr;
            inputFecha.value = minStr; // Establecer hoy por defecto
        }
        
        // Renderizar horarios al cambiar servicio, fecha o barbero
        ['servicio','fecha','barbero'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('change', function() {
                    if (typeof renderizarHorarios === 'function') {
                        renderizarHorarios();
                    }
                });
            }
        });
        
        // Observar cambios en el dataset del contenedor de horarios
        const container = document.getElementById('horariosContainer');
        if (container) {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'data-horarios-seleccionados') {
                        const horario = container.dataset.horariosSeleccionados;
                        const horaInput = document.getElementById('hora');
                        if (horaInput && horario) {
                            horaInput.value = horario;
                        }
                    }
                });
            });
            observer.observe(container, { attributes: true });
        }
        
        // Mensaje inicial en el contenedor de horarios
        if (container) {
            container.innerHTML = '<p class="placeholder-text">Selecciona servicio, fecha y barbero para ver horarios disponibles</p>';
        }
    });
    </script>
    </div>
</body>
</html>
