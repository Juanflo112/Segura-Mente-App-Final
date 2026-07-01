import React from 'react';
import Logo from '../components/Logo/Logo';
import SuccessMessage from '../components/Register/SuccessMessage';
import './RegisterPage.css';

const SuccessPage = () => {
  return (
    <div className="register-page">
      {/* Header con Logo */}
      <header className="register-header">
        <div className="logo-container">
          <Logo />
        </div>
      </header>

      {/* Contenedor Central con imagen de fondo y mensaje */}
      <main className="register-main">
        <div className="register-background-image"></div>
        <div className="register-form-container">
          <SuccessMessage />
        </div>
      </main>

      {/* Footer con patrón decorativo */}
      <footer className="register-footer">
      </footer>
    </div>
  );
};

export default SuccessPage;