-- Agregar columnas para recuperación de contraseña
-- Estas columnas permitirán almacenar tokens temporales para restablecer contraseñas

ALTER TABLE usuarios 
ADD COLUMN token_recuperacion VARCHAR(255) DEFAULT NULL AFTER token_verificacion,
ADD COLUMN token_recuperacion_expira DATETIME DEFAULT NULL AFTER token_recuperacion;

-- Crear índice para búsquedas más rápidas por token de recuperación
CREATE INDEX idx_token_recuperacion ON usuarios(token_recuperacion);
