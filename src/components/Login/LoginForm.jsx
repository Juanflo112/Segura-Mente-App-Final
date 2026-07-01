import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import eyeOpen from '../../assets/icons/eye-open.svg';
import eyeClosed from '../../assets/icons/eye-closed.svg';
import API_BASE_URL from '../../config/api';


const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que se hayan ingresado email y contraseña
    if (!email || !password) {
      alert('Por favor, ingresa tu correo y contraseña');
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);

    try {
      // Enviar petición al backend
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        console.log('Login exitoso:', data);

        // Guardar información del usuario en localStorage
        const userData = {
          email: data.user.email,
          nombreUsuario: data.user.nombreUsuario, // Nombre de usuario real de la BD
          tipoUsuario: data.user.tipoUsuario || data.user.tipo_usuario || 'Cliente',
          token: data.token
        };

        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', data.token);

        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        // Redirigir al dashboard usando replace para evitar volver al login con el botón atrás
        navigate('/dashboard', { replace: true });
      } else {
        // Manejar errores específicos
        if (data.emailNotVerified) {
          alert('Por favor verifica tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
        } else {
          alert(data.message || 'Error al iniciar sesión');
        }
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('Error al conectar con el servidor. Por favor verifica que el backend esté funcionando.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h1 className="welcome-title">¡Te damos la bienvenida!</h1>
      <p className="welcome-subtitle">
        Ingresa tus datos para acceder a <span className="brand-name">SEGURA-MENTE</span>
      </p>

      <div className="form-group">
        <label htmlFor="email">Correo Electrónico</label>
        <input
          type="email"
          id="email"
          placeholder="Escribe tu correo de registro aquí"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Contraseña</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Escribe tu contraseña aquí"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            <img
              src={showPassword ? eyeClosed : eyeOpen}
              alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            />
          </button>
        </div>
      </div>

      <div className="form-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Recuérdame
        </label>
      </div>

      <div className="form-links">
        <a href="/registro" className="link">¿Aún no estas registrado?</a>
        <a href="/forgot-password" className="link">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
};

export default LoginForm;