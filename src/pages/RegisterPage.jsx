import React from 'react';
import Logo from '../components/Logo/Logo';
import RegisterForm from '../components/Register/RegisterForm';
import './RegisterPage.css';

const RegisterPage = () => {
  return (
    <div className="register-page">
      {/* Header con Logo */}
      <header className="register-header">
        <div className="logo-container">
          <Logo />
        </div>
      </header>

      {/* Contenedor Central con imagen de fondo y formulario */}
      <main className="register-main">
        <div className="register-background-image"></div>
        <div className="register-form-container">
          <RegisterForm />
        </div>
      </main>

      {/* Footer con imagen de patron decorativo */}
      <footer className="register-footer">        
      </footer>
    </div>
  );
};

export default RegisterPage;