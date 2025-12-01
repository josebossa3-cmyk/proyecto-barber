-- Crear tabla de administradores
CREATE TABLE administradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  clave VARCHAR(255) NOT NULL
);

-- Insertar administrador por defecto
INSERT INTO administradores (usuario, clave)
VALUES ('admin', 'admin123');

-- Crear tabla de turnos
CREATE TABLE turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente VARCHAR(150) NOT NULL,
  telefono VARCHAR(50) DEFAULT NULL,
  servicio VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  barbero VARCHAR(80) DEFAULT NULL,
  pago VARCHAR(80) DEFAULT NULL,
  duracionMinutos INT DEFAULT 0,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
