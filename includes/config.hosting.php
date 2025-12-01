<?php
/**
 * CONFIGURACIÓN DE BASE DE DATOS - HOSTING
 * 
 * ⚠️ IMPORTANTE: Renombra este archivo a config.php en el hosting
 * ⚠️ IMPORTANTE: Completa con los datos que te proporcione tu hosting
 */

// ===================================
// CONFIGURACIÓN DE BASE DE DATOS
// ===================================

// Host de la base de datos (generalmente 'localhost')
$host = 'localhost';

// Usuario de MySQL (lo proporciona tu hosting)
$usuario = 'tu_usuario_mysql';

// Contraseña de MySQL (la proporciona tu hosting)
$password = 'tu_password_mysql';

// Nombre de la base de datos
$basedatos = 'tu_base_de_datos';

// ===================================
// CONEXIÓN
// ===================================

$conexion = new mysqli($host, $usuario, $password, $basedatos);

if ($conexion->connect_error) {
    // En producción NO mostrar detalles del error
    error_log("Error de conexión a BD: " . $conexion->connect_error);
    die("Error en el servidor. Contacta al administrador.");
}

$conexion->set_charset("utf8mb4");

// ===================================
// NOTAS PARA HOSTING
// ===================================

/*
HOSTING COMÚN (cPanel/Hostinger/etc):
1. Ve a "Bases de Datos MySQL" en el panel
2. Crea una nueva base de datos
3. Crea un usuario y contraseña
4. Asigna el usuario a la base de datos (todos los permisos)
5. Importa el archivo conexion_base.sql
6. Copia los datos aquí

EJEMPLO DE VALORES REALES:
$host = 'localhost';
$usuario = 'bunker_admin';
$password = 'P@ssw0rd!Strong123';
$basedatos = 'bunker_turnos';

HOSTINGER específicamente:
- Host: localhost
- Usuario: u123456789_nombre
- BD: u123456789_turnos

NOTA: Algunos hostings usan prefijos en los nombres
*/
?>
