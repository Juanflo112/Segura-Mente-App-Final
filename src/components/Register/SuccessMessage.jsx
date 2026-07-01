import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './SuccessMessage.css';

const SuccessMessage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message || 'Tu cuenta ha sido creada exitosamente.';

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="success-message-wrapper">
      <div className="success-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#A6D885"/>
        </svg>
      </div>
      
      <h2 className="success-title">
        ¡Cuenta creada exitosamente!
      </h2>
      
      <p className="success-text">
        {message}
      </p>
      
      <p className="success-instruction">
        Ya puedes iniciar sesión en <span className="brand-segura">SEGURA</span><span className="brand-mente">-MENTE</span> con tu correo y contraseña.
      </p>
      
      <button type="button" className="login-button" onClick={handleGoToLogin}>
        Ir a Iniciar Sesión
      </button>
    </div>
  );
};

export default SuccessMessage;