# Documentación de Módulos y Componentes - Segura Mente App

##  Índice

. [Módulo de Autenticación](#módulo-de-autenticación)
. [Módulo de Gestión de Usuarios](#módulo-de-gestión-de-usuarios)
. [Módulo de Control de Sesión](#módulo-de-control-de-sesión)
. [Componentes del Frontend](#componentes-del-frontend)
. [Modelos de Base de Datos](#modelos-de-base-de-datos)

---

## . Módulo de Autenticación

### . Registro de Usuario

**Archivo:** `backend/controllers/authController.js` - `register()`

#### Datos de Entrada
```json
{
  "nombreUsuario": "string (requerido, único)",
  "tipoIdentificacion": "string (requerido, valores: CC, TI, CE, PA)",
  "identificacion": "string (requerido, único)",
  "fechaNacimiento": "date (requerido, formato: YYYY-MM-DD)",
  "telefono": "string (requerido)",
  "direccion": "string (requerido)",
  "email": "string (requerido, único, formato email)",
  "password": "string (requerido, mín  caracteres)"
}
```

#### Datos de Salida (Éxito)
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Ya puedes iniciar sesión.",
  "data": {
    "email": "usuario@example.com",
    "nombreUsuario": "Usuario Ejemplo"
  }
}
```

#### Datos de Salida (Error)
```json
{
  "success": false,
  "message": "El correo electrónico ya está registrado"
}
```

#### Proceso Interno
. Validación de datos de entrada
. Verificación de duplicados (email, username, identificación)
. Encriptación de contraseña con bcrypt
. Generación de token de verificación
. Inserción en base de datos
. Auto-verificación del usuario (workaround para SMTP)

---

### . Inicio de Sesión

**Archivo:** `backend/controllers/authController.js` - `login()`

#### Datos de Entrada
```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

#### Datos de Salida (Éxito)
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ...",
  "user": {
    "email": "usuario@example.com",
    "nombreUsuario": "Usuario Ejemplo",
    "verificado": true
  }
}
```

#### Datos de Salida (Error - Usuario no verificado)
```json
{
  "success": false,
  "message": "Por favor verifica tu correo electrónico antes de iniciar sesión",
  "emailNotVerified": true
}
```

#### Proceso Interno
. Búsqueda de usuario por email
. Verificación de existencia del usuario
. Comparación de contraseña con bcrypt
. Verificación del estado de verificación
. Generación de JWT token
. Actualización de último acceso

---

### . Verificación de Email

**Archivo:** `backend/controllers/authController.js` - `verifyEmail()`

#### Datos de Entrada
```
Query Parameter: token=<token_de_verificacion>
```

#### Datos de Salida (Éxito)
```json
{
  "success": true,
  "message": "Email verificado exitosamente. Ya puedes iniciar sesión."
}
```

#### Proceso Interno
. Recepción del token de verificación
. Búsqueda de usuario por token
. Actualización del campo `verificado` a TRUE
. Eliminación del token de verificación

---

## . Módulo de Gestión de Usuarios

### . Listar Usuarios

**Archivo:** `backend/controllers/userController.js` - `getAllUsers()`

#### Datos de Entrada
```
Headers: Authorization: Bearer <token>
```

#### Datos de Salida
```json
{
  "success": true,
  "users": [
    {
      "email": "usuario@example.com",
      "nombre_usuario": "Usuario Ejemplo",
      "tipo_identificacion": "CC",
      "identificacion": "70",
      "fecha_nacimiento": "0-0-0",
      "telefono": "007",
      "direccion": "Calle  #-7",
      "tipo_usuario": "Cliente",
      "formacion_profesional": null,
      "tarjeta_profesional": null,
      "verificado": true,
      "fecha_registro": "0-0-T00:00:00.000Z",
      "ultimo_acceso": "0-0-T0:0:00.000Z"
    }
  ]
}
```

#### Proceso Interno
. Verificación de autenticación mediante JWT
. Consulta a la base de datos
. Ordenamiento por fecha de registro descendente
. Retorno de lista completa de usuarios

---

### . Crear Usuario (desde Dashboard)

**Archivo:** `backend/controllers/userController.js` - `createUser()`

#### Datos de Entrada
```json
{
  "nombre_usuario": "string (requerido)",
  "tipo_identificacion": "string (requerido)",
  "identificacion": "string (requerido)",
  "fecha_nacimiento": "date (requerido)",
  "telefono": "string (requerido)",
  "direccion": "string (requerido)",
  "tipo_usuario": "string (Cliente | Empleado)",
  "formacion_profesional": "string (opcional, requerido si tipo_usuario=Empleado)",
  "tarjeta_profesional": "string (opcional, requerido si tipo_usuario=Empleado)",
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

#### Datos de Salida (Éxito)
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "email": "nuevo@example.com"
  }
}
```

---

### . Actualizar Usuario

**Archivo:** `backend/controllers/userController.js` - `updateUser()`

#### Datos de Entrada
```json
{
  "nombre_usuario": "string",
  "tipo_identificacion": "string",
  "identificacion": "string",
  "fecha_nacimiento": "date",
  "telefono": "string",
  "direccion": "string",
  "tipo_usuario": "string",
  "formacion_profesional": "string",
  "tarjeta_profesional": "string"
}
```

#### URL Parameter
```
/api/users/:email
```

#### Datos de Salida (Éxito)
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente"
}
```

---

### . Eliminar Usuario

**Archivo:** `backend/controllers/userController.js` - `deleteUser()`

#### Datos de Entrada
```
URL Parameter: /api/users/:email
Headers: Authorization: Bearer <token>
```

#### Datos de Salida (Éxito)
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## . Módulo de Control de Sesión

### . Hook useSessionTimeout

**Archivo:** `src/hooks/useSessionTimeout.js`

#### Parámetros de Entrada
```javascript
useSessionTimeout(timeoutMinutes = , warningMinutes = )
```

#### Datos de Salida
```javascript
{
  showWarning: boolean,      // Mostrar advertencia de cierre inminente
  remainingTime: number,     // Segundos restantes
  resetTimer: function       // Función para reiniciar el temporizador
}
```

#### Funcionalidad
- Detecta inactividad del usuario
- Muestra advertencia  minuto antes de cerrar sesión
- Cierra sesión automáticamente después de  minutos de inactividad
- Monitorea eventos: mousedown, mousemove, keypress, scroll, touchstart, click

---

## . Componentes del Frontend

### . LoginForm

**Archivo:** `src/components/Login/LoginForm.jsx`

#### Props
Ninguno (componente independiente)

#### Estado Interno
```javascript
{
  email: string,
  password: string,
  showPassword: boolean,
  rememberMe: boolean,
  isLoading: boolean
}
```

#### Eventos
- `handleSubmit`: Procesa el inicio de sesión
- `handlePasswordToggle`: Muestra/oculta contraseña

---

### . RegisterForm

**Archivo:** `src/components/Register/RegisterForm.jsx`

#### Estado Interno
```javascript
{
  nombreUsuario: string,
  tipoIdentificacion: string,
  identificacion: string,
  fechaNacimiento: string,
  telefono: string,
  direccion: string,
  email: string,
  password: string,
  confirmPassword: string,
  showPassword: boolean,
  showConfirmPassword: boolean
}
```

#### Validaciones
- Contraseñas coinciden
- Formato de email válido
- Campos obligatorios completos

---

### . UserList

**Archivo:** `src/components/Dashboard/UserList.jsx`

#### Props
```javascript
{
  onEditUser: function,  // Callback para editar usuario
  onBack: function       // Callback para volver atrás
}
```

#### Estado Interno
```javascript
{
  users: array,
  loading: boolean,
  error: string,
  selectedUsers: array,
  selectAll: boolean,
  currentPage: number
}
```

#### Funcionalidades
- Paginación ( usuarios por página)
- Selección múltiple de usuarios
- Edición individual
- Eliminación individual o múltiple
- Actualización de lista

---

### . UserEditForm

**Archivo:** `src/components/Dashboard/UserEditForm.jsx`

#### Props
```javascript
{
  user: object,      // Usuario a editar
  onSave: function,  // Callback al guardar
  onCancel: function // Callback al cancelar
}
```

#### Proceso
. Carga datos del usuario en el formulario
. Permite edición de campos
. Valida datos antes de enviar
. Actualiza usuario en backend
. Notifica resultado

---

### . UserRegisterForm

**Archivo:** `src/components/Dashboard/UserRegisterForm.jsx`

#### Props
```javascript
{
  onSave: function,   // Callback al guardar
  onCancel: function  // Callback al cancelar
}
```

#### Validaciones Especiales
- Contraseña mínimo  caracteres
- Al menos una mayúscula
- Al menos un número
- Al menos un símbolo especial
- Campos de empleado obligatorios si tipo_usuario = "Empleado"

---

## . Modelos de Base de Datos

### . Tabla: usuarios

**Archivo:** `backend/database.sql`

#### Estructura
```sql
CREATE TABLE usuarios (
    email VARCHAR(0) PRIMARY KEY,
    nombre_usuario VARCHAR(00) NOT NULL UNIQUE,
    tipo_identificacion VARCHAR() NOT NULL,
    identificacion VARCHAR(0) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(0) NOT NULL,
    direccion VARCHAR() NOT NULL,
    tipo_usuario VARCHAR(0) DEFAULT 'Cliente',
    formacion_profesional VARCHAR(),
    tarjeta_profesional VARCHAR(00),
    password VARCHAR() NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(),
    token_recuperacion VARCHAR() DEFAULT NULL,
    token_recuperacion_expira DATETIME DEFAULT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);
```

#### Índices
```sql
CREATE INDEX idx_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX idx_identificacion ON usuarios(identificacion);
CREATE INDEX idx_token_verificacion ON usuarios(token_verificacion);
CREATE INDEX idx_token_recuperacion ON usuarios(token_recuperacion);
```

#### Constraints
- **PRIMARY KEY:** email
- **UNIQUE:** nombre_usuario, identificacion
- **NOT NULL:** email, nombre_usuario, tipo_identificacion, identificacion, fecha_nacimiento, telefono, direccion, password

---

## . Middleware y Utilidades

### . Validación de Datos

**Archivo:** `backend/middleware/validation.js`

#### Función: validateRegister

**Validaciones:**
- Email válido y requerido
- Password mínimo  caracteres
- Nombre de usuario requerido
- Identificación requerida
- Fecha de nacimiento requerida
- Teléfono requerido
- Dirección requerida

### . Utilidades de Email

**Archivo:** `backend/utils/email.js`

#### Funciones Disponibles
- `sendVerificationEmail()`: Envío de email de verificación
- `sendWelcomeEmail()`: Email de bienvenida
- `sendPasswordResetEmail()`: Email de recuperación de contraseña

**Nota:** Actualmente deshabilitadas debido a limitaciones de SMTP en hosting gratuito.

---

## 7. Configuración y Variables de Entorno

### Backend (.env)
```env
NODE_ENV=production
PORT=0000
DB_HOST=caboose.proxy.rlwy.net
DB_PORT=
DB_USER=root
DB_PASSWORD=[cifrado]
DB_NAME=railway
DB_SSL=true
JWT_SECRET=[cifrado]
JWT_EXPIRE=7d
CLIENT_URL=https://segura-mente-app-frontend.vercel.app
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=7
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=[API_KEY]
EMAIL_FROM=[email]
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://segura-mente-app-ga-000-aa-ev0.onrender.com/api
```

---

## . Flujos de Datos Completos

### Flujo de Registro
```
Usuario → RegisterForm → API /auth/register → authController.register() 
→ User.create() → Base de Datos → User.verifyByEmail() 
→ Respuesta → SuccessPage → Login
```

### Flujo de Login
```
Usuario → LoginForm → API /auth/login → authController.login() 
→ User.findByEmail() → bcrypt.compare() → jwt.sign() 
→ localStorage → Redirección a Dashboard
```

### Flujo de Gestión de Usuarios
```
Dashboard → UserList → API /users → userController.getAllUsers() 
→ User.findAll() → Base de Datos → Renderizado de Lista
```

---

##  Notas de Implementación

. **Seguridad:** Las contraseñas se encriptan con bcrypt (0 rounds)
. **Autenticación:** JWT con expiración de 7 días
. **CORS:** Configurado para aceptar solo el dominio del frontend
. **Paginación:** Implementada en el frontend ( registros por página)
. **Validación:** Doble validación (frontend y backend)
. **Manejo de Errores:** Respuestas consistentes con formato `{success, message, data/error}`
