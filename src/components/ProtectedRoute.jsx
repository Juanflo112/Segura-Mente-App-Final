import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');

  useEffect(() => {
    // Verificar continuamente si el token existe
    const checkAuth = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        navigate('/login', { replace: true });
      }
    };

    // Verificar cada segundo
    const interval = setInterval(checkAuth, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  // Si no hay token o datos de usuario, redirigir al login
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
