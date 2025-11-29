<?php
/**
 * Test del Sistema de Login - Bunker Barber Studio
 * Ejecutar: php test_login.php
 */

echo "\n╔════════════════════════════════════════════════════════════════╗\n";
echo "║             TEST DE LOGIN - SISTEMA DE RESERVAS                ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

// 1. Verificar conexión a la base de datos
echo "[1/4] Verificando conexión a la base de datos...\n";
require_once 'includes/config.php';

if ($conexion->ping()) {
    echo "✓ Conexión exitosa\n";
    echo "  - Servidor: " . $conexion->server_info . "\n";
    echo "  - Base de datos: barberia\n";
} else {
    echo "✗ Fallo en la conexión\n";
    die("Error: " . $conexion->error . "\n");
}

// 2. Verificar tabla administradores
echo "\n[2/4] Verificando tabla administradores...\n";

$resultado = $conexion->query("SELECT * FROM administradores");
if ($resultado === false) {
    echo "✗ Error al consultar la tabla\n";
    echo "  Error: " . $conexion->error . "\n";
    die();
}

$admin_count = $resultado->num_rows;
echo "✓ Tabla existe con $admin_count administrador(es)\n";

$admin = $resultado->fetch_assoc();
if ($admin) {
    echo "  - Usuario: " . htmlspecialchars($admin['usuario']) . "\n";
    echo "  - Contraseña: " . (strlen($admin['clave']) > 0 ? '***' : 'N/A') . "\n";
}

// 3. Verificar archivos necesarios
echo "\n[3/4] Verificando archivos necesarios...\n";

$archivos_requeridos = [
    'login.php' => 'Página de login',
    'procesar_login.php' => 'Procesador de login',
    'logout.php' => 'Logout',
    'procesar_reserva.php' => 'Procesador de reservas',
    'admin/dashboard.php' => 'Panel administrativo',
    'admin/agregar.php' => 'Agregar turnos',
    'admin/editar.php' => 'Editar turnos',
    'admin/eliminar.php' => 'Eliminar turnos',
    'includes/config.php' => 'Configuración DB',
    'includes/funciones.php' => 'Funciones auxiliares',
];

$archivos_ok = 0;
foreach ($archivos_requeridos as $archivo => $desc) {
    if (file_exists($archivo)) {
        echo "✓ $archivo ($desc)\n";
        $archivos_ok++;
    } else {
        echo "✗ $archivo ($desc) - NO ENCONTRADO\n";
    }
}

echo "  Resultado: $archivos_ok/" . count($archivos_requeridos) . " archivos encontrados\n";

// 4. Verificar tabla turnos
echo "\n[4/4] Verificando tabla turnos...\n";

$stmt = $conexion->prepare("DESCRIBE turnos");
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $columnas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $columnas[] = $fila['Field'];
    }
    echo "✓ Tabla turnos existe con " . count($columnas) . " columnas\n";
    echo "  Columnas: " . implode(", ", $columnas) . "\n";
} else {
    echo "✗ Error al verificar columnas\n";
}

echo "\n╔════════════════════════════════════════════════════════════════╗\n";
echo "║                      TESTS COMPLETADOS                         ║\n";
echo "╚════════════════════════════════════════════════════════════════╝\n\n";

echo "📌 PASOS PARA PROBAR EL LOGIN:\n\n";
echo "1. Abre en el navegador:\n";
echo "   http://localhost/prueba%20conexion%20php/login.php\n\n";
echo "2. Usa estas credenciales:\n";
echo "   Usuario: admin\n";
echo "   Contraseña: admin123\n\n";
echo "3. Si todo funciona, verás el Panel Administrativo\n";
echo "   Si hay error 404, revisa la consola del navegador (F12)\n\n";

$conexion->close();
?>
