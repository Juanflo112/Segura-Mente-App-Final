import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo/Logo';
import './RegisterPage.css';
import API_BASE_URL from '../config/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Se ha enviado un correo con instrucciones para recuperar tu contraseña. Por favor revisa tu bandeja de entrada.');
        setEmail('');
      } else {
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al conectar con el servidor. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="forgot-password-form">
            <h2>Recuperar Contraseña</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Escribe tu correo registrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    marginTop: '8px'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  backgroundColor: '#ffe6e6',
                  color: '#d32f2f',
                  padding: '12px',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {message && (
                <div style={{
                  backgroundColor: '#e7f5e7',
                  color: '#2e7d32',
                  padding: '12px',
                  borderRadius: '5px',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isLoading ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  marginTop: '10px'
                }}
              >
                {isLoading ? 'Enviando...' : 'Enviar Correo de recuperación'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4CAF50',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'underline'
                }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="register-footer"></footer>
    </div>
  );
};

export default ForgotPasswordPage;
