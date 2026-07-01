const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/email');

/**
 * Controlador para el registro de usuario
 */
exports.register = async (req, res) => {
    try {
        const {
            nombreUsuario,
            tipoIdentificacion,
            identificacion,
            fechaNacimiento,
            telefono,
            direccion,
            email,
            tipoUsuario,
            formacionProfesional,
            tarjetaProfesional,
            password
        } = req.body;

        console.log('Intentando registrar usuario:', email);

        // 1. Verificar si el email ya existe (PRIMARY KEY)
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // 2. Verificar si el nombre de usuario ya existe
        const existingUsername = await User.findByUsername(nombreUsuario);
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }

        // 3. Verificar si la identificación ya existe
        const existingIdentification = await User.findByIdentification(identificacion);
        if (existingIdentification) {
            return res.status(400).json({
                success: false,
                message: 'El número de identificación ya está registrado'
            });
        }

        // 4. Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Contraseña encriptada');

        // 5. Generar token de verificación único
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // 6. Crear objeto de datos del usuario
        const userData = {
            email,
            nombreUsuario,
            tipoIdentificacion,
            identificacion,
            fechaNacimiento,
            telefono,
            direccion,
            tipoUsuario: tipoUsuario || 'Cliente',
            formacionProfesional: formacionProfesional || null,
            tarjetaProfesional: tarjetaProfesional || null,
            password: hashedPassword,
            tokenVerificacion: verificationToken
        };

        // 7. Guardar usuario en la base de datos
        const result = await User.create(userData);
        console.log('Usuario creado en la base de datos:', result.email);

        // 8. Enviar email de verificación (intentar)
        let emailSent = false;
        try {
            await sendVerificationEmail(email, nombreUsuario, verificationToken);
            console.log('Email de verificación enviado a:', email);
            emailSent = true;
        } catch (emailError) {
            console.error('Error al enviar email:', emailError.message);
            // Auto-verificar usuario si el email falla (workaround para Render free tier)
            console.log('Auto-verificando usuario debido a error de email...');
            try {
                await User.verifyByEmail(email);
                console.log('Usuario auto-verificado exitosamente');
            } catch (verifyError) {
                console.error('Error al auto-verificar:', verifyError.message);
            }
        }

        // 9. Respuesta exitosa
        res.status(201).json({
            success: true,
            message: emailSent
                ? 'Usuario registrado exitosamente. Por favor verifica tu correo electrónico.'
                : 'Usuario registrado exitosamente. Ya puedes iniciar sesión.',
            data: {
                email: result.email,
                nombreUsuario
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error al registrar usuario',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Controlador para verificar el email del usuario
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        console.log('Intentando verificar token...');

        // 1. Validar que el token esté presente
        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token de verificación no proporcionado'
            });
        }

        // 2. Buscar usuario por token
        const user = await User.findByToken(token);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        // 3. Verificar si el usuario ya está verificado
        if (user.verificado) {
            return res.status(200).json({
                success: true,
                message: 'Esta cuenta ya ha sido verificada previamente',
                alreadyVerified: true
            });
        }

        // 4. Actualizar estado de verificación
        const verified = await User.verifyEmail(token);

        if (verified) {
            console.log('Email verificado exitosamente para:', user.email);

            // 5. Enviar email de bienvenida (opcional)
            try {
                await sendWelcomeEmail(user.email, user.nombre_usuario);
            } catch (emailError) {
                console.error('Error al enviar email de bienvenida:', emailError.message);
            }

            // 6. Respuesta exitosa
            res.status(200).json({
                success: true,
                message: 'Email verificado exitosamente. Ya puedes iniciar sesión.',
                data: {
                    email: user.email,
                    nombreUsuario: user.nombre_usuario
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Error al verificar el email. Intenta nuevamente.'
            });
        }

    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error al verificar email',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Controlador para reenviar email de verificación
 */
exports.resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // 1. Buscar usuario
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // 2. Verificar si ya está verificado
        if (user.verificado) {
            return res.status(400).json({
                success: false,
                message: 'Esta cuenta ya está verificada'
            });
        }

        // 3. Generar nuevo token
        const newToken = crypto.randomBytes(32).toString('hex');

        // 4. Actualizar token en la base de datos (necesitarías agregar este método en el modelo)
        // await User.updateVerificationToken(email, newToken);

        // 5. Reenviar email
        await sendVerificationEmail(email, user.nombre_usuario, user.token_verificacion);

        res.status(200).json({
            success: true,
            message: 'Email de verificación reenviado exitosamente'
        });

    } catch (error) {
        console.error('Error al reenviar email:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reenviar email de verificación'
        });
    }
};

/**
 * Controlador para el login de usuario
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log('Intentando login para:', email);

        // 1. Validar que se enviaron email y password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son obligatorios'
            });
        }

        // 2. Buscar usuario por email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario inexistente'
            });
        }

        // 3. Verificar que la cuenta esté verificada
        if (!user.verificado) {
            return res.status(403).json({
                success: false,
                message: 'Por favor verifica tu correo electrónico antes de iniciar sesión',
                emailNotVerified: true
            });
        }

        // 4. Comparar contraseña
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales incorrectas'
            });
        }

        // 5. Generar token JWT
        const token = jwt.sign(
            {
                email: user.email,
                nombreUsuario: user.nombre_usuario
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' } // Token válido por 7 días
        );

        // 6. Actualizar último acceso
        await User.updateLastAccess(email);

        console.log('Login exitoso para:', user.nombre_usuario);

        // 7. Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                email: user.email,
                nombreUsuario: user.nombre_usuario,
                tipoUsuario: user.tipo_usuario || 'Cliente',
                tipoIdentificacion: user.tipo_identificacion,
                identificacion: user.identificacion,
                telefono: user.telefono,
                direccion: user.direccion,
                fechaNacimiento: user.fecha_nacimiento
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Controlador para solicitar recuperación de contraseña
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('Solicitud de recuperación de contraseña para:', email);

        // 1. Validar que se envió el email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico es obligatorio'
            });
        }

        // 2. Buscar usuario por email
        const user = await User.findByEmail(email);

        // Por seguridad, no revelar si el usuario existe o no
        // Siempre responder éxito pero solo enviar email si el usuario existe
        if (user) {
            // 3. Generar token de recuperación único
            const resetToken = crypto.randomBytes(32).toString('hex');

            // 4. Calcular fecha de expiración (1 hora desde ahora)
            const expirationDate = new Date(Date.now() + 3600000); // 1 hora

            // 5. Guardar token en la base de datos
            await User.savePasswordResetToken(email, resetToken, expirationDate);

            // 6. Enviar email de recuperación
            try {
                await sendPasswordResetEmail(email, user.nombre_usuario, resetToken);
                console.log('Email de recuperación enviado a:', email);
            } catch (emailError) {
                console.error('Error al enviar email de recuperación:', emailError.message);
                return res.status(503).json({
                    success: false,
                    message: 'No fue posible enviar el correo de recuperación en este momento. Intenta nuevamente más tarde.'
                });
            }
        } else {
            console.log('Usuario no encontrado, pero responderemos éxito por seguridad');
        }

        // 7. Respuesta genérica (por seguridad)
        res.status(200).json({
            success: true,
            message: 'Si el correo existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña.'
        });

    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al procesar la solicitud',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Controlador para restablecer la contraseña
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        console.log('Intento de restablecimiento de contraseña con token');

        // 1. Validar que se enviaron los datos necesarios
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token y nueva contraseña son obligatorios'
            });
        }

        // 2. Validar que la contraseña cumpla los requisitos
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        // 3. Buscar usuario por token válido (no expirado)
        const user = await User.findByPasswordResetToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.'
            });
        }

        // 4. Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 5. Actualizar la contraseña en la base de datos
        await User.updatePassword(user.email, hashedPassword);

        // 6. Limpiar el token de recuperación
        await User.clearPasswordResetToken(user.email);

        console.log('Contraseña actualizada exitosamente para:', user.email);

        // 7. Respuesta exitosa
        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
        });

    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al restablecer la contraseña',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
