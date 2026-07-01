import React from 'react';
import './SessionWarning.css';

/**
 * Componente de advertencia de sesión por expirar
 */
const SessionWarning = ({ remainingTime, onContinue }) => {
  // Formatear tiempo restante en MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="session-warning-overlay">
      <div className="session-warning-modal">
        <div className="session-warning-icon">⏰</div>
        
        <h2 className="session-warning-title">
          Sesión por expirar
        </h2>
        
        <p className="session-warning-message">
          Tu sesión se cerrará automáticamente por inactividad.
          <br />
          ¿Deseas continuar trabajando?
        </p>
        
        <div className="session-warning-timer">
          {formatTime(remainingTime)}
        </div>
        
        <p className="session-warning-timer-label">
          segundos restantes
        </p>
        
        <button 
          className="session-warning-button"
          onClick={onContinue}
        >
          Continuar sesión
        </button>
      </div>
    </div>
  );
};

export default SessionWarning;
