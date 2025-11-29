<?php
// Iniciar sesión si no está iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Protege páginas del panel administrativo
 */
function proteger_panel()
{
    if (!isset($_SESSION['usuario'])) {
        header('Location: ../login.php?noauth=1');
        exit();
    }
}

// Helper para escapar salida HTML
function esc($v)
{
    return htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

?>
