<?php
// Configuración de la base de datos
$host = "localhost";
$usuario = "root";
$contrasena = "";
$base_datos = "barberia";

// Crear conexión con timeout
$conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

// Verificar conexión
if ($conexion->connect_error) {
    header("HTTP/1.1 500 Internal Server Error", true, 500);
    die(json_encode(['error' => 'Error de conexión a la base de datos: ' . $conexion->connect_error], JSON_UNESCAPED_UNICODE));
}

// Establecer charset UTF-8
if (!$conexion->set_charset("utf8mb4")) {
    header("HTTP/1.1 500 Internal Server Error", true, 500);
    die(json_encode(['error' => 'Error al establecer charset: ' . $conexion->error], JSON_UNESCAPED_UNICODE));
}

?>
