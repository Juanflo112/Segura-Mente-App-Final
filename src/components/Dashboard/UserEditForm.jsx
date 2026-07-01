import React, { useState, useEffect } from 'react';
import './UserEditForm.css';
import iconoAtras from '../../assets/icons/Atras.svg';
import API_BASE_URL from '../../config/api';

const UserEditForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    tipoIdentificacion: 'CC',
    identificacion: '',
    fechaNacimiento: '',
    telefono: '',
    direccion: '',
    email: '',
    estado: 'Activo',
    tipoUsuario: 'Cliente',
    formacionProfesional: '',
    tarjetaProfesional: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      // Formatear fecha para input type="date" (YYYY-MM-DD)
      let fechaFormateada = '';
      if (user.fecha_nacimiento) {
        const fecha = new Date(user.fecha_nacimiento);
        // Ajustar zona horaria
        fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
        fechaFormateada = fecha.toISOString().split('T')[0];
      }

      setFormData({
        nombreUsuario: user.nombre_usuario || '',
        tipoIdentificacion: user.tipo_identificacion || 'CC',
        identificacion: user.identificacion || '',
        fechaNacimiento: fechaFormateada,
        telefono: user.telefono || '',
        direccion: user.direccion || '',
        email: user.email || '',
        estado: user.verificado ? 'Activo' : 'Pendiente',
        tipoUsuario: user.tipo_usuario || 'Cliente',
        formacionProfesional: user.formacion_profesional || '',
        tarjetaProfesional: user.tarjeta_profesional || ''
      });
    }
  }, [user]);

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
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${user.email}`, {
        method: 'PUT',
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
          tarjeta_profesional: formData.tarjetaProfesional || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // Si hay errores de validación del backend, formatearlos
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => `• ${err.message}`).join('\n');
          throw new Error(`Errores de validación:\n${errorMessages}`);
        }
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      alert('Usuario actualizado correctamente');
      if (onSave) {
        onSave(data.user);
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-edit-form-container">
      <div className="form-header">
        <button className="back-button" onClick={onCancel} type="button">
          <img src={iconoAtras} alt="Atrás" className="back-icon" />
          <span>Atrás</span>
        </button>
        <h2 className="form-title">EDITAR USUARIO</h2>
      </div>

      <form className="user-edit-form" onSubmit={handleSubmit}>
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
            disabled
            style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>El email no se puede modificar</small>
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

        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" className="save-button" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEditForm;