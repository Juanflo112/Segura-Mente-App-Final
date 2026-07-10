# Manual Tecnico - Segura-Mente App

**Proyecto:** Segura-Mente - Sistema de Gestion de Usuarios y Agendamiento de Citas  
**Version:** 2.0.0  
**Fecha:** Julio 2026  
**Autor:** Juan Pablo Mejia Vargas  
**Tipo:** Manual Tecnico para Desarrolladores

---

## Tabla de Contenidos

1. [Arquitectura del Sistema](#1-arquitectura-del-sistema)
2. [Patron de Diseno y Estructura del Codigo](#2-patron-de-diseno-y-estructura-del-codigo)
3. [Tecnologias Utilizadas](#3-tecnologias-utilizadas)
4. [Estructura del Proyecto](#4-estructura-del-proyecto)
5. [Documentacion del Codigo - Backend](#5-documentacion-del-codigo---backend)
6. [Documentacion del Codigo - Frontend](#6-documentacion-del-codigo---frontend)
7. [Base de Datos](#7-base-de-datos)
8. [API REST - Endpoints](#8-api-rest---endpoints)
9. [Autenticacion y Seguridad](#9-autenticacion-y-seguridad)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Despliegue en Produccion](#11-despliegue-en-produccion)
12. [Mantenimiento y Solucion de Problemas](#12-mantenimiento-y-solucion-de-problemas)

---

## 1. Arquitectura del Sistema

### 1.1 Vision General

Segura-Mente implementa una arquitectura de **tres capas distribuidas en la nube**, donde cada capa esta alojada en un servicio independiente y se comunica con las demas mediante protocolos estandar.

```
+------------------+        HTTPS / REST        +-------------------+
|   CAPA           |  ------------------------> |   CAPA            |
|   PRESENTACION   |  <----- JSON Response ----- |   NEGOCIO         |
|                  |                            |                   |
|  React SPA       |                            |  Node.js Express  |
|  Vercel CDN      |                            |  Render           |
+------------------+                            +-------------------+
                                                         |
                                                MySQL + SSL
                                                         |
                                                +-------------------+
                                                |   CAPA            |
                                                |   DATOS           |
                                                |                   |
                                                |  MySQL 8.0        |
                                                |  Railway          |
                                                +-------------------+
```

### 1.2 Descripcion de Capas

**Capa de Presentacion (Frontend)**
- Tecnologia: React 19 (Create React App)
- Alojamiento: Vercel (CDN global)
- Responsabilidad: Renderizar la interfaz, gestionar el estado local, consumir la API REST
- Comunicacion: Peticiones HTTP con token JWT en el header `Authorization`
- URL: `https://segura-mente-app-final.vercel.app`

**Capa de Negocio (Backend)**
- Tecnologia: Node.js 18 con Express 5
- Alojamiento: Render (servidor Linux)
- Responsabilidad: Validar datos, aplicar reglas de negocio, gestionar autenticacion, consultar la BD
- Comunicacion: Expone API REST en HTTPS, acepta origenes CORS configurados
- URL: `https://segura-mente-app-ga8-220501096-aa1-ev02.onrender.com`

**Capa de Datos (Base de Datos)**
- Tecnologia: MySQL 8.0
- Alojamiento: Railway (contenedor Linux)
- Responsabilidad: Persistir y gestionar los datos del sistema
- Comunicacion: Conexion TCP/IP cifrada con SSL desde el backend
- Host: `caboose.proxy.rlwy.net`

### 1.3 Flujo de una Peticion Tipica

```
1. Usuario interactua con la interfaz React (clic, formulario)
2. Componente React llama a fetch() con la URL del backend
3. Header incluye: Content-Type: application/json
                   Authorization: Bearer <token_jwt>
4. Express recibe la peticion en server.js
5. CORS verifica que el origen este permitido
6. Middleware ValidationMiddleware verifica el JWT
7. Router dirige al controlador correspondiente
8. Controlador ejecuta logica de negocio
9. Modelo ejecuta consulta SQL en la BD via pool mysql2
10. BD retorna resultados al modelo
11. Modelo retorna datos al controlador
12. Controlador envia respuesta JSON al frontend
13. React actualiza el estado y re-renderiza el componente
```

---

## 2. Patron de Diseno y Estructura del Codigo

### 2.1 Patron MVC en el Backend

El backend implementa el patron **Modelo-Vista-Controlador** adaptado a una API REST:

| Capa | Archivo | Responsabilidad |
|------|---------|----------------|
| **Modelo** | `backend/models/User.js` | Consultas SQL sobre la tabla `usuarios` |
| **Modelo** | `backend/models/Appointment.js` | Consultas SQL sobre la tabla `citas` |
| **Controlador** | `backend/controllers/authController.js` | Logica de registro e inicio de sesion |
| **Controlador** | `backend/controllers/userController.js` | Logica CRUD de usuarios |
| **Controlador** | `backend/controllers/appointmentController.js` | Logica de gestion de citas |
| **Ruta** | `backend/routes/auth.js` | Mapeo de endpoints de autenticacion |
| **Ruta** | `backend/routes/users.js` | Mapeo de endpoints de usuarios |
| **Ruta** | `backend/routes/appointments.js` | Mapeo de endpoints de citas |

> En una API REST no existe "Vista" tradicional. Los controladores retornan JSON en lugar de HTML.

### 2.2 Principios Aplicados

- **Separacion de responsabilidades:** Cada archivo tiene una unica funcion (rutas, controladores, modelos)
- **Middleware en cadena:** Las peticiones pasan por CORS > autenticacion JWT > validacion de datos > controlador
- **Pool de conexiones:** La BD usa un pool MySQL en lugar de conexiones individuales para mejor rendimiento
- **Variables de entorno:** Toda configuracion sensible se gestiona con dotenv; ningun secreto esta en el codigo

---

## 3. Tecnologias Utilizadas

### 3.1 Frontend

| Tecnologia | Version | Funcion en el Proyecto |
|-----------|---------|----------------------|
| React | 19.2.0 | Framework principal de la interfaz |
| React Router DOM | 7.10.1 | Manejo de rutas SPA (sin recarga de pagina) |
| React Scripts (CRA) | 5.0.1 | Bundler webpack, servidor de desarrollo, build |
| Web Vitals | 2.1.4 | Medicion de metricas de rendimiento |
| CSS3 | - | Estilos personalizados por componente |
| Open Sans | - | Tipografia principal (Google Fonts) |

### 3.2 Backend

| Tecnologia | Version | Funcion en el Proyecto |
|-----------|---------|----------------------|
| Node.js | 18+ | Entorno de ejecucion JavaScript en servidor |
| Express | 5.2.1 | Framework HTTP: rutas, middleware, respuestas |
| mysql2 | 3.16.0 | Driver MySQL con soporte para Promises y pool |
| bcryptjs | 3.0.3 | Hash y verificacion de contrasenas |
| jsonwebtoken | 9.0.3 | Generacion y verificacion de tokens JWT |
| express-validator | 7.3.1 | Validacion y sanitizacion de datos de entrada |
| cors | 2.8.5 | Middleware para control de origenes permitidos |
| dotenv | 17.2.3 | Carga de variables de entorno desde .env |
| nodemailer | 7.0.11 | Cliente SMTP para envio de correos |

### 3.3 Infraestructura y Herramientas

| Herramienta | Uso |
|------------|-----|
| Vercel | Hosting del frontend con CDN y auto-deploy |
| Render | Hosting del backend Node.js con auto-deploy |
| Railway | MySQL 8.0 gestionado en la nube |
| GitHub | Control de versiones y disparador de CI/CD |
| Git | Version control local |

---

## 4. Estructura del Proyecto

```
segura-mente-app/
|
+-- backend/                              # Servidor Node.js + Express
|   |
|   +-- config/
|   |   +-- database.js                   # Pool de conexiones MySQL con SSL
|   |
|   +-- controllers/
|   |   +-- authController.js             # Registro e inicio de sesion
|   |   +-- userController.js             # CRUD de usuarios
|   |   +-- appointmentController.js      # Gestion de citas
|   |
|   +-- middleware/
|   |   +-- validation.js                 # JWT auth + reglas express-validator
|   |
|   +-- migrations/
|   |   +-- add_employee_fields.sql       # Campos tipo_usuario, formacion, tarjeta
|   |   +-- add_password_reset_fields.sql # Campos token recuperacion
|   |   +-- create_appointments_table.sql # Tabla citas original
|   |
|   +-- models/
|   |   +-- User.js                       # Metodos estaticos de consulta a usuarios
|   |   +-- Appointment.js                # Metodos estaticos de consulta a citas
|   |
|   +-- routes/
|   |   +-- auth.js                       # POST /register, POST /login
|   |   +-- users.js                      # GET, POST, PUT, DELETE /users
|   |   +-- appointments.js               # CRUD + cancelacion de citas
|   |
|   +-- scripts/
|   |   +-- migrateAppointments.js        # Script migracion de datos
|   |
|   +-- utils/
|   |   +-- email.js                      # Transporter nodemailer
|   |
|   +-- database.sql                      # DDL inicial completo
|   +-- server.js                         # Punto de entrada: Express, CORS, rutas
|   +-- package.json
|   +-- render.yaml                       # Configuracion de despliegue en Render
|   +-- Dockerfile                        # Imagen Docker del backend
|
+-- src/                                  # Codigo fuente React
|   |
|   +-- components/
|   |   |
|   |   +-- Appointments/
|   |   |   +-- AppointmentScheduler.jsx  # Calendario de citas (cliente)
|   |   |   +-- AppointmentScheduler.css
|   |   |   +-- PsychologistAppointments.jsx  # Panel de citas (psicologo)
|   |   |   +-- PsychologistAppointments.css
|   |   |
|   |   +-- Dashboard/
|   |   |   +-- Sidebar.jsx               # Menu lateral con navegacion por rol
|   |   |   +-- Sidebar.css
|   |   |   +-- UserList.jsx              # Tabla de usuarios (admin)
|   |   |   +-- UserList.css
|   |   |   +-- UserEditForm.jsx          # Formulario edicion de usuario
|   |   |   +-- UserEditForm.css
|   |   |   +-- UserRegisterForm.jsx      # Formulario registro admin
|   |   |   +-- UserRegisterForm.css
|   |   |
|   |   +-- Login/
|   |   |   +-- Login.jsx                 # Layout de dos columnas
|   |   |   +-- Login.css
|   |   |   +-- LoginForm.jsx             # Formulario de autenticacion
|   |   |
|   |   +-- Logo/
|   |   |   +-- Logo.jsx
|   |   |   +-- Logo.css
|   |   |
|   |   +-- Register/
|   |   |   +-- RegisterForm.jsx          # Formulario de registro publico
|   |   |   +-- RegisterForm.css
|   |   |
|   |   +-- ProtectedRoute.jsx            # HOC que verifica token JWT
|   |   +-- SessionWarning.jsx            # Modal de advertencia de inactividad
|   |   +-- SessionWarning.css
|   |
|   +-- config/
|   |   +-- api.js                        # URL base del backend (REACT_APP_API_URL)
|   |
|   +-- hooks/
|   |   +-- useSessionTimeout.js          # Hook: temporizador de inactividad
|   |
|   +-- pages/
|   |   +-- AppointmentPage.jsx           # /citas: muestra scheduler o panel segun rol
|   |   +-- AppointmentPage.css
|   |   +-- DashboardPage.jsx             # /dashboard: vista principal post-login
|   |   +-- DashboardPage.css
|   |   +-- ForgotPasswordPage.jsx        # /forgot-password
|   |   +-- RegisterPage.jsx              # /registro
|   |   +-- RegisterPage.css
|   |   +-- ResetPasswordPage.jsx         # /reset-password
|   |   +-- SuccessPage.jsx               # /success
|   |   +-- VerificationPage.jsx          # /verificacion
|   |   +-- VerifyEmailPage.jsx           # /verify
|   |
|   +-- assets/
|   |   +-- icons/                        # SVG de iconos de navegacion
|   |   +-- images/                       # Logo, patron header, imagen login
|   |
|   +-- App.jsx                           # Router principal con todas las rutas
|   +-- App.css
|   +-- index.js                          # Punto de entrada React DOM
|   +-- index.css                         # Estilos globales y reset
|   +-- main.jsx                          # Alternativa de entrada (Vite compatible)
|
+-- public/
|   +-- index.html                        # Template HTML principal
|   +-- manifest.json
|   +-- robots.txt
|
+-- cypress/                              # Pruebas E2E con Cypress
|   +-- e2e/                              # Casos de prueba organizados por modulo
|   +-- support/
|
+-- vercel.json                           # Config SPA: reescritura de rutas
+-- docker-compose.yml                    # Configuracion Docker local
+-- package.json                          # Dependencias frontend
+-- README.md                             # Documentacion principal del proyecto
+-- MANUAL_TECNICO.md                     # Este documento
```

---

## 5. Documentacion del Codigo - Backend

### 5.1 server.js - Punto de Entrada

El archivo `server.js` es el punto de entrada del servidor. Sus responsabilidades son:

1. Cargar las variables de entorno con `dotenv`
2. Crear la aplicacion Express
3. Configurar los middlewares globales: CORS, body-parser
4. Montar los routers en sus rutas base
5. Registrar el manejador de errores 404 y el manejador global de excepciones
6. Iniciar el servidor en el puerto definido

**Configuracion de CORS:**
```
Origenes permitidos:
- http://localhost:3000    (desarrollo local)
- http://localhost:5173    (Vite desarrollo)
- https://segura-mente-app-final.vercel.app
- process.env.CLIENT_URL   (configurable por variable de entorno)
```

**Rutas montadas:**
```
/api/auth         -> routes/auth.js
/api/users        -> routes/users.js
/api/appointments -> routes/appointments.js
```

---

### 5.2 config/database.js - Conexion a MySQL

Crea y exporta un **pool de conexiones** MySQL usando `mysql2/promise`. El pool permite reutilizar conexiones en lugar de abrir una nueva por cada peticion, mejorando el rendimiento.

**Parametros del pool:**
- `connectionLimit: 10` - Maximo 10 conexiones simultaneas
- `connectTimeout: 60000` - Tiempo de espera de conexion: 60 segundos
- `ssl: { rejectUnauthorized: false }` - SSL activo en produccion cuando `DB_SSL=true`

Al iniciarse, el modulo ejecuta `SELECT 1` para verificar la conexion e imprime el resultado en consola.

---

### 5.3 models/User.js - Modelo de Usuario

Clase estatica con todos los metodos de acceso a la tabla `usuarios`. Todos los metodos son `async` y retornan Promises.

| Metodo | Parametros | Retorna | Descripcion |
|--------|-----------|---------|-------------|
| `findByEmail(email)` | email: String | Object / undefined | Busca usuario por email (PK) |
| `findByUsername(nombreUsuario)` | nombreUsuario: String | Object / undefined | Busca por nombre de usuario |
| `findByIdentification(identificacion)` | identificacion: String | Object / undefined | Busca por numero de documento |
| `findAll()` | - | Array | Retorna todos los usuarios |
| `create(userData)` | userData: Object | Object | Inserta nuevo usuario |
| `update(email, userData)` | email: String, userData: Object | Object | Actualiza datos del usuario |
| `updatePassword(email, newPassword)` | email: String, newPassword: String | void | Actualiza hash de contrasena |
| `updateLastAccess(email)` | email: String | void | Registra timestamp de ultimo acceso |
| `verifyByEmail(email)` | email: String | void | Marca usuario como verificado |
| `delete(email)` | email: String | void | Elimina usuario por email |

---

### 5.4 models/Appointment.js - Modelo de Cita

Clase estatica con metodos de acceso a la tabla `citas`. Incluye metodos auxiliares privados para mapeo y formato de datos.

| Metodo | Parametros | Retorna | Descripcion |
|--------|-----------|---------|-------------|
| `findAll()` | - | Array | Todas las citas ordenadas por fecha |
| `findById(id)` | id: String | Object / null | Cita por UUID, mapeada a camelCase |
| `findByPsychologist(email)` | email: String | Array | Citas asignadas a un psicologo |
| `create(data)` | data: Object | Object | Crea cita con UUID autogenerado |
| `update(id, data)` | id: String, data: Object | Object | Actualiza campos de la cita |
| `cancel(id, cancelledBy)` | id: String, cancelledBy: String | Object | Cancela cita y registra quien cancelo |
| `countActiveByClient(email)` | email: String | Number | Cuenta citas activas del cliente |
| `isSlotTaken(date, time, email)` | date, time, email | Boolean | Verifica disponibilidad de horario |
| `generateId()` (privado) | - | String | Genera UUID v4 |
| `mapRow(row)` (privado) | row: Object | Object | Convierte snake_case de BD a camelCase |
| `formatDate(value)` (privado) | value | String | Normaliza formato de fecha a YYYY-MM-DD |

---

### 5.5 controllers/authController.js

Gestiona el registro e inicio de sesion. Metodos exportados:

**`register(req, res)`**
1. Extrae campos del `req.body`
2. Verifica unicidad de email, nombre de usuario e identificacion
3. Encripta la contrasena con `bcrypt.hash(password, 10)`
4. Crea el usuario en la BD
5. Auto-verifica el usuario (workaround por email no configurado)
6. Responde con exito inmediatamente
7. Intenta enviar email de verificacion en segundo plano (no bloqueante)

**`login(req, res)`**
1. Busca el usuario por email
2. Compara la contrasena con `bcrypt.compare()`
3. Genera token JWT con `jwt.sign({ email, nombreUsuario, tipoUsuario }, secret, { expiresIn: '7d' })`
4. Actualiza el campo `ultimo_acceso`
5. Retorna el token y los datos del usuario

---

### 5.6 controllers/userController.js

CRUD de usuarios, accesible unicamente con token JWT valido.

| Metodo | HTTP | Ruta | Descripcion |
|--------|------|------|-------------|
| `getAllUsers` | GET | `/api/users` | Lista todos los usuarios |
| `getUserByEmail` | GET | `/api/users/:email` | Obtiene un usuario especifico |
| `createUser` | POST | `/api/users` | Crea usuario (admin) |
| `updateUser` | PUT | `/api/users/:email` | Actualiza usuario |
| `deleteUser` | DELETE | `/api/users/:email` | Elimina usuario |

---

### 5.7 controllers/appointmentController.js

Gestiona el ciclo de vida de las citas.

| Metodo exportado | HTTP | Ruta | Descripcion |
|-----------------|------|------|-------------|
| `getAppointments` | GET | `/api/appointments` | Lista todas las citas |
| `createAppointment` | POST | `/api/appointments` | Crea cita validando limite y disponibilidad |
| `updateAppointment` | PUT | `/api/appointments/:id` | Modifica cita (solo el cliente dueno) |
| `cancelAppointment` | PATCH | `/api/appointments/:id/cancel` | Cancela cita como cliente |
| `getMyAppointmentsAsPsychologist` | GET | `/api/appointments/psychologist` | Citas del psicologo autenticado |
| `cancelByPsychologist` | PATCH | `/api/appointments/:id/cancel-by-psychologist` | Cancela cita como psicologo |

**Validaciones en `createAppointment`:**
- El cliente no puede tener mas de 2 citas activas simultaneamente
- El horario seleccionado no debe estar ocupado para ese psicologo en esa fecha

**Control de acceso:**
- `cancelAppointment`: verifica que `client_email === req.user.email`
- `cancelByPsychologist`: verifica que `psychologist_email === req.user.email`

---

### 5.8 middleware/validation.js

**`authenticateToken(req, res, next)`**
Middleware que verifica el token JWT en el header `Authorization: Bearer <token>`.
- Si el token es valido: adjunta el payload decodificado en `req.user` y llama a `next()`
- Si el token falta o es invalido: retorna HTTP 401

**`registerValidation`**
Array de reglas `express-validator` para el endpoint de registro. Valida:
- Formato y longitud de cada campo
- Tipo de identificacion (solo CC o CE)
- Edad minima de 18 anos
- Formato de email
- Campos condicionales para Psicologo/empleado

---

## 6. Documentacion del Codigo - Frontend

### 6.1 App.jsx - Router Principal

Define todas las rutas de la SPA usando `react-router-dom`. Las rutas protegidas estan envueltas en el componente `ProtectedRoute`.

| Ruta | Componente | Protegida |
|------|-----------|-----------|
| `/` | Login | No |
| `/login` | Login | No |
| `/registro` | RegisterPage | No |
| `/verificacion` | VerificationPage | No |
| `/verify` | VerifyEmailPage | No |
| `/exito` / `/success` | SuccessPage | No |
| `/forgot-password` | ForgotPasswordPage | No |
| `/reset-password` | ResetPasswordPage | No |
| `/dashboard` | DashboardPage | Si |
| `/citas` | AppointmentPage | Si |

---

### 6.2 config/api.js - URL Base de la API

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
export default API_BASE_URL;
```

Centraliza la URL del backend. En produccion usa la variable de entorno de Vercel; en desarrollo usa `localhost:5000/api` como fallback.

---

### 6.3 components/ProtectedRoute.jsx

Higher-Order Component (HOC) que verifica la existencia del token JWT en `localStorage` antes de renderizar la pagina protegida. Si no hay token, redirige al login usando `<Navigate to="/login" replace />`.

---

### 6.4 hooks/useSessionTimeout.js

Hook personalizado que implementa el control de sesion por inactividad.

**Parametros:**
- `timeoutMinutes` (default: 5) - Minutos de inactividad antes de cerrar la sesion
- `warningMinutes` (default: 1) - Minutos antes del cierre en que aparece la advertencia

**Retorna:**
- `showWarning` (Boolean) - Indica si mostrar el modal de advertencia
- `remainingTime` (Number) - Segundos restantes en la cuenta regresiva
- `resetTimer()` - Funcion para reiniciar el temporizador

**Eventos escuchados:** `mousemove`, `mousedown`, `keypress`, `scroll`, `touchstart`

---

### 6.5 pages/AppointmentPage.jsx

Pagina de citas que renderiza un componente diferente segun el tipo de usuario:

```javascript
const tipo = (user.tipoUsuario || '').toLowerCase();
const esPsicologo = tipo.includes('empleado') || tipo.includes('psic');

// Renderiza:
esPsicologo ? <PsychologistAppointments /> : <AppointmentScheduler />
```

La comparacion es **insensible a mayusculas y tildes** para garantizar compatibilidad con variaciones en el valor almacenado.

---

### 6.6 components/Appointments/AppointmentScheduler.jsx

Componente principal del modulo de citas para clientes. Funcionalidades:

- Carga lista de citas del cliente desde `GET /api/appointments`
- Carga lista de psicologos desde `GET /api/users` (filtra tipo Psicologo/empleado)
- Renderiza un calendario mensual navegable
- Gestiona los estados: crear cita, editar cita, cancelar cita
- Muestra el indicador "cancelada por el psicologo" cuando `appointment.cancelledBy === 'psicologo'`

**Horarios disponibles:**
```javascript
const TIME_SLOTS = ['08:00', '09:30', '11:00', '14:00', '15:30', '17:00'];
```

---

### 6.7 components/Appointments/PsychologistAppointments.jsx

Panel de citas para psicologos. Funcionalidades:

- Carga citas propias desde `GET /api/appointments/psychologist`
- Clasifica citas en pendientes (`status === 'Agendada'`) y canceladas
- Permite cancelar citas mediante `PATCH /api/appointments/:id/cancel-by-psychologist`
- Actualiza la lista en tiempo real sin recargar la pagina al cancelar

---

### 6.8 pages/DashboardPage.jsx

Pagina principal post-login. Gestiona:

- Lectura del `tipoUsuario` desde `localStorage` para determinar el rol
- Variable `isAdmin`: verifica email y nombre de usuario del administrador del sistema
- Variable `tipoUsuario`: determina si mostrar `PsychologistAppointments` o `AppointmentScheduler` en la vista de citas
- Estado `currentView`: controla que componente se muestra en el area central

**Vistas disponibles:**

| currentView | Componente mostrado |
|-------------|-------------------|
| `home` | Mensaje de bienvenida |
| `editar` | UserList |
| `edit-form` | UserEditForm |
| `registrar` | UserRegisterForm |
| `citas` | AppointmentScheduler o PsychologistAppointments (segun rol) |

---

## 7. Base de Datos

### 7.1 Motor y Configuracion

- Motor: **InnoDB** (soporte de transacciones y claves foraneas)
- Charset: **utf8mb4** (soporte completo de Unicode incluyendo emojis)
- Collation: **utf8mb4_unicode_ci** (comparacion insensible a mayusculas/tildes)

### 7.2 Tabla: usuarios

| Columna | Tipo | Restriccion | Descripcion |
|---------|------|-------------|-------------|
| email | VARCHAR(150) | PK | Identificador unico del usuario |
| nombre_usuario | VARCHAR(100) | NOT NULL, UNIQUE | Nombre de usuario en la plataforma |
| tipo_identificacion | VARCHAR(5) | NOT NULL | CC o CE |
| identificacion | VARCHAR(50) | NOT NULL, UNIQUE | Numero de documento |
| fecha_nacimiento | DATE | NOT NULL | Mayor de 18 anos |
| telefono | VARCHAR(20) | NOT NULL | 10 digitos |
| direccion | VARCHAR(255) | NOT NULL | Direccion de residencia |
| tipo_usuario | VARCHAR(50) | DEFAULT 'Cliente' | Rol del usuario |
| formacion_profesional | VARCHAR(255) | NULL | Solo para psicologos |
| tarjeta_profesional | VARCHAR(100) | NULL | Solo para psicologos |
| password | VARCHAR(255) | NOT NULL | Hash bcrypt |
| verificado | TINYINT(1) | DEFAULT 0 | Estado de verificacion |
| token_verificacion | VARCHAR(255) | NULL | Token de verificacion de email |
| token_recuperacion | VARCHAR(255) | NULL | Token de recuperacion de contrasena |
| token_recuperacion_expira | DATETIME | NULL | Expiracion del token |
| fecha_registro | TIMESTAMP | DEFAULT NOW() | Creacion del registro |
| ultimo_acceso | TIMESTAMP | NULL | Ultimo login exitoso |

### 7.3 Tabla: citas

| Columna | Tipo | Restriccion | Descripcion |
|---------|------|-------------|-------------|
| id | VARCHAR(36) | PK | UUID de la cita |
| client_email | VARCHAR(150) | FK -> usuarios.email | Email del cliente |
| client_name | VARCHAR(100) | NOT NULL | Nombre del cliente |
| date | DATE | NOT NULL | Fecha de la cita |
| time | VARCHAR(10) | NOT NULL | Hora de la cita |
| psychologist_email | VARCHAR(150) | FK -> usuarios.email | Email del psicologo |
| psychologist_name | VARCHAR(100) | NOT NULL | Nombre del psicologo |
| psychologist_specialty | VARCHAR(255) | DEFAULT 'Psicologo/a' | Especialidad |
| notes | TEXT | NULL | Notas del cliente |
| status | ENUM | DEFAULT 'Agendada' | Agendada / Cancelada |
| cancelled_by | VARCHAR(20) | NULL | 'cliente' o 'psicologo' |
| created_at | TIMESTAMP | DEFAULT NOW() | Creacion del registro |
| updated_at | TIMESTAMP | ON UPDATE NOW() | Ultima modificacion |

### 7.4 Relaciones

```
usuarios.email (1) <----> (N) citas.client_email
usuarios.email (1) <----> (N) citas.psychologist_email
```

Un mismo usuario puede aparecer como cliente en muchas citas y como psicologo en muchas citas.

### 7.5 Indices

```sql
-- Tabla usuarios
idx_nombre_usuario       -> nombre_usuario
idx_identificacion       -> identificacion
idx_token_verificacion   -> token_verificacion
idx_token_recuperacion   -> token_recuperacion

-- Tabla citas
idx_client_email         -> client_email
idx_psychologist_email   -> psychologist_email
idx_status               -> status
idx_date                 -> date
```

---

## 8. API REST - Endpoints

### 8.1 Autenticacion

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar nuevo usuario |
| POST | `/api/auth/login` | No | Iniciar sesion y obtener JWT |

**Ejemplo: POST /api/auth/login**

Request:
```json
{
  "email": "usuario@correo.com",
  "password": "MiContrasena123*"
}
```

Response exitoso (200):
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": {
    "email": "usuario@correo.com",
    "nombreUsuario": "UsuarioPrueba",
    "tipoUsuario": "Cliente"
  }
}
```

### 8.2 Usuarios

Todas requieren header: `Authorization: Bearer <token>`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/users` | Listar todos los usuarios |
| GET | `/api/users/:email` | Obtener usuario por email |
| POST | `/api/users` | Crear usuario (admin) |
| PUT | `/api/users/:email` | Actualizar usuario |
| DELETE | `/api/users/:email` | Eliminar usuario |

### 8.3 Citas

Todas requieren header: `Authorization: Bearer <token>`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/appointments` | Listar todas las citas |
| GET | `/api/appointments/psychologist` | Citas del psicologo autenticado |
| POST | `/api/appointments` | Crear nueva cita |
| PUT | `/api/appointments/:id` | Modificar cita |
| PATCH | `/api/appointments/:id/cancel` | Cancelar cita (cliente) |
| PATCH | `/api/appointments/:id/cancel-by-psychologist` | Cancelar cita (psicologo) |

### 8.4 Codigos de Respuesta

| Codigo | Significado |
|--------|-------------|
| 200 | Operacion exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Datos de entrada invalidos o regla de negocio no cumplida |
| 401 | Token ausente, invalido o expirado |
| 403 | Sin permiso para la operacion solicitada |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## 9. Autenticacion y Seguridad

### 9.1 Flujo de Autenticacion JWT

```
1. Cliente envia credenciales -> POST /api/auth/login
2. Backend verifica con bcrypt
3. Backend genera JWT:
   jwt.sign(
     { email, nombreUsuario, tipoUsuario },
     process.env.JWT_SECRET,
     { expiresIn: '7d' }
   )
4. Token se almacena en localStorage del navegador
5. Cada peticion protegida incluye: Authorization: Bearer <token>
6. Middleware authenticateToken decodifica y verifica el token
7. Payload disponible en req.user para los controladores
```

### 9.2 Medidas de Seguridad Implementadas

| Medida | Implementacion |
|--------|---------------|
| Hash de contrasenas | bcrypt con factor de coste 10 |
| Autenticacion sin estado | JWT con expiracion de 7 dias |
| Validacion de entrada | express-validator en todos los endpoints de escritura |
| Control de origenes | CORS con lista blanca de dominios permitidos |
| Cifrado en transito | HTTPS en todos los entornos de produccion |
| Cifrado BD | Conexion MySQL con SSL en produccion (`DB_SSL=true`) |
| Variables sensibles | dotenv; ningun secreto en el codigo fuente |
| Control de acceso | Verificacion de propiedad en cancelacion de citas |

### 9.3 Control de Sesion en el Frontend

El hook `useSessionTimeout` implementa cierre automatico por inactividad:
- Tiempo total: 5 minutos
- Advertencia: al minuto 4 (1 minuto antes)
- Al cerrar: elimina token y userData de localStorage, redirige al login con `replace: true`

---

## 10. Variables de Entorno

### 10.1 Backend (backend/.env)

| Variable | Tipo | Requerida | Descripcion |
|----------|------|-----------|-------------|
| `PORT` | Number | Si | Puerto del servidor (5000 local, 5000 produccion) |
| `NODE_ENV` | String | Si | `development` o `production` |
| `DB_HOST` | String | Si | Host de MySQL |
| `DB_PORT` | Number | No | Puerto MySQL (default: 3306) |
| `DB_USER` | String | Si | Usuario MySQL |
| `DB_PASSWORD` | String | Si | Contrasena MySQL |
| `DB_NAME` | String | Si | Nombre de la base de datos |
| `DB_SSL` | Boolean | No | Activar SSL (default: false) |
| `JWT_SECRET` | String | Si | Clave para firmar tokens (minimo 32 caracteres) |
| `JWT_EXPIRE` | String | No | Expiracion del token (default: 7d) |
| `CLIENT_URL` | String | Si | URL del frontend para CORS |
| `EMAIL_USER` | String | No | Correo SMTP (no funcional en produccion actual) |
| `EMAIL_PASS` | String | No | Contrasena SMTP |
| `EMAIL_FROM` | String | No | Remitente de correos |

### 10.2 Frontend (.env en raiz)

| Variable | Tipo | Requerida | Descripcion |
|----------|------|-----------|-------------|
| `REACT_APP_API_URL` | String | Si | URL base del backend incluyendo `/api` |

> Las variables de React deben comenzar con `REACT_APP_` para ser accesibles en el codigo del cliente. Son compiladas en el build; un cambio requiere redeploy.

---

## 11. Despliegue en Produccion

### 11.1 CI/CD Automatico

El repositorio en GitHub esta conectado a Vercel y Render mediante webhooks. Cualquier push a la rama `master` desencadena automaticamente:

1. **Render:** ejecuta `npm install` y reinicia el servidor con el nuevo codigo
2. **Vercel:** ejecuta `npm run build` (CRA) y publica los archivos estaticos en el CDN

### 11.2 Configuracion de vercel.json

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "src": "/static/(.*)", "dest": "/static/$1" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

La regla `"/(.*)" -> "/index.html"` es critica para las SPAs: garantiza que todas las rutas retornen el `index.html` y React Router maneje la navegacion en el cliente.

### 11.3 URLs de Produccion

| Servicio | URL |
|---------|-----|
| Frontend | https://segura-mente-app-final.vercel.app |
| Backend | https://segura-mente-app-ga8-220501096-aa1-ev02.onrender.com |
| Repositorio | https://github.com/Juanflo112/Segura-Mente-App-Final.git |

---

## 12. Mantenimiento y Solucion de Problemas

### 12.1 Problemas Comunes

**El backend tarda en responder la primera peticion**

Causa: El plan gratuito de Render suspende el servidor tras 15 minutos de inactividad.  
Solucion: La primera peticion activa el servidor; esperar entre 20 y 30 segundos.

**Error CORS al consumir la API**

Causa: El dominio del frontend no esta en la lista de origenes permitidos en `server.js`.  
Solucion: Verificar que `CLIENT_URL` en Render tenga el valor exacto de la URL de Vercel, incluyendo el protocolo `https://`.

**El registro tarda mucho en responder**

Causa: El servidor intenta conectar al SMTP antes de responder.  
Solucion: Ya corregido en la version actual. El envio de email es no bloqueante y los timeouts del transporter SMTP estan en 5 segundos.

**La vista del psicologo muestra el calendario en lugar del panel de citas**

Causa: El `tipoUsuario` en `localStorage` tiene un valor diferente al esperado.  
Solucion: Cerrar sesion e iniciar sesion nuevamente para actualizar los datos en `localStorage`. La comparacion es insensible a mayusculas y tildes.

**Error "Ruta no encontrada" al consumir `/api/appointments/psychologist`**

Causa: El backend desplegado en Render no tiene la version mas reciente del codigo.  
Solucion: En Render > Deployments, verificar que el ultimo deploy sea exitoso. Si no, ejecutar Manual Deploy.

### 12.2 Comandos Utiles

```bash
# Verificar que el backend responde
curl https://segura-mente-app-ga8-220501096-aa1-ev02.onrender.com/

# Ver logs del backend en Render
# Dashboard de Render > Servicio > Logs

# Verificar estado del ultimo deploy
git log --oneline -5

# Forzar redeploy empujando un commit vacio
git commit --allow-empty -m "forzar redeploy"
git push
```

### 12.3 Actualizacion del Sistema

Para aplicar cambios en produccion:

```bash
# 1. Realizar cambios en los archivos
# 2. Probar localmente
# 3. Agregar cambios al staging
git add .

# 4. Crear el commit con mensaje descriptivo en espanol
git commit -m "descripcion clara del cambio realizado"

# 5. Publicar en el repositorio remoto
git push

# Render y Vercel redesplieguen automaticamente en los siguientes 2-5 minutos
```

---

*Manual Tecnico - Segura-Mente App*  
*Autor: Juan Pablo Mejia Vargas - SENA*  
*Version 2.0.0 - Julio 2026*
