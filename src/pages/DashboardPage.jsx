import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import UserList from '../components/Dashboard/UserList';
import UserEditForm from '../components/Dashboard/UserEditForm';
import UserRegisterForm from '../components/Dashboard/UserRegisterForm';
import AppointmentScheduler from '../components/Appointments/AppointmentScheduler';
import PsychologistAppointments from '../components/Appointments/PsychologistAppointments';
import SessionWarning from '../components/SessionWarning';
import useSessionTimeout from '../hooks/useSessionTimeout';
import './DashboardPage.css';

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [selectedUser, setSelectedUser] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [emailUsuario, setEmailUsuario] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('');
  const timeoutRef = useRef(null);

  const ADMIN_EMAIL = 'administrador@seguramente.com';
  const ADMIN_USERNAME = 'administrador';

  // Hook de control de sesión - 5 minutos de inactividad, advertencia 1 minuto antes
  const { showWarning, remainingTime, resetTimer } = useSessionTimeout(5, 1);

  // Obtener información del usuario al cargar el componente
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      setNombreUsuario(user.nombreUsuario || user.nombre || 'Usuario');
      setEmailUsuario(user.email || '');
      setTipoUsuario(user.tipoUsuario || '');
    }
  }, []);

  const isAdmin =
    emailUsuario.toLowerCase() === ADMIN_EMAIL &&
    nombreUsuario.toLowerCase() === ADMIN_USERNAME;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Limpiar timeout al hacer toggle manual
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleSidebarInteraction = () => {
    // Cancelar cualquier timeout existente cuando hay interacción
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Asegurar que el sidebar esté abierto
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    // Cerrar inmediatamente al quitar el mouse
    setSidebarOpen(false);
  };

  const handleMenuClick = (option) => {
    setCurrentView(option);
    setSelectedUser(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setCurrentView('edit-form');
  };

  const handleSaveUser = (userData) => {
    // La actualización ya se hizo en el componente, solo volver a la lista
    setCurrentView('editar');
    setSelectedUser(null);
  };

  const handleRegisterUser = (userData) => {
    // El registro ya se hizo en el componente, solo volver al home
    setCurrentView('home');
  };

  const handleCancelEdit = () => {
    setCurrentView('editar');
    setSelectedUser(null);
  };

  const handleCancelRegister = () => {
    setCurrentView('home');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedUser(null);
  };

  useEffect(() => {
    // Limpiar timeout al desmontar
    const timeout = timeoutRef.current;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'editar':
        return (
          <UserList
            onEditUser={handleEditUser}
            onBack={handleBackToHome}
            adminEmail={ADMIN_EMAIL}
          />
        );
      case 'edit-form':
        return (
          <UserEditForm
            user={selectedUser}
            onSave={handleSaveUser}
            onCancel={handleCancelEdit}
          />
        );
      case 'registrar':
        return (
          <UserRegisterForm
            onSave={handleRegisterUser}
            onCancel={handleCancelRegister}
          />
        );
      case 'citas':
        return tipoUsuario === 'Psicólogo/empleado'
          ? <PsychologistAppointments />
          : <AppointmentScheduler />;
      default:
        return (
          <div className="content-area">
            <h2 className="content-title">
              Bienvenido/a {nombreUsuario && <span>{nombreUsuario}</span>} a <span className="brand-segura">SEGURA</span>
              <span className="brand-mente">-MENTE</span>
            </h2>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header-top">
        <div className="header-pattern"></div>
        <div className="logo-container-round">
          <img
            src={require('../assets/images/LogoRedondo.png')}
            alt="Logo Segura-Mente"
            className="logo-round"
          />
        </div>
      </header>

      <div className="dashboard-container">
        <button
          className={`sidebar-toggle ${sidebarOpen ? 'open' : ''}`}
          onClick={toggleSidebar}
          aria-label="Abrir/Cerrar menú"
        >
          <span className="toggle-icon">☰</span>
        </button>

        <Sidebar
          isOpen={sidebarOpen}
          onInteraction={handleSidebarInteraction}
          onMenuClick={handleMenuClick}
          onMouseLeave={handleSidebarMouseLeave}
          isAdmin={isAdmin}
        />

        <main className={`dashboard-main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="dashboard-background">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modal de advertencia de sesión */}
      {showWarning && (
        <SessionWarning
          remainingTime={remainingTime}
          onContinue={resetTimer}
        />
      )}
    </div>
  );
};

export default DashboardPage;