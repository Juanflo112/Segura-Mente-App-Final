const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

/**
 * Reglas de validación para el registro de usuario
 */
exports.registerValidation = [
    // Validación del nombre de usuario
    body('nombreUsuario')
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de usuario debe tener entre 3 y 100 caracteres')
        .matches(/^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos')
        .trim(),

    // Validación del tipo de identificación
    body('tipoIdentificacion')
        .notEmpty().withMessage('El tipo de identificación es obligatorio')
        .isIn(['CC', 'CE']).withMessage('El tipo de identificación debe ser CC o CE'),

    // Validación de la identificación
    body('identificacion')
        .notEmpty().withMessage('La identificación es obligatoria')
        .isLength({ min: 5, max: 50 }).withMessage('La identificación debe tener entre 5 y 50 caracteres')
        .matches(/^[0-9]+$/).withMessage('La identificación solo debe contener números'),

    // Validación de fecha de nacimiento
    body('fechaNacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isDate().withMessage('Debe ser una fecha válida')
        .custom((value) => {
            const age = Math.floor((new Date() - new Date(value)) / 3.15576e+10);
            if (age < 18) {
                throw new Error('Debes ser mayor de 18 años');
            }
            if (age > 120) {
                throw new Error('Fecha de nacimiento inválida');
            }
            return true;
        }),

    // Validación del teléfono
    body('telefono')
        .notEmpty().withMessage('El teléfono es obligatorio')
        .matches(/^[0-9]{10}$/).withMessage('El teléfono debe tener 10 dígitos numéricos'),

    // Validación de la dirección
    body('direccion')
        .notEmpty().withMessage('La dirección es obligatoria')
        .isLength({ min: 5, max: 255 }).withMessage('La dirección debe tener entre 5 y 255 caracteres')
        .trim(),

    // Validación del email
    body('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe ser un email válido')
        .isLength({ max: 150 }).withMessage('El email no puede tener más de 150 caracteres')
        .normalizeEmail(),

    // Validación del tipo de usuario
    body('tipoUsuario')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(['Cliente', 'Psicólogo/empleado']).withMessage('El tipo de usuario debe ser Cliente o Psicólogo/empleado'),

    // Validación condicional para empleados
    body('formacionProfesional')
        .custom((value, { req }) => {
            if (req.body.tipoUsuario === 'Psicólogo/empleado' && (!value || String(value).trim() === '')) {
                throw new Error('La formación profesional es obligatoria para Psicólogo/empleado');
            }
            return true;
        }),

    body('tarjetaProfesional')
        .custom((value, { req }) => {
            if (req.body.tipoUsuario === 'Psicólogo/empleado' && (!value || String(value).trim() === '')) {
                throw new Error('La tarjeta profesional es obligatoria para Psicólogo/empleado');
            }
            return true;
        }),

    // Validación de la contraseña
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo (@$!%*?&_#)'),

    // Validación de confirmación de contraseña
    body('confirmPassword')
        .notEmpty().withMessage('Debe confirmar la contraseña')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden');
            }
            return true;
        })
];

/**
 * Reglas de validación para crear usuario desde el dashboard
 * (no requiere confirmPassword)
 */
exports.dashboardUserValidation = [
    // Validación del nombre de usuario
    body('nombre_usuario')
        .notEmpty().withMessage('El nombre de usuario es obligatorio')
        .isLength({ min: 3, max: 100 }).withMessage('El nombre de usuario debe tener entre 3 y 100 caracteres')
        .matches(/^[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos')
        .trim(),

    // Validación del tipo de identificación
    body('tipo_identificacion')
        .notEmpty().withMessage('El tipo de identificación es obligatorio')
        .isIn(['CC', 'CE']).withMessage('El tipo de identificación debe ser CC o CE'),

    // Validación de la identificación
    body('identificacion')
        .notEmpty().withMessage('La identificación es obligatoria')
        .isLength({ min: 5, max: 50 }).withMessage('La identificación debe tener entre 5 y 50 caracteres')
        .matches(/^[0-9]+$/).withMessage('La identificación solo debe contener números'),

    // Validación de fecha de nacimiento
    body('fecha_nacimiento')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isDate().withMessage('Debe ser una fecha válida')
        .custom((value) => {
            const age = Math.floor((new Date() - new Date(value)) / 3.15576e+10);
            if (age < 18) {
                throw new Error('Debes ser mayor de 18 años');
            }
            if (age > 120) {
                throw new Error('Fecha de nacimiento inválida');
            }
            return true;
        }),

    // Validación del teléfono
    body('telefono')
        .notEmpty().withMessage('El teléfono es obligatorio')
        .matches(/^[0-9]{10}$/).withMessage('El teléfono debe tener 10 dígitos numéricos'),

    // Validación de la dirección
    body('direccion')
        .notEmpty().withMessage('La dirección es obligatoria')
        .isLength({ min: 5, max: 255 }).withMessage('La dirección debe tener entre 5 y 255 caracteres')
        .trim(),

    // Validación del email
    body('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe ser un email válido')
        .isLength({ max: 150 }).withMessage('El email no puede tener más de 150 caracteres')
        .normalizeEmail(),

    body('tipo_usuario')
        .optional({ nullable: true, checkFalsy: true })
        .isIn(['Cliente', 'Psicólogo/empleado']).withMessage('El tipo de usuario debe ser Cliente o Psicólogo/empleado'),

    body('formacion_profesional')
        .custom((value, { req }) => {
            if (req.body.tipo_usuario === 'Psicólogo/empleado' && (!value || String(value).trim() === '')) {
                throw new Error('La formación profesional es obligatoria para Psicólogo/empleado');
            }
            return true;
        }),

    body('tarjeta_profesional')
        .custom((value, { req }) => {
            if (req.body.tipo_usuario === 'Psicólogo/empleado' && (!value || String(value).trim() === '')) {
                throw new Error('La tarjeta profesional es obligatoria para Psicólogo/empleado');
            }
            return true;
        }),

    // Validación de la contraseña
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]/)
        .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo (@$!%*?&_#)')
];

/**
 * Middleware para verificar errores de validación
 */
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }))
        });
    }
    next();
};

/**
 * Reglas de validación para el login
 */
exports.loginValidation = [
    body('email')
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Debe ser un email válido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];

/**
 * Middleware de autenticación JWT
 */
exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token de autenticación no proporcionado'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        req.user = user; // Guardar información del usuario en la petición
        next();
    });
};
