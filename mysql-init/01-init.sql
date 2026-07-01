-- Script de inicialización para la base de datos seguramente_db
-- Este script se ejecuta automáticamente cuando el contenedor MySQL se crea por primera vez

USE seguramente_db;

-- Crear tabla de usuarios con email como PRIMARY KEY
CREATE TABLE IF NOT EXISTS usuarios (
    email VARCHAR(150) PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    tipo_identificacion VARCHAR(5) NOT NULL,
    identificacion VARCHAR(50) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) DEFAULT 'Cliente',
    formacion_profesional VARCHAR(255),
    tarjeta_profesional VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expira DATETIME,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX idx_identificacion ON usuarios(identificacion);
CREATE INDEX idx_token_verificacion ON usuarios(token_verificacion);
CREATE INDEX idx_reset_token ON usuarios(reset_token);
CREATE INDEX idx_tipo_usuario ON usuarios(tipo_usuario);

-- Tabla de citas / agendamientos
CREATE TABLE IF NOT EXISTS citas (
    id                     VARCHAR(36)  PRIMARY KEY,
    client_email           VARCHAR(150) NOT NULL,
    client_name            VARCHAR(100) NOT NULL,
    date                   DATE         NOT NULL,
    time                   VARCHAR(10)  NOT NULL,
    psychologist_email     VARCHAR(150) NOT NULL,
    psychologist_name      VARCHAR(100) NOT NULL,
    psychologist_specialty VARCHAR(255) DEFAULT 'Psicólogo/a',
    notes                  TEXT,
    status                 ENUM('Agendada', 'Cancelada') DEFAULT 'Agendada',
    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_citas_client       (client_email),
    INDEX idx_citas_psychologist (psychologist_email),
    INDEX idx_citas_status       (status),
    INDEX idx_citas_date         (date)
);

-- Insertar usuario administrador de prueba (password: Admin123!)
-- Nota: En producción, elimina este usuario o cambia la contraseña
INSERT INTO usuarios (
    email,
    nombre_usuario,
    tipo_identificacion,
    identificacion,
    fecha_nacimiento,
    telefono,
    direccion,
    tipo_usuario,
    password,
    verificado
) VALUES (
    'admin@seguramente.com',
    'admin',
    'CC',
    '1234567890',
    '1990-01-01',
    '3001234567',
    'Calle Principal 123',
    'Administrador',
    '$2b$10$XQMpZ9J5F5F5F5F5F5F5F.5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F',
    TRUE
) ON DUPLICATE KEY UPDATE email=email;

-- Mensaje de confirmación
SELECT 'Base de datos seguramente_db inicializada correctamente' AS message;
