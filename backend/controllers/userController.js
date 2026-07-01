const bcrypt = require('bcryptjs');
const User = require('../models/User');
const db = require('../config/database');

/**
 * Obtener todos los usuarios
 */
exports.getAllUsers = async (req, res) => {
    try {
        console.log('Obteniendo lista de usuarios...');

        const users = await User.findAll();

        res.status(200).json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            count: users.length,
            users
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuarios',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Obtener un usuario por email
 */
exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        console.log('Buscando usuario:', email);

        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // No devolver la contraseña
        const { password, token_verificacion, ...userData } = user;

        res.status(200).json({
            success: true,
            user: userData
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Crear nuevo usuario desde el dashboard (por administrador)
 */
exports.createUser = async (req, res) => {
    try {
        const {
            nombre_usuario,
            tipo_identificacion,
            identificacion,
            fecha_nacimiento,
            telefono,
            direccion,
            tipo_usuario,
            formacion_profesional,
            tarjeta_profesional,
            email,
            password
        } = req.body;

        console.log('Creando nuevo usuario desde dashboard:', email);
        console.log('Datos recibidos:', { tipo_usuario, formacion_profesional, tarjeta_profesional });

        // Verificar si el email ya existe
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Verificar si el nombre de usuario ya existe
        const existingUsername = await User.findByUsername(nombre_usuario);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }

        // Verificar si la identificación ya existe
        const existingIdentification = await User.findByIdentification(identificacion);
        if (existingIdentification) {
            return res.status(400).json({
                success: false,
                message: 'El número de identificación ya está registrado'
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario (verificado automáticamente desde el dashboard)
        const userData = {
            email,
            nombreUsuario: nombre_usuario,
            tipoIdentificacion: tipo_identificacion,
            identificacion,
            fechaNacimiento: fecha_nacimiento,
            telefono,
            direccion,
            tipoUsuario: tipo_usuario || 'Cliente',
            formacionProfesional: formacion_profesional && formacion_profesional.trim() !== '' ? formacion_profesional : null,
            tarjetaProfesional: tarjeta_profesional && tarjeta_profesional.trim() !== '' ? tarjeta_profesional : null,
            password: hashedPassword,
            tokenVerificacion: null // No requiere verificación desde dashboard
        };

        console.log('userData a crear:', userData);

        await User.create(userData);

        // Marcar como verificado inmediatamente
        await db.query('UPDATE usuarios SET verificado = TRUE WHERE email = ?', [email]);

        console.log('Usuario creado exitosamente desde dashboard:', email);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            user: { email, nombre_usuario }
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al crear usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Actualizar usuario
 */
exports.updateUser = async (req, res) => {
    try {
        const { email } = req.params;
        const {
            nombre_usuario,
            tipo_identificacion,
            identificacion,
            fecha_nacimiento,
            telefono,
            direccion,
            tipo_usuario,
            formacion_profesional,
            tarjeta_profesional,
            password
        } = req.body;

        console.log('Actualizando usuario:', email, req.body);

        // Verificar que el usuario existe
        const existingUser = await User.findByEmail(email);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Si se cambió el nombre de usuario, verificar que no esté en uso
        if (nombre_usuario && nombre_usuario !== existingUser.nombre_usuario) {
            const usernameExists = await User.findByUsername(nombre_usuario);
            if (usernameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya está en uso'
                });
            }
        }

        // Si se cambió la identificación, verificar que no esté en uso
        if (identificacion && identificacion !== existingUser.identificacion) {
            const identificationExists = await User.findByIdentification(identificacion);
            if (identificationExists) {
                return res.status(400).json({
                    success: false,
                    message: 'El número de identificación ya está registrado'
                });
            }
        }

        // Actualizar datos del usuario
        const userData = {
            nombreUsuario: nombre_usuario || existingUser.nombre_usuario,
            tipoIdentificacion: tipo_identificacion || existingUser.tipo_identificacion,
            identificacion: identificacion || existingUser.identificacion,
            fechaNacimiento: fecha_nacimiento || existingUser.fecha_nacimiento,
            telefono: telefono || existingUser.telefono,
            direccion: direccion || existingUser.direccion,
            tipoUsuario: tipo_usuario || existingUser.tipo_usuario || 'Cliente',
            formacionProfesional: formacion_profesional !== undefined 
                ? (formacion_profesional && formacion_profesional.trim() !== '' ? formacion_profesional : null)
                : existingUser.formacion_profesional,
            tarjetaProfesional: tarjeta_profesional !== undefined 
                ? (tarjeta_profesional && tarjeta_profesional.trim() !== '' ? tarjeta_profesional : null)
                : existingUser.tarjeta_profesional
        };

        console.log('userData a actualizar:', userData);

        const updated = await User.update(email, userData);

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo actualizar el usuario'
            });
        }

        // Si se proporcionó una nueva contraseña, actualizarla
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.updatePassword(email, hashedPassword);
        }

        console.log('Usuario actualizado exitosamente:', email);

        res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al actualizar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Eliminar usuario
 */
exports.deleteUser = async (req, res) => {
    try {
        const { email } = req.params;

        console.log('Eliminando usuario:', email);

        // Verificar que el usuario existe
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Eliminar usuario
        const deleted = await User.delete(email);

        if (!deleted) {
            return res.status(400).json({
                success: false,
                message: 'No se pudo eliminar el usuario'
            });
        }

        console.log('Usuario eliminado exitosamente:', email);

        res.status(200).json({
            success: true,
            message: 'Usuario eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
