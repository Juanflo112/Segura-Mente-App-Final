import React from 'react';
import { useLocation } from 'react-router-dom';
import Logo from '../components/Logo/Logo';
import VerificationMessage from '../components/Register/VerificationMessage';
import './RegisterPage.css';

const VerificationPage = () => {
  const location = useLocation();
  // Obtener el email desde el estado de navegación
  const userEmail = location.state?.email || "usuario@ejemplo.com";

  return (
    <div className="register-page">
     
      <header className="register-header">
        <div className="logo-container">
          <Logo />
        </div>
      </header>
      
      <main className="register-main">
        <div className="register-background-image"></div>
        <div className="register-form-container">
          <VerificationMessage email={userEmail} />
        </div>
      </main>

 
      <footer className="register-footer">
      </footer>
    </div>
  );
};

export default VerificationPage;