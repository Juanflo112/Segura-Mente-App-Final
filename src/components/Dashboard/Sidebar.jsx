import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import iconoCatalogo from '../../assets/icons/IconoCatalogo.svg';
import iconoGestionarUsuarios from '../../assets/icons/IconoGestionarUsuarios.svg';
import iconoCerrarSesion from '../../assets/icons/CerrarSesion.svg';
import iconoCrearUsuario from '../../assets/icons/CrearUsuario.svg';
import iconoActualizarUsuario from '../../assets/icons/ActualizarUsuario.svg';

const Sidebar = ({ isOpen, onInteraction, onMenuClick, onMouseLeave, isAdmin }) => {
  const navigate = useNavigate();
  const [showUserSubmenu, setShowUserSubmenu] = useState(false);

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    // Limpiar toda la información del usuario
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    // Navegar al login sin permitir volver atrás
    navigate('/login', { replace: true });
  };

  const handleMouseMove = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

  const handleClick = () => {
    if (onInteraction) {
      onInteraction();
    }
  };

  const handleMouseLeave = () => {
    if (onMouseLeave) {
      onMouseLeave();
    }
  };

  const toggleUserSubmenu = () => {
    setShowUserSubmenu(!showUserSubmenu);
  };

  const handleSubmenuClick = (option) => {
    if (onMenuClick) {
      onMenuClick(option);
    }
  };

  const handleAppointmentsClick = () => {
    navigate('/citas');
  };

  const handleSubmenuMouseEnter = () => {
    setShowUserSubmenu(true);
  };

  const handleSubmenuMouseLeave = () => {
    setShowUserSubmenu(false);
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'open' : 'closed'}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <div className="sidebar-content">
        <h2 className="welcome-titleS">¡Te damos la bienvenida!</h2>

        <nav className="sidebar-nav">
          <button className="nav-item" onClick={handleAppointmentsClick}>
            <img src={iconoCatalogo} alt="Agendamiento de citas" className="nav-icon-img" />
            <span className="nav-text">Gestionar agendamiento de citas</span>
          </button>

          {isAdmin && (
            <div
              className="nav-item-container"
              onMouseEnter={handleSubmenuMouseEnter}
              onMouseLeave={handleSubmenuMouseLeave}
            >
              <button className="nav-item" onClick={toggleUserSubmenu}>
                <img src={iconoGestionarUsuarios} alt="Usuarios" className="nav-icon-img" />
                <span className="nav-text">Gestionar usuarios</span>
                <span className={`submenu-arrow ${showUserSubmenu ? 'open' : ''}`}>▼</span>
              </button>

              {showUserSubmenu && (
                <div className="submenu">
                  <button
                    className="submenu-item"
                    onClick={() => handleSubmenuClick('registrar')}
                  >
                    <img src={iconoCrearUsuario} alt="Crear usuario" className="submenu-icon-img" />
                    <span className="submenu-text">Registrar nuevo usuario</span>
                  </button>
                  <button
                    className="submenu-item"
                    onClick={() => handleSubmenuClick('editar')}
                  >
                    <img src={iconoActualizarUsuario} alt="Actualizar usuario" className="submenu-icon-img" />
                    <span className="submenu-text">Editar usuarios</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      <button className="logout-button" onClick={handleLogout}>
        <img src={iconoCerrarSesion} alt="Cerrar sesión" className="logout-icon-img" />
        <span className="logout-text">Cerrar sesión</span>
      </button>
    </aside>
  );
};

export default Sidebar;