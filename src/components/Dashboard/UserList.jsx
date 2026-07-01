import React, { useState, useEffect } from 'react';
import './UserList.css';
import iconoAtras from '../../assets/icons/Atras.svg';
import iconoEliminar from '../../assets/icons/Eliminar.svg';
import iconoActualizar from '../../assets/icons/ActualizarUsuario.svg';
import API_BASE_URL from '../../config/api';

const UserList = ({ onEditUser, onBack, adminEmail = 'administrador@seguramente.com' }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Cargar usuarios desde el backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar los usuarios');
      }

      const data = await response.json();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.filter(u => u.email !== adminEmail).map(user => user.email));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (email) => {
    if (email === adminEmail) return;
    if (selectedUsers.includes(email)) {
      setSelectedUsers(selectedUsers.filter(e => e !== email));
    } else {
      setSelectedUsers([...selectedUsers, email]);
    }
  };

  const handleDelete = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecciona al menos un usuario para eliminar');
      return;
    }

    const toDelete = selectedUsers.filter(email => email !== adminEmail);
    if (toDelete.length === 0) {
      alert('El usuario administrador no puede ser eliminado.');
      return;
    }
    if (toDelete.length < selectedUsers.length) {
      alert('El usuario administrador no puede ser eliminado y será excluido de la operación.');
    }

    if (window.confirm(`¿Estás seguro de eliminar ${toDelete.length} usuario(s)?`)) {
      try {
        const token = localStorage.getItem('token');

        // Eliminar cada usuario seleccionado
        const deletePromises = toDelete.map(email =>
          fetch(`${API_BASE_URL}/users/${email}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        );

        await Promise.all(deletePromises);

        // Recargar la lista de usuarios
        await fetchUsers();
        setSelectedUsers([]);
        setSelectAll(false);
        alert('Usuarios eliminados correctamente');
      } catch (err) {
        console.error('Error deleting users:', err);
        alert('Error al eliminar usuarios');
      }
    }
  };

  const handleEdit = () => {
    if (selectedUsers.length !== 1) {
      alert('Selecciona un solo usuario para editar');
      return;
    }

    const userToEdit = users.find(user => user.email === selectedUsers[0]);
    if (onEditUser) {
      onEditUser(userToEdit);
    }
  };

  const handleEditSingle = (user) => {
    if (onEditUser) {
      onEditUser(user);
    }
  };

  const handleDeleteSingle = async (email) => {
    if (email === adminEmail) {
      alert('El usuario administrador no puede ser eliminado.');
      return;
    }
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/${email}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar usuario');
        }

        await fetchUsers();
        alert('Usuario eliminado correctamente');
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Error al eliminar usuario');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <button className="back-button" onClick={handleBack}>
          <img src={iconoAtras} alt="Atrás" className="back-icon" />
          <span>Atrás</span>
        </button>
        <h2 className="section-title">EDITAR USUARIOS</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          <p>Error: {error}</p>
          <button onClick={fetchUsers}>Reintentar</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th className="th-checkbox">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="checkbox-input"
                    />
                  </th>
                  <th>Estado</th>
                  <th>Nombre de usuario</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Dirección</th>
                  <th>Fecha Nacimiento</th>
                  <th>Tipo Usuario</th>
                  <th>Profesión (Título)</th>
                  <th>Matrícula Profesional</th>
                  <th className="th-opciones">Opciones</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(user => (
                  <tr key={user.email} className={selectedUsers.includes(user.email) ? 'selected' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.email)}
                        onChange={() => handleSelectUser(user.email)}
                        className="checkbox-input"
                        disabled={user.email === adminEmail}
                      />
                    </td>
                    <td>{user.verificado ? 'Activo' : 'Pendiente'}</td>
                    <td>{user.nombre_usuario}</td>
                    <td>{user.email}</td>
                    <td>{user.telefono}</td>
                    <td>{user.direccion}</td>
                    <td>{formatDate(user.fecha_nacimiento)}</td>
                    <td>{user.tipo_usuario || 'Cliente'}</td>
                    <td>{user.formacion_profesional || 'N/A'}</td>
                    <td>{user.tarjeta_profesional || 'N/A'}</td>
                    <td className="options-cell">
                      {user.email !== adminEmail && (
                        <button
                          className="icon-button delete-button"
                          onClick={() => handleDeleteSingle(user.email)}
                          title="Eliminar"
                        >
                          <img src={iconoEliminar} alt="Eliminar" className="option-icon" />
                        </button>
                      )}
                      <button
                        className="icon-button edit-button"
                        onClick={() => handleEditSingle(user)}
                        title="Editar"
                      >
                        <img src={iconoActualizar} alt="Editar" className="option-icon" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="bulk-actions">
              <button className="action-button delete-action" onClick={handleDelete}>
                Eliminar
              </button>
              <button className="action-button edit-action" onClick={handleEdit}>
                Editar
              </button>
            </div>

            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span className="page-number current">{currentPage}</span>
              <span className="page-number">{currentPage + 1 <= totalPages ? currentPage + 1 : ''}</span>
              <button
                className="pagination-button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserList;