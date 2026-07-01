# Documentación del CRUD de Usuarios

## Implementación Completa

El sistema de gestión de usuarios (CRUD) está completamente implementado y conectado entre el frontend y el backend.

## Backend

### Rutas Disponibles (API REST)

Todas las rutas requieren autenticación con JWT token en el header:
```
Authorization: Bearer <token>
```

#### 1. Listar todos los usuarios
- **Método:** `GET`
- **Ruta:** `/api/users`
- **Respuesta exitosa:**
```json
{
  "success": true,
  "users": [
    {
      "email": "usuario@ejemplo.com",
      "nombre_usuario": "Usuario1",
      "tipo_identificacion": "CC",
      "identificacion": "123456789",
      "fecha_nacimiento": "1990-01-15",
      "telefono": "3001234567",
      "direccion": "Calle 123 #45-67",
      "verificado": true
    }
  ]
}
```

#### 2. Obtener usuario por email
- **Método:** `GET`
- **Ruta:** `/api/users/:email`
- **Ejemplo:** `/api/users/usuario@ejemplo.com`

#### 3. Crear nuevo usuario (desde dashboard)
- **Método:** `POST`
- **Ruta:** `/api/users`
- **Body:**
```json
{
  "nombre_usuario": "NuevoUsuario",
  "tipo_identificacion": "CC",
  "identificacion": "987654321",
  "fecha_nacimiento": "1995-05-20",
  "telefono": "3109876543",
  "direccion": "Carrera 45 #12-34",
  "tipo_usuario": "Cliente",
  "formacion_profesional": null,
  "tarjeta_profesional": null,
  "email": "nuevo@ejemplo.com",
  "password": "Password123!"
}
```
**Nota:** 
- Los usuarios creados desde el dashboard se crean con `verificado = true` automáticamente.
- Si `tipo_usuario` es "Psicólogo/empleado", `formacion_profesional` y `tarjeta_profesional` son requeridos.
- Si `tipo_usuario` es "Cliente", los campos profesionales pueden ser null.

#### 4. Actualizar usuario
- **Método:** `PUT`
- **Ruta:** `/api/users/:email`
- **Body:** (solo los campos a actualizar)
```json
{
  "nombre_usuario": "UsuarioModificado",
  "telefono": "3001112233",
  "direccion": "Nueva dirección",
  "tipo_usuario": "Psicólogo/empleado",
  "formacion_profesional": "Psicólogo Clínico",
  "tarjeta_profesional": "PSI-12345"
}
```
**Nota:** El email NO se puede modificar.

#### 5. Eliminar usuario
- **Método:** `DELETE`
- **Ruta:** `/api/users/:email`
- **Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

### Validaciones Implementadas

- **Nombre de usuario:** 3-100 caracteres, solo letras, números y guiones bajos
- **Identificación:** 5-50 dígitos numéricos
- **Tipo identificación:** Solo "CC" o "CE"
- **Fecha nacimiento:** Usuario debe ser mayor de 18 años
- **Teléfono:** 10 dígitos numéricos
- **Email:** Formato válido, único en la base de datos
- **Password:** Mínimo 8 caracteres, incluir mayúscula, número y símbolo

## Frontend

### Componentes Actualizados

#### 1. UserList.jsx
- **Ubicación:** `src/components/Dashboard/UserList.jsx`
- **Funcionalidades:**
  - Carga automática de usuarios desde el backend al montar el componente
  - Eliminación individual o múltiple con confirmación
  - Navegación a formulario de edición
  - Paginación (5 usuarios por página)
  - Indicador de carga y manejo de errores
  - Muestra estado "Activo" o "Pendiente" según verificación

#### 2. UserEditForm.jsx
- **Ubicación:** `src/components/Dashboard/UserEditForm.jsx`
- **Funcionalidades:**
  - Actualización de datos del usuario
  - Email deshabilitado (no modificable)
  - Validación de campos antes de enviar
  - Indicador de carga durante actualización
  - Manejo de errores con mensajes descriptivos

#### 3. UserRegisterForm.jsx
- **Ubicación:** `src/components/Dashboard/UserRegisterForm.jsx`
- **Funcionalidades:**
  - Registro de nuevos usuarios desde el dashboard
  - Validación de contraseñas (coincidencia y formato)
  - Campos simplificados (sin tipo usuario ni profesión)
  - Usuarios creados ya vienen verificados automáticamente
  - Toggle de visibilidad de contraseña

## Cómo Probar el Sistema

### 1. Iniciar el Backend

```bash
cd backend
npm start
```
El servidor debe estar corriendo en `http://localhost:3001`

### 2. Iniciar el Frontend

```bash
npm start
```
La aplicación debe abrir en `http://localhost:3000`

### 3. Flujo de Prueba

1. **Registrar una cuenta nueva**
   - Ve a la página de registro
   - Completa el formulario
   - Verifica tu email con el token enviado

2. **Iniciar sesión**
   - Usa el email y contraseña registrados
   - Serás redirigido al dashboard

3. **Listar usuarios** (Gestionar Usuarios)
   - En el menú del dashboard, haz clic en "Editar Usuarios"
   - Verás la lista de todos los usuarios registrados
   - Usa los checkboxes para seleccionar usuarios
   - Puedes navegar entre páginas

4. **Crear nuevo usuario**
   - En el menú del dashboard, haz clic en "Registrar Nuevo Usuario"
   - Completa todos los campos del formulario
   - La contraseña debe cumplir los requisitos
   - Haz clic en "Crear nuevo usuario"

5. **Editar usuario**
   - En la lista de usuarios, haz clic en el botón de editar (icono actualizar)
   - Modifica los campos que desees
   - El email no se puede modificar
   - Haz clic en "Guardar Cambios"

6. **Eliminar usuario**
   - **Opción 1:** Selecciona uno o más usuarios con los checkboxes y haz clic en "Eliminar"
   - **Opción 2:** Haz clic en el botón de eliminar (icono basura) en la fila del usuario
   - Confirma la eliminación en el diálogo

## Seguridad

- Todas las contraseñas se encriptan con bcrypt antes de guardarlas
- Las rutas de gestión de usuarios requieren autenticación JWT
- Validación de datos tanto en frontend como en backend
- Prevención de duplicados (email, identificación, nombre de usuario)

## Base de Datos

### Tabla: usuarios

Campos principales:
- `email` (PRIMARY KEY)
- `nombre_usuario` (UNIQUE)
- `identificacion` (UNIQUE)
- `tipo_identificacion` (CC/CE)
- `fecha_nacimiento`
- `telefono`
- `direccion`
- `tipo_usuario` (Cliente/Psicólogo/empleado) - DEFAULT: 'Cliente'
- `formacion_profesional` (VARCHAR 255, nullable)
- `tarjeta_profesional` (VARCHAR 100, nullable)
- `password` (encriptada)
- `verificado` (boolean)
- `token_verificacion`

## Notas Importantes

1. **Sesión Activa:** La sesión expira después de 5 minutos de inactividad
2. **Token JWT:** Se guarda en localStorage y tiene validez de 7 días
3. **Email único:** No se pueden registrar dos usuarios con el mismo email
4. **Verificación:** Los usuarios del registro público requieren verificación de email, los creados desde el dashboard ya vienen verificados

## Solución de Problemas

### Error: "Token inválido o expirado"
- Inicia sesión nuevamente para obtener un nuevo token

### Error: "Email ya existe"
- Usa un email diferente para registrar el usuario

### Error: "No se pueden cargar los usuarios"
- Verifica que el backend esté corriendo
- Verifica que la base de datos esté activa (XAMPP)
- Revisa la consola del navegador para más detalles

### Error de CORS
- Verifica que el backend tenga configurado CORS correctamente
- Asegúrate de que las URLs en el frontend coincidan con el puerto del backend
