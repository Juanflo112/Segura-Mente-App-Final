-- Migración para agregar campos de tipo de usuario, formación profesional y tarjeta profesional
-- Ejecutar este script si la tabla usuarios ya existe

USE seguramente_db;

-- Agregar columna tipo_usuario si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS tipo_usuario VARCHAR(50) DEFAULT 'Cliente' AFTER direccion;

-- Agregar columna formacion_profesional si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS formacion_profesional VARCHAR(255) AFTER tipo_usuario;

-- Agregar columna tarjeta_profesional si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS tarjeta_profesional VARCHAR(100) AFTER formacion_profesional;

-- Actualizar usuarios existentes para que tengan tipo_usuario = 'Cliente' si es NULL
UPDATE usuarios SET tipo_usuario = 'Cliente' WHERE tipo_usuario IS NULL;

SELECT 'Migración completada exitosamente' AS mensaje;
