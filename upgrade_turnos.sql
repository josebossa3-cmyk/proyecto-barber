-- Script de migración para actualizar la tabla turnos
-- Ejecutar: mysql -u root barberia < upgrade_turnos.sql

-- Añadir columna telefono, conservar/añadir barbero, pago, duracionMinutos, creado
ALTER TABLE turnos
	ADD COLUMN IF NOT EXISTS telefono VARCHAR(50) DEFAULT NULL AFTER cliente,
	ADD COLUMN IF NOT EXISTS barbero VARCHAR(80) DEFAULT NULL AFTER hora,
	ADD COLUMN IF NOT EXISTS pago VARCHAR(80) DEFAULT NULL AFTER barbero,
	ADD COLUMN IF NOT EXISTS duracionMinutos INT DEFAULT 0 AFTER pago,
	ADD COLUMN IF NOT EXISTS creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER duracionMinutos;

-- Eliminar la columna email si existe (no necesaria)
ALTER TABLE turnos DROP COLUMN IF EXISTS email;

-- Verificar que la estructura es correcta
DESCRIBE turnos;
