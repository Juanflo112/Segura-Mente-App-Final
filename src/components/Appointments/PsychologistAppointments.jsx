import React, { useEffect, useState, useCallback } from 'react';
import API_BASE_URL from '../../config/api';
import './PsychologistAppointments.css';

const normalizeDate = (dateString) => `${dateString}T12:00:00`;

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(normalizeDate(dateString));
    return new Intl.DateTimeFormat('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const PsychologistAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [message, setMessage] = useState('');

    const loadAppointments = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/psychologist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setAppointments(data.appointments || []);
            } else {
                setError(data.message || 'Error al cargar las citas.');
            }
        } catch {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    const handleCancel = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setCancellingId(id);
        setMessage('');
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel-by-psychologist`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setMessage('Cita cancelada correctamente.');
                setAppointments((prev) =>
                    prev.map((appt) => (appt.id === id ? data.appointment : appt))
                );
            } else {
                setError(data.message || 'Error al cancelar la cita.');
            }
        } catch {
            setError('No se pudo conectar con el servidor.');
        } finally {
            setCancellingId(null);
        }
    };

    const pending = appointments.filter((a) => a.status === 'Agendada');
    const cancelled = appointments.filter((a) => a.status === 'Cancelada');

    if (loading) {
        return (
            <div className="psych-appt-shell">
                <p className="psych-appt-loading">Cargando citas...</p>
            </div>
        );
    }

    return (
        <div className="psych-appt-shell">
            <div className="psych-appt-eyebrow">Panel de psicólogo</div>
            <h2 className="psych-appt-title">Mis citas agendadas</h2>
            <p className="psych-appt-subtitle">
                Resumen de citas reservadas por clientes. Puedes cancelar una cita si es necesario;
                el cliente sera notificado en su dashboard.
            </p>

            {message && <div className="psych-appt-msg success">{message}</div>}
            {error && <div className="psych-appt-msg error">{error}</div>}

            <section className="psych-appt-section">
                <h3 className="psych-appt-section-title">
                    Citas pendientes
                    <span className="psych-appt-badge pending">{pending.length}</span>
                </h3>

                {pending.length === 0 ? (
                    <p className="psych-appt-empty">No tienes citas pendientes.</p>
                ) : (
                    <div className="psych-appt-table-wrapper">
                        <table className="psych-appt-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Notas</th>
                                    <th>Accion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map((appt) => (
                                    <tr key={appt.id}>
                                        <td>
                                            <span className="psych-client-name">{appt.clientName}</span>
                                            <span className="psych-client-email">{appt.clientEmail}</span>
                                        </td>
                                        <td>{formatDate(appt.date)}</td>
                                        <td>{appt.time}</td>
                                        <td>{appt.notes || <span className="psych-no-notes">Sin notas</span>}</td>
                                        <td>
                                            <button
                                                className="psych-cancel-btn"
                                                onClick={() => handleCancel(appt.id)}
                                                disabled={cancellingId === appt.id}
                                            >
                                                {cancellingId === appt.id ? 'Cancelando...' : 'Cancelar cita'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {cancelled.length > 0 && (
                <section className="psych-appt-section">
                    <h3 className="psych-appt-section-title">
                        Citas canceladas
                        <span className="psych-appt-badge cancelled">{cancelled.length}</span>
                    </h3>
                    <div className="psych-appt-table-wrapper">
                        <table className="psych-appt-table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Cancelada por</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cancelled.map((appt) => (
                                    <tr key={appt.id} className="cancelled-row">
                                        <td>
                                            <span className="psych-client-name">{appt.clientName}</span>
                                            <span className="psych-client-email">{appt.clientEmail}</span>
                                        </td>
                                        <td>{formatDate(appt.date)}</td>
                                        <td>{appt.time}</td>
                                        <td>
                                            <span className={`psych-cancelled-by ${appt.cancelledBy}`}>
                                                {appt.cancelledBy === 'psicologo' ? 'Psicologo' : 'Cliente'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

export default PsychologistAppointments;
