<?php
session_start();
require_once 'includes/config.php';

$usuario = trim($_POST['user'] ?? '');
$clave   = trim($_POST['pass'] ?? '');

if (!$usuario || !$clave) {
    header('Location: login.php?error=campos');
    exit();
}

// Validación contra la base de datos
$stmt = $conexion->prepare("SELECT * FROM administradores WHERE usuario=? AND clave=?");
if (!$stmt) {
    header('Location: login.php?error=servidor');
    exit();
}

$stmt->bind_param("ss", $usuario, $clave);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $_SESSION['usuario'] = $usuario;
    header("Location: admin/dashboard.php");
    exit();
} else {
    header("Location: login.php?error=credenciales");
    exit();
}
?>
