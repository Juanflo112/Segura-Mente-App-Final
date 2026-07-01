/**
 * Crea la tabla de citas en la base de datos configurada en .env
 * Uso: node backend/scripts/migrateAppointments.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
// Reusar el pool de conexiones ya configurado en el backend
const db = require('../config/database');

const CREATE_TABLE_SQL = `
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
)
`;

async function migrate() {
    try {
        console.log('Conectando a la base de datos:', process.env.DB_NAME);
        await db.query(CREATE_TABLE_SQL);
        console.log('Tabla "citas" creada o ya existente. Listo.');

        const [rows] = await db.query("SHOW TABLES LIKE 'citas'");
        if (rows.length > 0) {
            console.log('Verificado: la tabla "citas" existe en la base de datos.');
        }
    } catch (error) {
        console.error('Error durante la migración:', error.message || error.code || error);
        console.error('Detalle completo:', JSON.stringify(error, null, 2));
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

migrate();
