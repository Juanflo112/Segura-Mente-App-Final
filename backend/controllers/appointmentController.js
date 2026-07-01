const Appointment = require('../models/Appointment');

exports.getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll();
        res.json({ success: true, appointments });
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las citas.' });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const clientEmail = req.user.email;
        const clientName = req.user.nombreUsuario || '';
        const { date, time, psychologistEmail, psychologistName, psychologistSpecialty, notes } = req.body;

        if (!date || !time || !psychologistEmail) {
            return res.status(400).json({
                success: false,
                message: 'Fecha, hora y psicólogo son obligatorios.'
            });
        }

        const activeCount = await Appointment.countActiveByClient(clientEmail);
        if (activeCount >= 2) {
            return res.status(400).json({
                success: false,
                message: 'No puedes tener más de dos citas activas al mismo tiempo.'
            });
        }

        const slotTaken = await Appointment.isSlotTaken(date, time, psychologistEmail);
        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: 'El psicólogo seleccionado ya tiene una cita en ese horario.'
            });
        }

        const appointment = await Appointment.create({
            clientEmail,
            clientName,
            date,
            time,
            psychologistEmail,
            psychologistName,
            psychologistSpecialty,
            notes
        });

        res.status(201).json({ success: true, appointment });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ success: false, message: 'Error al crear la cita.' });
    }
};

exports.updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const clientEmail = req.user.email;
        const { date, time, psychologistEmail, psychologistName, psychologistSpecialty, notes } = req.body;

        const existing = await Appointment.findById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada.' });
        }
        if (existing.clientEmail !== clientEmail) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para modificar esta cita.' });
        }
        if (existing.status === 'Cancelada') {
            return res.status(400).json({ success: false, message: 'No se puede modificar una cita cancelada.' });
        }
        if (!date || !time || !psychologistEmail) {
            return res.status(400).json({ success: false, message: 'Fecha, hora y psicólogo son obligatorios.' });
        }

        const slotTaken = await Appointment.isSlotTaken(date, time, psychologistEmail, id);
        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: 'El psicólogo seleccionado ya tiene una cita en ese horario.'
            });
        }

        const updated = await Appointment.update(id, {
            date, time, psychologistEmail, psychologistName, psychologistSpecialty, notes
        });

        res.json({ success: true, appointment: updated });
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar la cita.' });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const clientEmail = req.user.email;

        const existing = await Appointment.findById(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Cita no encontrada.' });
        }
        if (existing.clientEmail !== clientEmail) {
            return res.status(403).json({ success: false, message: 'No tienes permiso para cancelar esta cita.' });
        }
        if (existing.status === 'Cancelada') {
            return res.status(400).json({ success: false, message: 'La cita ya está cancelada.' });
        }

        const cancelled = await Appointment.cancel(id);
        res.json({ success: true, appointment: cancelled });
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ success: false, message: 'Error al cancelar la cita.' });
    }
};
