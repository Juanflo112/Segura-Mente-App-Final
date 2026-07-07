const nodemailer = require('nodemailer');
require('dotenv').config();

const emailPort = parseInt(process.env.EMAIL_PORT, 10) || 587;

// Configurar transporter de nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: emailPort,
    secure: process.env.EMAIL_SECURE
        ? process.env.EMAIL_SECURE === 'true'
        : emailPort === 465,
    requireTLS: emailPort === 587,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
});

/**
 * Enviar email de verificación al usuario
 */
exports.sendVerificationEmail = async (email, nombreUsuario, token) => {
    try {
        const verificationUrl = `${process.env.CLIENT_URL}/verify?token=${token}`;

        const mailOptions = {
            from: `"Segura-Mente App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verificación de creación para tu cuenta en Segura-Mente',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            background-color: #4CAF50;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Hola ya casi estas con nosotros en Segura-Mente!</h1>
                        </div>
                        <div class="content">
                            <h2>Hola ${nombreUsuario},</h2>
                            <p>Gracias por registrarte en <strong>Segura-Mente</strong>.</p>
                            <p>Para activar tu cuenta y comenzar a usar nuestra plataforma, necesitamos que verifiques tu dirección de correo electrónico.</p>
                            <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
                            <div style="text-align: center;">
                                <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
                            </div>
                            <p>O copia y pega este enlace en tu navegador:</p>
                            <p style="background-color: #f0f0f0; padding: 10px; border-radius: 3px; word-break: break-all;">
                                ${verificationUrl}
                            </p>
                            <p><strong>Este enlace expirará en 24 horas.</strong></p>
                            <p>Si no creaste esta cuenta, puedes ignorar este correo de forma segura.</p>
                            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                            <p style="color: #666; font-size: 14px;">
                                <strong>Nota de seguridad:</strong> Nunca compartas tus credenciales con nadie. 
                                Segura-Mente jamás te pedirá tu contraseña por correo electrónico.
                            </p>
                        </div>
                        <div class="footer">
                            <p>© ${new Date().getFullYear()} Segura-Mente. Todos los derechos reservados.</p>
                            <p>Este es un correo automático, por favor no responder.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email de verificación enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw new Error('Error al enviar email de verificación: ' + error.message);
    }
};

/**
 * Enviar email de bienvenida después de verificación exitosa
 */
exports.sendWelcomeEmail = async (email, nombreUsuario) => {
    try {
        const mailOptions = {
            from: `"Segura-Mente App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: '¡Cuenta activada exitosamente!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 20px;
                            text-align: center;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>¡Tu cuenta ha sido activada!</h1>
                        </div>
                        <div class="content">
                            <h2>¡Felicidades ${nombreUsuario}!</h2>
                            <p>Tu cuenta en <strong>Segura-Mente</strong> ha sido verificada exitosamente.</p>
                            <p>Ya puedes iniciar sesión y disfrutar de todos nuestros servicios.</p>
                            <p>Gracias por confiar en nosotros.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email de bienvenida enviado');
    } catch (error) {
        console.error('Error al enviar email de bienvenida:', error);
    }
};

/**
 * Enviar email de recuperación de contraseña
 */
exports.sendPasswordResetEmail = async (email, nombreUsuario, token) => {
    try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"Segura-Mente App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Recuperación de Contraseña - Segura-Mente',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                        }
                        .button {
                            display: inline-block;
                            padding: 12px 30px;
                            margin: 20px 0;
                            background-color: #4CAF50;
                            color: white;
                            text-decoration: none;
                            border-radius: 5px;
                            font-weight: bold;
                        }
                        .warning {
                            background-color: #fff3cd;
                            border: 1px solid #ffc107;
                            padding: 15px;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Recuperación de Contraseña</h1>
                        </div>
                        <div class="content">
                            <h2>Hola ${nombreUsuario},</h2>
                            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Segura-Mente</strong>.</p>
                            <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
                            <div style="text-align: center;">
                                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                            </div>
                            <p>O copia y pega este enlace en tu navegador:</p>
                            <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 3px;">
                                ${resetUrl}
                            </p>
                            <div class="warning">
                                <strong>⚠️ Importante:</strong>
                                <ul>
                                    <li>Este enlace es válido por <strong>1 hora</strong></li>
                                    <li>Si no solicitaste este cambio, ignora este correo</li>
                                    <li>Tu contraseña actual seguirá siendo válida hasta que establezcas una nueva</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Este es un correo automático, por favor no respondas.</p>
                            <p>&copy; ${new Date().getFullYear()} Segura-Mente. Todos los derechos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email de recuperación enviado a:', email);
    } catch (error) {
        console.error('Error al enviar email de recuperación:', error);
        throw error;
    }
};
