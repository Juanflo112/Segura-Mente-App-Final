import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personalizado para manejar cierre automático de sesión por inactividad
 * 
 * @param {number} timeoutMinutes - Tiempo de inactividad en minutos antes de cerrar sesión
 * @param {number} warningMinutes - Tiempo en minutos para mostrar advertencia antes de cerrar
 * @returns {object} - { showWarning, remainingTime, resetTimer }
 */
const useSessionTimeout = (timeoutMinutes = 5, warningMinutes = 1) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Convertir minutos a milisegundos
  const timeoutMs = timeoutMinutes * 60 * 1000;
  const warningMs = warningMinutes * 60 * 1000;

  /**
   * Cerrar sesión y limpiar datos
   */
  const logout = useCallback(() => {
    console.log('Cerrando sesión por inactividad...');
    
    // Limpiar localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    
    // Limpiar timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    // Redirigir al login
    navigate('/login');
  }, [navigate]);

  /**
   * Reiniciar el temporizador de inactividad
   */
  const resetTimer = useCallback(() => {
    // Limpiar timeouts existentes
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    
    // Ocultar advertencia si estaba visible
    setShowWarning(false);
    setRemainingTime(0);

    // Configurar advertencia (opcional)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingTime(warningMinutes * 60); // segundos
      
      // Contador regresivo para la advertencia
      const countdownInterval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, timeoutMs - warningMs);

    // Configurar cierre de sesión automático
    timeoutRef.current = setTimeout(() => {
      logout();
    }, timeoutMs);
  }, [logout, timeoutMs, warningMs, warningMinutes]);

  /**
   * Detectar eventos de actividad del usuario
   */
  useEffect(() => {
    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',    // Click del mouse
      'mousemove',    // Movimiento del mouse
      'keypress',     // Tecla presionada
      'scroll',       // Scroll
      'touchstart',   // Touch en dispositivos móviles
      'click'         // Click
    ];

    // Agregar listeners para todos los eventos
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Iniciar el temporizador
    resetTimer();

    // Cleanup: remover listeners al desmontar
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [resetTimer]);

  return {
    showWarning,      // Boolean: si debe mostrar advertencia
    remainingTime,    // Número: segundos restantes antes de cerrar
    resetTimer        // Función: reiniciar manualmente el temporizador
  };
};

export default useSessionTimeout;
