const db = require('../config/database');

class User {
    /**
     * Buscar usuario por email (PRIMARY KEY)
     */
    static async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            throw new Error('Error al buscar usuario por email: ' + error.message);
        }
    }

    /**
     * Buscar usuario por nombre de usuario
     */
    static async findByUsername(nombreUsuario) {
        try {
            const [rows] = await db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombreUsuario]);
            return rows[0];
        } catch (error) {
            throw new Error('Error al buscar usuario por nombre: ' + error.message);
        }
    }

    /**
     * Buscar usuario por identificación
     */
    static async findByIdentification(identificacion) {
        try {
            const [rows] = await db.query('SELECT * FROM usuarios WHERE identificacion = ?', [identificacion]);
            return rows[0];
        } catch (error) {
            throw new Error('Error al buscar usuario por identificación: ' + error.message);
        }
    }

    /**
     * Crear nuevo usuario
     */
    static async create(userData) {
        try {
            const { 
                email, 
                nombreUsuario, 
                tipoIdentificacion, 
                identificacion, 
                fechaNacimiento, 
                telefono, 
                direccion,
                tipoUsuario,
                formacionProfesional,
                tarjetaProfesional,
                password, 
                tokenVerificacion 
            } = userData;

            const [result] = await db.query(
                `INSERT INTO usuarios 
                (email, nombre_usuario, tipo_identificacion, identificacion, fecha_nacimiento, 
                telefono, direccion, tipo_usuario, formacion_profesional, tarjeta_profesional, 
                password, token_verificacion) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    email, 
                    nombreUsuario, 
                    tipoIdentificacion, 
                    identificacion, 
                    fechaNacimiento, 
                    telefono, 
                    direccion, 
                    tipoUsuario || 'Cliente', 
                    formacionProfesional === null || formacionProfesional === '' ? null : formacionProfesional,
                    tarjetaProfesional === null || tarjetaProfesional === '' ? null : tarjetaProfesional,
                    password, 
                    tokenVerificacion
                ]
            );

            return { email, affectedRows: result.affectedRows };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El email, nombre de usuario o identificación ya están registrados');
            }
            throw new Error('Error al crear usuario: ' + error.message);
        }
    }

    /**
     * Verificar email del usuario
     */
    static async verifyEmail(token) {
        try {
            const [result] = await db.query(
                'UPDATE usuarios SET verificado = TRUE, token_verificacion = NULL WHERE token_verificacion = ?',
                [token]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al verificar email: ' + error.message);
        }
    }

    /**
     * Verificar usuario directamente por email (sin token)
     */
    static async verifyByEmail(email) {
        try {
            const [result] = await db.query(
                'UPDATE usuarios SET verificado = TRUE, token_verificacion = NULL WHERE email = ?',
                [email]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al verificar usuario: ' + error.message);
        }
    }

    /**
     * Buscar usuario por token de verificación
     */
    static async findByToken(token) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE token_verificacion = ?', 
                [token]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error al buscar por token: ' + error.message);
        }
    }

    /**
     * Actualizar último acceso
     */
    static async updateLastAccess(email) {
        try {
            await db.query(
                'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE email = ?',
                [email]
            );
        } catch (error) {
            throw new Error('Error al actualizar último acceso: ' + error.message);
        }
    }

    /**
     * Obtener todos los usuarios
     */
    static async findAll() {
        try {
            const [rows] = await db.query(
                'SELECT email, nombre_usuario, tipo_identificacion, identificacion, fecha_nacimiento, telefono, direccion, tipo_usuario, formacion_profesional, tarjeta_profesional, verificado, fecha_registro, ultimo_acceso FROM usuarios ORDER BY fecha_registro DESC'
            );
            return rows;
        } catch (error) {
            throw new Error('Error al obtener usuarios: ' + error.message);
        }
    }

    /**
     * Actualizar usuario
     */
    static async update(email, userData) {
        try {
            const { 
                nombreUsuario, 
                tipoIdentificacion, 
                identificacion, 
                fechaNacimiento, 
                telefono, 
                direccion,
                tipoUsuario,
                formacionProfesional,
                tarjetaProfesional
            } = userData;

            const [result] = await db.query(
                `UPDATE usuarios 
                SET nombre_usuario = ?, tipo_identificacion = ?, identificacion = ?, 
                fecha_nacimiento = ?, telefono = ?, direccion = ?, tipo_usuario = ?,
                formacion_profesional = ?, tarjeta_profesional = ?
                WHERE email = ?`,
                [
                    nombreUsuario, 
                    tipoIdentificacion, 
                    identificacion, 
                    fechaNacimiento, 
                    telefono, 
                    direccion, 
                    tipoUsuario || 'Cliente', 
                    formacionProfesional === null || formacionProfesional === '' ? null : formacionProfesional,
                    tarjetaProfesional === null || tarjetaProfesional === '' ? null : tarjetaProfesional,
                    email
                ]
            );

            return result.affectedRows > 0;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El nombre de usuario o identificación ya están en uso');
            }
            throw new Error('Error al actualizar usuario: ' + error.message);
        }
    }

    /**
     * Actualizar contraseña del usuario
     */
    static async updatePassword(email, newPassword) {
        try {
            const [result] = await db.query(
                'UPDATE usuarios SET password = ? WHERE email = ?',
                [newPassword, email]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al actualizar contraseña: ' + error.message);
        }
    }

    /**
     * Eliminar usuario
     */
    static async delete(email) {
        try {
            const [result] = await db.query('DELETE FROM usuarios WHERE email = ?', [email]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al eliminar usuario: ' + error.message);
        }
    }

    /**
     * Guardar token de recuperación de contraseña
     */
    static async savePasswordResetToken(email, token, expirationDate) {
        try {
            const [result] = await db.query(
                'UPDATE usuarios SET token_recuperacion = ?, token_recuperacion_expira = ? WHERE email = ?',
                [token, expirationDate, email]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al guardar token de recuperación: ' + error.message);
        }
    }

    /**
     * Buscar usuario por token de recuperación válido
     */
    static async findByPasswordResetToken(token) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE token_recuperacion = ? AND token_recuperacion_expira > NOW()',
                [token]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error al buscar por token de recuperación: ' + error.message);
        }
    }

    /**
     * Limpiar token de recuperación después de usarlo
     */
    static async clearPasswordResetToken(email) {
        try {
            const [result] = await db.query(
                'UPDATE usuarios SET token_recuperacion = NULL, token_recuperacion_expira = NULL WHERE email = ?',
                [email]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al limpiar token de recuperación: ' + error.message);
        }
    }
}

module.exports = User;
