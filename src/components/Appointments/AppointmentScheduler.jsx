import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config/api';
import './AppointmentScheduler.css';

const TIME_SLOTS = ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'];

const todayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const normalizeDate = (dateString) => `${dateString}T12:00:00`;

const formatFullDate = (dateString) => {
    const date = new Date(normalizeDate(dateString));
    return new Intl.DateTimeFormat('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const formatShortDate = (dateString) => {
    const date = new Date(normalizeDate(dateString));
    return new Intl.DateTimeFormat('es-CO', {
        day: 'numeric',
        month: 'short'
    }).format(date);
};

const formatMonthTitle = (date) => {
    return new Intl.DateTimeFormat('es-CO', {
        month: 'long',
        year: 'numeric'
    }).format(date);
};

const formatWeekday = (dateString) => {
    const date = new Date(normalizeDate(dateString));
    return new Intl.DateTimeFormat('es-CO', { weekday: 'short' }).format(date);
};

const getMonthCells = (monthOffset) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset + 1, 0);
    const leadingEmptyCells = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const cells = [];
    for (let index = 0; index < leadingEmptyCells; index += 1) {
        cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const date = new Date(today.getFullYear(), today.getMonth() + monthOffset, day);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayOfMonth = String(date.getDate()).padStart(2, '0');
        cells.push(`${year}-${month}-${dayOfMonth}`);
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    return cells;
};

const AppointmentScheduler = () => {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [psychologists, setPsychologists] = useState([]);
    const [loadingPsychologists, setLoadingPsychologists] = useState(true);
    const [loadingAppointments, setLoadingAppointments] = useState(true);
    const [monthOffset, setMonthOffset] = useState(0);
    const [selectedDate, setSelectedDate] = useState(todayDateString());
    const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
    const [selectedPsychologistEmail, setSelectedPsychologistEmail] = useState('');
    const [notes, setNotes] = useState('');
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            navigate('/login', { replace: true });
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            setCurrentUser(parsedUser);
        } catch (parseError) {
            console.error('Error leyendo userData:', parseError);
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const loadAppointments = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoadingAppointments(false);
                return;
            }
            try {
                const response = await fetch(`${API_BASE_URL}/appointments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setAppointments(data.appointments || []);
                }
            } catch (loadError) {
                console.error('Error cargando citas:', loadError);
            } finally {
                setLoadingAppointments(false);
            }
        };
        loadAppointments();
    }, []);

    useEffect(() => {
        const loadPsychologists = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoadingPsychologists(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'No fue posible cargar los psicólogos');
                }

                const psychologistsList = (data.users || [])
                    .filter((user) => String(user.tipo_usuario || '').toLowerCase().includes('psic'))
                    .filter((user) => user.verificado !== false)
                    .map((user) => ({
                        email: user.email,
                        name: user.nombre_usuario,
                        specialty: user.formacion_profesional || 'Psicólogo/a',
                        phone: user.telefono || ''
                    }));

                setPsychologists(psychologistsList);
            } catch (loadError) {
                console.error('Error cargando psicólogos:', loadError);
                setError('No fue posible cargar la lista de psicólogos registrados.');
            } finally {
                setLoadingPsychologists(false);
            }
        };

        loadPsychologists();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            return;
        }

        const availablePsychologists = getAvailablePsychologists(selectedDate, selectedTime);
        if (availablePsychologists.length === 0) {
            setSelectedPsychologistEmail('');
            return;
        }

        const stillAvailable = availablePsychologists.some((psychologist) => psychologist.email === selectedPsychologistEmail);
        if (!stillAvailable) {
            setSelectedPsychologistEmail(availablePsychologists[0].email);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate, selectedTime, appointments, psychologists, currentUser, editingAppointmentId]);

    const clientEmail = currentUser?.email || '';
    const clientName = currentUser?.nombreUsuario || currentUser?.nombre || 'Usuario';
    const clientAppointments = useMemo(
        () => appointments
            .filter((appointment) => appointment.clientEmail === clientEmail)
            .sort((first, second) => `${first.date} ${first.time}`.localeCompare(`${second.date} ${second.time}`)),
        [appointments, clientEmail]
    );

    const activeAppointments = clientAppointments.filter((appointment) => appointment.status === 'Agendada');
    const editingAppointment = appointments.find((appointment) => appointment.id === editingAppointmentId) || null;
    const selectedMonthDate = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1);
    const monthCells = getMonthCells(monthOffset);
    const canCreateNewAppointment = editingAppointmentId || activeAppointments.length < 2;
    const availablePsychologists = getAvailablePsychologists(selectedDate, selectedTime);
    const availableSlots = getAvailableSlots(selectedDate);

    function getAppointmentsForSlot(date, time) {
        return appointments.filter((appointment) => (
            appointment.date === date
            && appointment.time === time
            && appointment.status === 'Agendada'
            && appointment.id !== editingAppointmentId
        ));
    }

    function getAvailablePsychologists(date, time) {
        if (!psychologists.length) {
            return [];
        }

        const appointmentsForSlot = getAppointmentsForSlot(date, time);
        return psychologists.filter((psychologist) => (
            !appointmentsForSlot.some((appointment) => appointment.psychologistEmail === psychologist.email)
        ));
    }

    function getAvailableSlots(date) {
        if (!psychologists.length) {
            return TIME_SLOTS;
        }

        return TIME_SLOTS.filter((time) => getAvailablePsychologists(date, time).length > 0);
    }

    const reloadAppointments = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/appointments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAppointments(data.appointments || []);
            }
        } catch (reloadError) {
            console.error('Error recargando citas:', reloadError);
        }
    };

    const clearForm = () => {
        setEditingAppointmentId(null);
        setSelectedDate(todayDateString());
        setSelectedTime(TIME_SLOTS[0]);
        setNotes('');
        setMessage('');
        setError('');
        setMonthOffset(0);
        setSelectedPsychologistEmail('');
    };

    const handlePreviousMonth = () => {
        setMonthOffset((current) => Math.max(0, current - 1));
    };

    const handleNextMonth = () => {
        setMonthOffset((current) => Math.min(2, current + 1));
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setMessage('');
        setError('');
    };

    const handleSlotSelect = (slot) => {
        setSelectedTime(slot);
        setMessage('');
        setError('');
    };

    const handlePsychologistSelect = (psychologistEmail) => {
        setSelectedPsychologistEmail(psychologistEmail);
        setMessage('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');

        if (!clientEmail) {
            setError('No fue posible identificar al cliente. Inicia sesión nuevamente.');
            return;
        }

        if (!selectedDate || !selectedTime || !selectedPsychologistEmail) {
            setError('Selecciona una fecha, una hora y un psicólogo disponible para continuar.');
            return;
        }

        if (!editingAppointmentId && activeAppointments.length >= 2) {
            setError('No puedes agendar más de dos citas activas al mismo tiempo.');
            return;
        }

        if (!availablePsychologists.some((psychologist) => psychologist.email === selectedPsychologistEmail)) {
            setError('El psicólogo seleccionado ya no está disponible para esa fecha y hora.');
            return;
        }

        const selectedPsychologist = psychologists.find((psychologist) => psychologist.email === selectedPsychologistEmail);
        const token = localStorage.getItem('token');
        const payload = {
            date: selectedDate,
            time: selectedTime,
            psychologistEmail: selectedPsychologistEmail,
            psychologistName: selectedPsychologist?.name || 'Psicólogo/a',
            psychologistSpecialty: selectedPsychologist?.specialty || 'Psicólogo/a',
            notes: notes.trim()
        };

        try {
            const url = editingAppointmentId
                ? `${API_BASE_URL}/appointments/${editingAppointmentId}`
                : `${API_BASE_URL}/appointments`;
            const method = editingAppointmentId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'No fue posible guardar la cita.');
                return;
            }

            await reloadAppointments();
            setMessage(editingAppointmentId ? 'Tu cita fue actualizada correctamente.' : 'Tu cita fue agendada correctamente.');
            clearForm();
        } catch (submitError) {
            console.error('Error al guardar cita:', submitError);
            setError('Error de conexión. Verifica que el servidor esté disponible.');
        }
    };

    const handleEditAppointment = (appointment) => {
        setEditingAppointmentId(appointment.id);
        setSelectedDate(appointment.date);
        setSelectedTime(appointment.time);
        setSelectedPsychologistEmail(appointment.psychologistEmail);
        setNotes(appointment.notes || '');
        setMessage('');
        setError('');

        const currentMonth = new Date().getMonth();
        const appointmentMonth = new Date(normalizeDate(appointment.date)).getMonth();
        const monthDifference = Math.max(0, Math.min(2, appointmentMonth - currentMonth));
        setMonthOffset(monthDifference);
    };

    const handleCancelAppointment = async (appointmentId) => {
        const confirmed = window.confirm('¿Deseas cancelar esta cita?');
        if (!confirmed) {
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'No fue posible cancelar la cita.');
                return;
            }
            await reloadAppointments();
            setMessage('La cita fue cancelada correctamente.');
            if (editingAppointmentId === appointmentId) {
                clearForm();
            }
        } catch (cancelError) {
            console.error('Error al cancelar cita:', cancelError);
            setError('Error de conexión. Verifica que el servidor esté disponible.');
        }
    };

    const isDateDisabled = (dateString) => {
        const today = todayDateString();
        return dateString < today;
    };

    const appointmentCountForDate = (dateString) => {
        return getAvailableSlots(dateString).length;
    };

    if (!currentUser) {
        return null;
    }

    return (
        <div className="appointment-view-shell">
            <div className="appointment-header">
                <div>
                    <p className="appointment-eyebrow">Gestión de agendamiento</p>
                    <h2 className="appointment-title">Agenda tu cita con Segura-Mente</h2>
                    <p className="appointment-subtitle">
                        Selecciona una fecha, revisa los horarios disponibles y reserva con un psicólogo disponible.
                    </p>
                </div>

                <div className="appointment-summary-row">
                    <article className="summary-card">
                        <span className="summary-label">Citas activas</span>
                        <strong className="summary-value">{activeAppointments.length}/2</strong>
                    </article>
                    <article className="summary-card">
                        <span className="summary-label">Psicólogos cargados</span>
                        <strong className="summary-value">{loadingPsychologists ? '...' : psychologists.length}</strong>
                    </article>
                    <article className="summary-card">
                        <span className="summary-label">Fecha seleccionada</span>
                        <strong className="summary-value summary-date">{formatShortDate(selectedDate)}</strong>
                    </article>
                </div>
            </div>

            {error && <div className="appointment-alert error">{error}</div>}
            {message && <div className="appointment-alert success">{message}</div>}

            <div className="appointment-layout">
                <section className="appointment-main-column">
                    <div className="appointment-card calendar-card">
                        <div className="card-header">
                            <div>
                                <h3>Calendario de citas disponibles</h3>
                                <p>Elige una fecha futura y revisa la disponibilidad por horario.</p>
                            </div>
                            <div className="calendar-actions">
                                <button type="button" className="calendar-nav-button" onClick={handlePreviousMonth} disabled={monthOffset === 0}>
                                    ←
                                </button>
                                <span className="calendar-month-label">{formatMonthTitle(selectedMonthDate)}</span>
                                <button type="button" className="calendar-nav-button" onClick={handleNextMonth} disabled={monthOffset === 2}>
                                    →
                                </button>
                            </div>
                        </div>

                        <div className="calendar-weekdays">
                            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((weekday) => (
                                <span key={weekday}>{weekday}</span>
                            ))}
                        </div>

                        <div className="calendar-grid">
                            {monthCells.map((cell, index) => {
                                if (!cell) {
                                    return <span key={`empty-${index}`} className="calendar-empty-cell" />;
                                }

                                const isSelected = cell === selectedDate;
                                const disabled = isDateDisabled(cell);
                                const availableCount = appointmentCountForDate(cell);

                                return (
                                    <button
                                        key={cell}
                                        type="button"
                                        className={`calendar-day ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                                        onClick={() => !disabled && handleDateSelect(cell)}
                                        disabled={disabled}
                                    >
                                        <span className="calendar-day-number">{new Date(normalizeDate(cell)).getDate()}</span>
                                        <span className="calendar-day-name">{formatWeekday(cell)}</span>
                                        <span className="calendar-day-availability">{availableCount} horarios</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="appointment-card slot-card">
                        <div className="card-header">
                            <div>
                                <h3>Horarios disponibles</h3>
                                <p>{formatFullDate(selectedDate)}</p>
                            </div>
                            <span className="slot-hint">Disponible para reserva inmediata</span>
                        </div>

                        <div className="slot-list">
                            {availableSlots.length === 0 && (
                                <p className="empty-state">No hay horarios disponibles para esta fecha.</p>
                            )}

                            {availableSlots.map((slot) => {
                                const isSelected = slot === selectedTime;
                                return (
                                    <button
                                        key={slot}
                                        type="button"
                                        className={`slot-button ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSlotSelect(slot)}
                                    >
                                        <span className="slot-hour">{slot}</span>
                                        <span className="slot-note">Seleccionar</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <form className="appointment-card form-card" onSubmit={handleSubmit}>
                        <div className="card-header">
                            <div>
                                <h3>{editingAppointmentId ? 'Modificar cita reservada' : 'Reservar una nueva cita'}</h3>
                                <p>
                                    {editingAppointmentId
                                        ? 'Puedes cambiar la fecha, la hora o el psicólogo asignado.'
                                        : 'Completa los campos para apartar una cita nueva.'}
                                </p>
                            </div>
                            <button type="button" className="ghost-button" onClick={clearForm}>
                                Limpiar formulario
                            </button>
                        </div>

                        {!editingAppointmentId && activeAppointments.length >= 2 && (
                            <div className="booking-limit-warning">
                                Ya tienes dos citas activas. Debes cancelar o modificar una para agendar otra.
                            </div>
                        )}

                        <div className="form-grid">
                            <div className="field-block">
                                <label>Fecha seleccionada</label>
                                <div className="selected-badge">{formatFullDate(selectedDate)}</div>
                            </div>

                            <div className="field-block">
                                <label>Horario seleccionado</label>
                                <div className="selected-badge">{selectedTime || 'Selecciona un horario'}</div>
                            </div>
                        </div>

                        <div className="field-block">
                            <label>Psicólogos disponibles</label>
                            {loadingPsychologists ? (
                                <div className="loading-box">Cargando psicólogos...</div>
                            ) : availablePsychologists.length === 0 ? (
                                <div className="loading-box warning">No hay psicólogos disponibles para ese horario.</div>
                            ) : (
                                <div className="psychologist-grid">
                                    {availablePsychologists.map((psychologist) => {
                                        const isSelected = psychologist.email === selectedPsychologistEmail;
                                        return (
                                            <button
                                                key={psychologist.email}
                                                type="button"
                                                className={`psychologist-card ${isSelected ? 'selected' : ''}`}
                                                onClick={() => handlePsychologistSelect(psychologist.email)}
                                            >
                                                <strong>{psychologist.name}</strong>
                                                <span>{psychologist.specialty}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="field-block">
                            <label htmlFor="appointment-notes">Observaciones opcionales</label>
                            <textarea
                                id="appointment-notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Escribe una observación breve para la cita"
                                rows={4}
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="primary-button" disabled={!canCreateNewAppointment && !editingAppointmentId}>
                                {editingAppointmentId ? 'Actualizar cita' : 'Agendar cita'}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="appointment-side-column">
                    <div className="appointment-card info-card">
                        <div className="card-header compact">
                            <div>
                                <h3>Mis citas reservadas</h3>
                                <p>{clientName}</p>
                            </div>
                        </div>

                        {clientAppointments.length === 0 ? (
                            <p className="empty-state">Aún no tienes citas registradas.</p>
                        ) : (
                            <div className="appointment-list">
                                {clientAppointments.map((appointment) => (
                                    <article key={appointment.id} className="appointment-item">
                                        <div className="appointment-item-header">
                                            <div>
                                                <h4>{formatShortDate(appointment.date)} · {appointment.time}</h4>
                                                <p>{appointment.psychologistName}</p>
                                            </div>
                                            <span className={`status-pill ${appointment.status === 'Agendada' ? 'active' : 'cancelled'}`}>
                                                {appointment.status}
                                                {appointment.status === 'Cancelada' && appointment.cancelledBy === 'psicologo' && (
                                                    <span className="cancelled-by-badge"> · cancelada por el psicologo</span>
                                                )}
                                            </span>
                                        </div>
                                        <small>{appointment.psychologistSpecialty}</small>
                                        {appointment.notes && <p className="appointment-notes">{appointment.notes}</p>}
                                        <div className="appointment-item-actions">
                                            {appointment.status === 'Agendada' && (
                                                <button type="button" className="small-button" onClick={() => handleEditAppointment(appointment)}>
                                                    Modificar
                                                </button>
                                            )}
                                            {appointment.status === 'Agendada' && (
                                                <button type="button" className="small-button danger" onClick={() => handleCancelAppointment(appointment.id)}>
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="appointment-card info-card">
                        <div className="card-header compact">
                            <div>
                                <h3>Disponibilidad actual</h3>
                                <p>Fecha: {formatFullDate(selectedDate)}</p>
                            </div>
                        </div>

                        <div className="availability-breakdown">
                            <div>
                                <span>Horarios habilitados</span>
                                <strong>{availableSlots.length}</strong>
                            </div>
                            <div>
                                <span>Psicólogos disponibles</span>
                                <strong>{availablePsychologists.length}</strong>
                            </div>
                            <div>
                                <span>Citas activas</span>
                                <strong>{activeAppointments.length}/2</strong>
                            </div>
                        </div>

                        <div className="psychologist-mini-list">
                            {psychologists.length === 0 ? (
                                <p className="empty-state">No hay psicólogos cargados todavía.</p>
                            ) : (
                                psychologists.map((psychologist) => {
                                    const isAvailable = availablePsychologists.some((item) => item.email === psychologist.email);
                                    return (
                                        <div key={psychologist.email} className={`psychologist-mini-card ${isAvailable ? 'available' : 'busy'}`}>
                                            <div>
                                                <strong>{psychologist.name}</strong>
                                                <p>{psychologist.specialty}</p>
                                            </div>
                                            <span>{isAvailable ? 'Disponible' : 'Ocupado'}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default AppointmentScheduler;
