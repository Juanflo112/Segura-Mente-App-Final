const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/validation');

router.get('/', authenticateToken, appointmentController.getAppointments);
router.get('/psychologist', authenticateToken, appointmentController.getMyAppointmentsAsPsychologist);
router.post('/', authenticateToken, appointmentController.createAppointment);
router.put('/:id', authenticateToken, appointmentController.updateAppointment);
router.patch('/:id/cancel', authenticateToken, appointmentController.cancelAppointment);
router.patch('/:id/cancel-by-psychologist', authenticateToken, appointmentController.cancelByPsychologist);

module.exports = router;
