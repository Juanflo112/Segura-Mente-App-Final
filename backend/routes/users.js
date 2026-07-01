const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { dashboardUserValidation, validate, authenticateToken } = require('../middleware/validation');

/**
 * @route   GET /api/users
 * @desc    Obtener todos los usuarios
 * @access  Private (requiere autenticación)
 */
router.get('/', authenticateToken, userController.getAllUsers);

/**
 * @route   GET /api/users/:email
 * @desc    Obtener un usuario por email
 * @access  Private (requiere autenticación)
 */
router.get('/:email', authenticateToken, userController.getUserByEmail);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario desde el dashboard
 * @access  Private (requiere autenticación)
 */
router.post('/', authenticateToken, dashboardUserValidation, validate, userController.createUser);

/**
 * @route   PUT /api/users/:email
 * @desc    Actualizar usuario
 * @access  Private (requiere autenticación)
 */
router.put('/:email', authenticateToken, userController.updateUser);

/**
 * @route   DELETE /api/users/:email
 * @desc    Eliminar usuario
 * @access  Private (requiere autenticación)
 */
router.delete('/:email', authenticateToken, userController.deleteUser);

module.exports = router;
