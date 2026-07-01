-- Migración: tabla de citas
-- Ejecutar una sola vez: mysql -u <user> -p seguramente_db < backend/migrations/create_appointments_table.sql

USE seguramente_db;

CREATE TABLE IF NOT EXISTS citas (
    id              VARCHAR(36)  PRIMARY KEY,
    client_email    VARCHAR(150) NOT NULL,
    client_name     VARCHAR(100) NOT NULL,
    date            DATE         NOT NULL,
    time            VARCHAR(10)  NOT NULL,
    psychologist_email    VARCHAR(150) NOT NULL,
    psychologist_name     VARCHAR(100) NOT NULL,
    psychologist_specialty VARCHAR(255) DEFAULT 'Psicólogo/a',
    notes           TEXT,
    status          ENUM('Agendada', 'Cancelada') DEFAULT 'Agendada',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_client_email       (client_email),
    INDEX idx_psychologist_email (psychologist_email),
    INDEX idx_status             (status),
    INDEX idx_date               (date)
);
