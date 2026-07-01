import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '../components/Logo/Logo';
import './RegisterPage.css';
import eyeOpen from '../assets/icons/eye-open.svg';
import eyeClosed from '../assets/icons/eye-closed.svg';
import API_BASE_URL from '../config/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de recuperación no encontrado. Por favor solicita un nuevo enlace.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = (pass) => {
    const errors = [];
    
    if (pass.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(pass)) {
      errors.push('Debe contener al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(pass)) {
      errors.push('Debe contener al menos una letra minúscula');
    }
    if (!/[0-9]/.test(pass)) {
      errors.push('Debe contener al menos un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      errors.push('Debe contener al menos un carácter especial (!@#$%^&*(),.?":{}|<>)');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de recuperación no válido');
      return;
    }

    // Validar contraseñas
    const validationErrors = validatePassword(password);
    if (validationErrors.length > 0) {
      setError(validationErrors.join('. '));
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword: password })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al conectar con el servidor. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px', color: '#4CAF50' }}>✓</div>
              <h2 style={{ color: '#4CAF50', marginBottom: '15px' }}>
                ¡Contraseña actualizada exitosamente!
              </h2>
              <p style={{ marginBottom: '30px', color: '#666' }}>
                Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '12px 40px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Ir a Inicio de Sesión
              </button>
            </div>
          </div>
        </main>

        <footer className="register-footer"></footer>
      </div>
    );
  }

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
          <div className="reset-password-form">
            <h2>Restablecer Contraseña</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Ingresa tu nueva contraseña. Debe cumplir con los requisitos de seguridad.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">Nueva Contraseña</label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Escribe tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '45px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      marginTop: '8px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px'
                    }}
                  >
                    <img 
                      src={showPassword ? eyeClosed : eyeOpen} 
                      alt="Toggle password"
                      style={{ width: '20px', height: '20px' }}
                    />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      paddingRight: '45px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      marginTop: '8px'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px'
                    }}
                  >
                    <img 
                      src={showConfirmPassword ? eyeClosed : eyeOpen} 
                      alt="Toggle password"
                      style={{ width: '20px', height: '20px' }}
                    />
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f0f8ff',
                padding: '12px',
                borderRadius: '5px',
                marginBottom: '15px',
                fontSize: '12px',
                color: '#555'
              }}>
                <strong>Requisitos de la contraseña:</strong>
                <ul style={{ marginTop: '8px', marginBottom: '0', paddingLeft: '20px' }}>
                  <li>Mínimo 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                  <li>Al menos un carácter especial (!@#$%^&*)</li>
                </ul>
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

              <button
                type="submit"
                disabled={isLoading || !token}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: isLoading || !token ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isLoading || !token ? 'not-allowed' : 'pointer',
                  marginTop: '10px'
                }}
              >
                {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
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

export default ResetPasswordPage;
