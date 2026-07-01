import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentScheduler from '../components/Appointments/AppointmentScheduler';
import PsychologistAppointments from '../components/Appointments/PsychologistAppointments';
import SessionWarning from '../components/SessionWarning';
import useSessionTimeout from '../hooks/useSessionTimeout';
import iconoCatalogo from '../assets/icons/IconoCatalogo.svg';
import iconoCerrarSesion from '../assets/icons/CerrarSesion.svg';
import './AppointmentPage.css';

const AppointmentPage = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [isPsychologist, setIsPsychologist] = useState(false);
    const timeoutRef = useRef(null);

    const { showWarning, remainingTime, resetTimer } = useSessionTimeout(5, 1);

    useEffect(() => {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            navigate('/login', { replace: true });
            return;
        }
        try {
            const user = JSON.parse(userData);
            setNombreUsuario(user.nombreUsuario || user.nombre || 'Usuario');
            setIsPsychologist(user.tipoUsuario === 'Psicólogo/empleado');
        } catch {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        const timeout = timeoutRef.current;
        return () => {
            if (timeout) clearTimeout(timeout);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const handleSidebarInteraction = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!sidebarOpen) setSidebarOpen(true);
    };

    const handleSidebarMouseLeave = () => {
        setSidebarOpen(false);
    };

    const handleBackToDashboard = () => {
        navigate('/dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberMe');
        navigate('/login', { replace: true });
    };

    return (
        <div className="appt-page">
            <header className="appt-page-header">
                <div className="header-pattern" />
                <div className="logo-container-round">
                    <img
                        src={require('../assets/images/LogoRedondo.png')}
                        alt="Logo Segura-Mente"
                        className="logo-round"
                    />
                </div>
            </header>

            <div className="appt-page-container">
                <button
                    className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
                    onClick={toggleSidebar}
                    aria-label="Abrir/Cerrar menú"
                >
                    <span className="toggle-icon">☰</span>
                </button>

                <aside
                    className={`appt-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
                    onMouseMove={handleSidebarInteraction}
                    onMouseEnter={handleSidebarInteraction}
                    onMouseLeave={handleSidebarMouseLeave}
                >
                    <div className="appt-sidebar-body">
                        <h2 className="appt-sidebar-title">¡Te damos la bienvenida!</h2>

                        <nav className="appt-sidebar-nav">
                            <button className="appt-nav-item appt-nav-active">
                                <img src={iconoCatalogo} alt="Citas" className="nav-icon-img" />
                                <span className="nav-text">Gestionar agendamiento de citas</span>
                            </button>

                            <button className="appt-nav-item" onClick={handleBackToDashboard}>
                                <span className="appt-nav-back-arrow">←</span>
                                <span className="nav-text">Volver al dashboard</span>
                            </button>
                        </nav>

                        {nombreUsuario && (
                            <p className="appt-sidebar-username">{nombreUsuario}</p>
                        )}
                    </div>

                    <button className="appt-logout-button" onClick={handleLogout}>
                        <img src={iconoCerrarSesion} alt="Cerrar sesión" className="logout-icon-img" />
                        <span className="logout-text">Cerrar sesión</span>
                    </button>
                </aside>

                <main className={`appt-page-main ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    <div className="appt-page-background">
                        {isPsychologist ? <PsychologistAppointments /> : <AppointmentScheduler />}
                    </div>
                </main>
            </div>

            {showWarning && (
                <SessionWarning
                    remainingTime={remainingTime}
                    onContinue={resetTimer}
                />
            )}
        </div>
    );
};

export default AppointmentPage;
