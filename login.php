<?php
session_start();

// Si ya está logueado, redirige al panel
if (isset($_SESSION['usuario'])) {
    header("Location: admin/dashboard.php");
    exit();
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Login - Panel Administrativo</title>
  <link rel="stylesheet" href="css/style.css" />
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #0a0e13, #0f1419);
    }
    .card {
      background: linear-gradient(135deg, var(--bg-dark), #0d1419);
      padding: 28px;
      border-radius: 12px;
      border: 1px solid var(--accent-blue);
      width: 380px;
      box-shadow: 0 20px 50px rgba(22, 48, 43, 0.6);
    }
    h2 { color: var(--accent-copper); margin: 0 0 12px; }
    label { display: block; margin-top: 10px; font-size: 13px; color: var(--text-secondary); }
    input {
      width: 100%; padding: 12px; border: 1px solid var(--accent-blue);
      border-radius: 8px; margin-top: 6px; background: rgba(15, 20, 25, 0.7);
      color: var(--text-primary); box-sizing: border-box;
    }
    button {
      width: 100%; margin-top: 14px; padding: 12px; border-radius: 8px;
      border: 1px solid var(--accent-copper);
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-blue));
      color: var(--accent-copper); cursor: pointer; font-weight: 700;
    }
    button:hover { opacity: 0.9; }
    .note { font-size: 13px; color: var(--text-secondary); margin-top: 8px; }
    .error-message {
      background-color: #ffdddd;
      color: #a00;
      padding: 10px;
      border: 1px solid #a00;
      border-radius: 5px;
      margin-bottom: 15px;
      text-align: center;
    }
    .success-message {
      background-color: #ddffdd;
      color: #0a0;
      padding: 10px;
      border: 1px solid #0a0;
      border-radius: 5px;
      margin-bottom: 15px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Acceso al Panel Administrativo</h2>

    <?php if (isset($_GET['error']) && $_GET['error'] == 'credenciales'): ?>
      <div class="error-message">⚠️ Credenciales incorrectas. Intenta nuevamente.</div>
    <?php endif; ?>

    <?php if (isset($_GET['noauth']) && $_GET['noauth'] == 1): ?>
      <div class="error-message">⚠️ Necesitas iniciar sesión primero.</div>
    <?php endif; ?>

    <?php if (isset($_GET['logout']) && $_GET['logout'] == 1): ?>
      <div class="success-message">✓ Sesión cerrada correctamente.</div>
    <?php endif; ?>

    <form action="procesar_login.php" method="POST">
      <label for="user">Usuario</label>
      <input id="user" name="user" autocomplete="username" required />
      <label for="pass">Contraseña</label>
      <input id="pass" name="pass" type="password" autocomplete="current-password" required />
      <button type="submit">Iniciar sesión</button>
    </form>
    <div class="note">
      Credenciales por defecto: <strong>admin / admin123</strong>
    </div>
  </div>
</body>
</html>