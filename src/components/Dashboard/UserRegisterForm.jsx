import React, { useState } from 'react';
import './UserRegisterForm.css';
import eyeOpen from '../../assets/icons/eye-open.svg';
import eyeClosed from '../../assets/icons/eye-closed.svg';
import iconoAtras from '../../assets/icons/Atras.svg';
import API_BASE_URL from '../../config/api';

const UserRegisterForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    tipoIdentificacion: 'CC',
    identificacion: '',
    fechaNacimiento: '',
    telefono: '',
    direccion: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'Cliente',
    formacionProfesional: '',
    tarjetaProfesional: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpiar campos de empleado si se selecciona Cliente
    if (name === 'tipoUsuario' && value === 'Cliente') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        formacionProfesional: '',
        tarjetaProfesional: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar formato de contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, un número y un símbolo');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nombre_usuario: formData.nombreUsuario,
          tipo_identificacion: formData.tipoIdentificacion,
          identificacion: formData.identificacion,
          fecha_nacimiento: formData.fechaNacimiento,
          telefono: formData.telefono,
          direccion: formData.direccion,
          tipo_usuario: formData.tipoUsuario,
          formacion_profesional: formData.formacionProfesional || null,
          tarjeta_profesional: formData.tarjetaProfesional || null,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay errores de validación del backend, formatearlos
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => `• ${err.message}`).join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
        throw new Error(data.message || 'Error al crear usuario');
      }

      alert('Usuario creado correctamente');
      if (onSave) {
        onSave(data.user);
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-register-form-container">
      <div className="form-header">
        <button className="back-button" onClick={onCancel} type="button">
          <img src={iconoAtras} alt="Atrás" className="back-icon" />
          <span>Atrás</span>
        </button>
        <h2 className="form-title">REGISTRAR NUEVO USUARIO</h2>
      </div>

      <form className="user-register-form" onSubmit={handleSubmit}>
        {error && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            borderRadius: '4px', 
            marginBottom: '15px',
            whiteSpace: 'pre-line',
            border: '1px solid #ef5350'
          }}>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="nombreUsuario">Nombre de usuario</label>
          <input
            type="text"
            id="nombreUsuario"
            name="nombreUsuario"
            placeholder="Escribe el nombre de usuario"
            value={formData.nombreUsuario}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group form-group-large">
            <label htmlFor="identificacion">Documento de identificación</label>
            <input
              type="text"
              id="identificacion"
              name="identificacion"
              placeholder="Número de identificación"
              value={formData.identificacion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group form-group-small">
            <label htmlFor="tipoIdentificacion">Tipo</label>
            <select
              id="tipoIdentificacion"
              name="tipoIdentificacion"
              value={formData.tipoIdentificacion}
              onChange={handleChange}
              required
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
            <input
              type="date"
              id="fechaNacimiento"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              placeholder="Número de teléfono"
              value={formData.telefono}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            placeholder="Dirección completa"
            value={formData.direccion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipoUsuario">Tipo de Usuario</label>
          <select
            id="tipoUsuario"
            name="tipoUsuario"
            value={formData.tipoUsuario}
            onChange={handleChange}
            required
          >
            <option value="Cliente">Cliente</option>
            <option value="Psicólogo/empleado">Psicólogo/empleado</option>
          </select>
        </div>

        {/* Campos adicionales para Empleado */}
        {formData.tipoUsuario === 'Psicólogo/empleado' && (
          <div className="employee-fields">
            <div className="form-group">
              <label htmlFor="formacionProfesional">Formación profesional (Título)</label>
              <input
                type="text"
                id="formacionProfesional"
                name="formacionProfesional"
                placeholder="Ej: Psicólogo Clínico"
                value={formData.formacionProfesional}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tarjetaProfesional">Número de tarjeta profesional</label>
              <input
                type="text"
                id="tarjetaProfesional"
                name="tarjetaProfesional"
                placeholder="Número de tarjeta profesional"
                value={formData.tarjetaProfesional}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="password">Crea una contraseña</label>
          <p className="password-hint">
            De mínimo 8 caracteres y deben incluir símbolos, al menos una mayúscula y al menos un número
          </p>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              placeholder="Crea una contraseña"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Mostrar u ocultar contraseña"
            >
              <img 
                src={showPassword ? eyeOpen : eyeClosed} 
                alt={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirma tu contraseña</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirma tu contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Mostrar u ocultar confirmación de contraseña"
            >
              <img 
                src={showConfirmPassword ? eyeOpen : eyeClosed} 
                alt={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              />
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Creando...' : 'Crear nuevo usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserRegisterForm;