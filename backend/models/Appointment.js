const crypto = require('crypto');
const db = require('../config/database');

class Appointment {
    static generateId() {
        if (crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    static formatDate(value) {
        if (!value) return '';
        if (value instanceof Date) return value.toISOString().split('T')[0];
        return String(value).split('T')[0];
    }

    static mapRow(row) {
        if (!row) return null;
        return {
            id: row.id,
            clientEmail: row.client_email,
            clientName: row.client_name,
            date: Appointment.formatDate(row.date),
            time: row.time,
            psychologistEmail: row.psychologist_email,
            psychologistName: row.psychologist_name,
            psychologistSpecialty: row.psychologist_specialty || 'Psicólogo/a',
            notes: row.notes || '',
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async findAll() {
        const [rows] = await db.query(
            'SELECT * FROM citas ORDER BY date ASC, time ASC'
        );
        return rows.map(Appointment.mapRow);
    }

    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE id = ?',
            [id]
        );
        return rows[0] ? Appointment.mapRow(rows[0]) : null;
    }

    static async findRawById(id) {
        const [rows] = await db.query(
            'SELECT * FROM citas WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    static async create(data) {
        const {
            clientEmail,
            clientName,
            date,
            time,
            psychologistEmail,
            psychologistName,
            psychologistSpecialty,
            notes
        } = data;

        const id = Appointment.generateId();

        await db.query(
            `INSERT INTO citas
             (id, client_email, client_name, date, time,
              psychologist_email, psychologist_name, psychologist_specialty, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Agendada')`,
            [
                id,
                clientEmail,
                clientName,
                date,
                time,
                psychologistEmail,
                psychologistName || '',
                psychologistSpecialty || 'Psicólogo/a',
                notes || null
            ]
        );

        return Appointment.findById(id);
    }

    static async update(id, data) {
        const {
            date,
            time,
            psychologistEmail,
            psychologistName,
            psychologistSpecialty,
            notes
        } = data;

        await db.query(
            `UPDATE citas
             SET date = ?, time = ?, psychologist_email = ?,
                 psychologist_name = ?, psychologist_specialty = ?,
                 notes = ?, updated_at = NOW()
             WHERE id = ?`,
            [
                date,
                time,
                psychologistEmail,
                psychologistName || '',
                psychologistSpecialty || 'Psicólogo/a',
                notes || null,
                id
            ]
        );

        return Appointment.findById(id);
    }

    static async cancel(id) {
        await db.query(
            `UPDATE citas SET status = 'Cancelada', updated_at = NOW() WHERE id = ?`,
            [id]
        );
        return Appointment.findById(id);
    }

    static async countActiveByClient(email, excludeId = null) {
        let query = `SELECT COUNT(*) AS total FROM citas
                     WHERE client_email = ? AND status = 'Agendada'`;
        const params = [email];
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(query, params);
        return Number(rows[0].total);
    }

    static async isSlotTaken(date, time, psychologistEmail, excludeId = null) {
        let query = `SELECT COUNT(*) AS total FROM citas
                     WHERE date = ? AND time = ? AND psychologist_email = ? AND status = 'Agendada'`;
        const params = [date, time, psychologistEmail];
        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }
        const [rows] = await db.query(query, params);
        return Number(rows[0].total) > 0;
    }
}

module.exports = Appointment;
