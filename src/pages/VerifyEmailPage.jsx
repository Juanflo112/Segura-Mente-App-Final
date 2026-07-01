import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo/Logo';
import './RegisterPage.css';
import API_BASE_URL from '../config/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verificando tu correo electrónico...');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevenir múltiples llamadas en desarrollo (React 18 StrictMode)
      if (verificationAttempted.current) {
        return;
      }
      verificationAttempted.current = true;

      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message || '¡Tu cuenta ha sido verificada exitosamente!');
          
          // Redirigir a la página de éxito después de 3 segundos
          setTimeout(() => {
            navigate('/success', { 
              state: { 
                email: data.data?.email,
                nombreUsuario: data.data?.nombreUsuario 
              } 
            });
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Error al verificar el correo electrónico');
        }
      } catch (error) {
        console.error('Error al verificar email:', error);
        setStatus('error');
        setMessage('Error al conectar con el servidor. Por favor intenta nuevamente.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

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
          <div className="verification-container" style={{ textAlign: 'center', padding: '40px' }}>
            {status === 'verifying' && (
              <>
                <div className="spinner" style={{
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #4CAF50',
                  borderRadius: '50%',
                  width: '50px',
                  height: '50px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }}></div>
                <h2>{message}</h2>
              </>
            )}

            {status === 'success' && (
              <>
                <div style={{ fontSize: '60px', marginBottom: '20px', color: '#4CAF50' }}>✓</div>
                <h2 style={{ color: '#4CAF50' }}>{message}</h2>
                <p>Redirigiendo a la página de éxito...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div style={{ fontSize: '60px', marginBottom: '20px', color: '#f44336' }}>✗</div>
                <h2 style={{ color: '#f44336' }}>{message}</h2>
                <button 
                  onClick={() => navigate('/register')}
                  style={{
                    marginTop: '20px',
                    padding: '10px 30px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Volver al registro
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="register-footer"></footer>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailPage;
