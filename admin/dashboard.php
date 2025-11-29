<?php
require_once '../includes/funciones.php';
proteger_panel();
require_once '../includes/config.php';

$mensaje_exito = '';
$mensaje_error = '';

// Detectar mensajes de éxito/error
if (!empty($_GET['success']) && $_GET['success'] === 'turno_eliminado') {
    $mensaje_exito = '✓ Turno eliminado exitosamente';
}
if (!empty($_GET['error'])) {
    $mensaje_error = '✗ Error: ' . htmlspecialchars($_GET['error']);
}

// Obtener filtro de búsqueda
$search = trim($_GET['search'] ?? '');
$search_param = '%' . $search . '%';

// Consultar turnos
if ($search) {
    $sql = "SELECT * FROM turnos WHERE cliente LIKE ? OR email LIKE ? ORDER BY fecha DESC, hora DESC";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('ss', $search_param, $search_param);
} else {
    $sql = "SELECT * FROM turnos ORDER BY fecha DESC, hora DESC";
    $stmt = $conexion->prepare($sql);
}

$stmt->execute();
$resultado = $stmt->get_result();
$turnos = $resultado->fetch_all(MYSQLI_ASSOC);
$stmt->close();

$total_turnos = count($turnos);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Administrativo - Turnos</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        body { font-family: Arial, sans-serif; background: #1f5e2cff; margin: 0; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header-info { font-size: 14px; color: #ccc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .toolbar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        input[type="text"], input[type="search"] { padding: 10px; border: 1px solid #ddd; border-radius: 4px; flex: 1; min-width: 200px; }
        .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; text-decoration: none; display: inline-block; }
        .btn-primary { background: #4CAF50; color: white; }
        .btn-primary:hover { background: #45a049; }
        .btn-secondary { background: #008CBA; color: white; }
        .btn-secondary:hover { background: #007399; }
        .btn-logout { background: #ff6b6b; color: white; }
        .btn-logout:hover { background: #ee5a52; }
        .alert { padding: 15px; margin-bottom: 20px; border-radius: 4px; }
        .alert-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .alert-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .table-wrapper { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #030000ff; color: white; padding: 12px; text-align: left; font-weight: bold; }
        td { padding: 12px; border-bottom: 1px solid #080404ff; color: black; }
        tr:hover { background: #f9f9f9; }
        tr:nth-child(even) { background: #f5f5f5; }
        .actions { display: flex; gap: 8px; }
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .btn-edit { background: #ffc107; color: black; }
        .btn-edit:hover { background: #ffb300; }
        .btn-delete { background: #f44336; color: white; }
        .btn-delete:hover { background: #da190b; }
        .empty-state { text-align: center; padding: 40px; color: #999; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .stat-number { font-size: 32px; font-weight: bold; color: #4CAF50; }
        .stat-label { color: #999; font-size: 14px; margin-top: 5px; }
        .hide-id { display: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <h1>🏪 Panel Administrativo - Turnos</h1>
                <div class="header-info">Bienvenido, <strong><?php echo htmlspecialchars($_SESSION['usuario']); ?></strong></div>
            </div>
            <form action="logout.php" method="POST" style="margin: 0;">
                <button type="submit" class="btn btn-logout">Cerrar Sesión</button>
            </form>
        </div>
        
        <?php if (!empty($mensaje_exito)): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($mensaje_exito); ?></div>
        <?php endif; ?>
        
        <?php if (!empty($mensaje_error)): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($mensaje_error); ?></div>
        <?php endif; ?>
        
        <!-- Estadísticas -->
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number"><?php echo $total_turnos; ?></div>
                <div class="stat-label">Total de Turnos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php 
                    $hoy = date('Y-m-d');
                    $turnos_hoy = count(array_filter($turnos, function($t) use ($hoy) { 
                        return $t['fecha'] === $hoy; 
                    }));
                    echo $turnos_hoy;
                ?></div>
                <div class="stat-label">Turnos Hoy</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php 
                    $efectivo = count(array_filter($turnos, function($t) { 
                        return $t['pago'] === 'efectivo'; 
                    }));
                    echo $efectivo;
                ?></div>
                <div class="stat-label">Pagos en Efectivo</div>
            </div>
        </div>
        
        <!-- Toolbar -->
        <div class="toolbar">
            <input type="search" id="searchInput" placeholder="🔍 Buscar por nombre o email..." value="<?php echo htmlspecialchars($search); ?>">
            <a href="agregar.php" class="btn btn-primary">+ Agregar Turno</a>
            <button class="btn btn-secondary" onclick="document.location = '?'">🔄 Limpiar Búsqueda</button>
        </div>
        
        <!-- Tabla de turnos -->
        <div class="table-wrapper">
            <?php if ($total_turnos > 0): ?>
            <table>
                <thead>
                    <tr>
                        <th class="hide-id">ID</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Email</th>
                        <th>Servicio</th>
                        <th>Barbero</th>
                        <th>Pago</th>
                        <th>Duración</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($turnos as $turno): ?>
                    <tr>
                        <td class="hide-id"><?php echo $turno['id']; ?></td>
                        <td><?php echo $turno['fecha']; ?></td>
                        <td><?php echo substr($turno['hora'], 0, 5); ?></td>
                        <td><?php echo htmlspecialchars($turno['cliente']); ?></td>
                        <td><?php echo htmlspecialchars($turno['email'] ?? '-'); ?></td>
                        <td><?php echo htmlspecialchars($turno['servicio']); ?></td>
                        <td><?php echo htmlspecialchars($turno['barbero'] ?? '-'); ?></td>
                        <td><?php echo htmlspecialchars($turno['pago'] ?? '-'); ?></td>
                        <td><?php echo intval($turno['duracionMinutos']) > 0 ? $turno['duracionMinutos'] . ' min' : '-'; ?></td>
                        <td>
                            <div class="actions">
                                <a href="editar.php?id=<?php echo $turno['id']; ?>" class="btn btn-sm btn-edit">✏️ Editar</a>
                                <a href="eliminar.php?id=<?php echo $turno['id']; ?>" class="btn btn-sm btn-delete" onclick="return confirm('¿Seguro que deseas eliminar este turno?');">🗑️ Eliminar</a>
                            </div>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php else: ?>
            <div class="empty-state">
                <h3>📭 No hay turnos registrados</h3>
                <p><?php echo $search ? 'No se encontraron turnos que coincidan con tu búsqueda.' : 'Comienza a agregar turnos usando el botón de arriba.'; ?></p>
                <a href="agregar.php" class="btn btn-primary">+ Agregar Primer Turno</a>
            </div>
            <?php endif; ?>
        </div>
    </div>
    
    <script>
        // Búsqueda en vivo
        document.getElementById('searchInput').addEventListener('keyup', function(e) {
            const search = this.value.trim();
            if (search.length > 0) {
                window.location = '?search=' + encodeURIComponent(search);
            }
        });
    </script>
</body>
</html>
