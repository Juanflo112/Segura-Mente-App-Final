# Segura-Mente App

**Proyecto:** Segura-Mente - Sistema de Gestion de Usuarios y Agendamiento de Citas  
**Evidencia:** GA8-220501096-AA1-EV02 modulos integrados  
**Autor:** Juan Pablo Mejia Vargas  
**Programa:** Analisis y Desarrollo de Software - SENA  
**Version:** 2.0.0  
**Ultima actualizacion:** Julio 2026

---

> **Nota sobre migracion del repositorio:** Este proyecto fue migrado desde el repositorio
> original [`segura-mente-app-GA8-220501096-AA1-EV02`](https://github.com/Juanflo112/segura-mente-app-GA8-220501096-AA1-EV02.git)
> al repositorio actual [`Segura-Mente-App-Final`](https://github.com/Juanflo112/Segura-Mente-App-Final.git)
> por motivos de mejoras en la funcionalidad y optimizacion del proceso de despliegue en produccion.

---

## Tabla de Contenidos

1. [Descripcion de la Solucion](#descripcion-de-la-solucion)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Instalacion Local](#instalacion-local)
6. [Proceso de Despliegue en Produccion](#proceso-de-despliegue-en-produccion)
7. [URLs de Produccion](#urls-de-produccion)
8. [API REST - Endpoints](#api-rest---endpoints)
9. [Derechos de Autor](#derechos-de-autor)

---

## Descripcion de la Solucion

**Segura-Mente** es una aplicacion web orientada a la gestion de salud mental, que permite a los usuarios registrarse, verificar su identidad por correo electronico y agendar citas con psicologos registrados en el sistema.

### Funcionalidades principales

- Registro de usuarios con validaciones completas (datos personales, tipo de identificacion, fecha de nacimiento, telefono, direccion)
- Verificacion de correo electronico mediante token unico
- Recuperacion de contrasena por email
- Autenticacion con JWT (JSON Web Tokens)
- Control de sesion por inactividad con advertencia previa al cierre automatico
- Dashboard diferenciado por tipo de usuario:
  - **Cliente:** puede agendar, modificar y cancelar citas con psicologos disponibles
  - **Psicologo/Empleado:** visualiza sus citas agendadas y puede cancelarlas; el cliente es notificado en su dashboard cuando una cita es cancelada por el psicologo
  - **Administrador:** gestion completa de usuarios (crear, editar, eliminar)
- Encriptacion de contrasenas con bcrypt
- API REST con Express.js

### Tipos de usuario

| Tipo | Descripcion |
|------|-------------|
| Cliente | Usuario que agenda citas con psicologos |
| Psicologo/Empleado | Profesional que gestiona sus citas asignadas |
| Administrador | Acceso total al sistema de gestion de usuarios |

---

## Arquitectura del Sistema

```
Usuario (Navegador)
       |
       | HTTPS
       v
+-------------------------------+
|  FRONTEND (React)             |
|  Plataforma: Vercel           |
|  segura-mente-app-final.      |
|  vercel.app                   |
+-------------------------------+
       |
       | REST API / HTTPS / CORS
       v
+-------------------------------+
|  BACKEND (Node.js + Express)  |
|  Plataforma: Render           |
|  segura-mente-app-ga8-        |
|  220501096-aa1-ev02.          |
|  onrender.com                 |
+-------------------------------+
       |
       | MySQL / SSL
       v
+-------------------------------+
|  BASE DE DATOS (MySQL 8.0)    |
|  Plataforma: Railway          |
|  caboose.proxy.rlwy.net       |
+-------------------------------+
```

**Flujo de comunicacion:**
1. El usuario accede al frontend alojado en Vercel
2. El frontend realiza peticiones HTTP al backend en Render usando la variable de entorno `REACT_APP_API_URL`
3. El backend autentica mediante JWT y consulta la base de datos MySQL en Railway con conexion SSL
4. El backend permite origenes CORS configurados mediante la variable `CLIENT_URL`

---

## Tecnologias Utilizadas

### Frontend

| Tecnologia | Version | Uso |
|-----------|---------|-----|
| React | 19.x | Framework de interfaz |
| React Router DOM | 7.x | Navegacion entre paginas |
| React Scripts (CRA) | 5.0.1 | Bundler y configuracion |
| CSS3 | - | Estilos personalizados |

### Backend

| Tecnologia | Version | Uso |
|-----------|---------|-----|
| Node.js | 18+ | Entorno de ejecucion |
| Express | 5.x | Framework HTTP |
| mysql2 | 3.x | Conexion a MySQL |
| bcryptjs | 3.x | Encriptacion de contrasenas |
| jsonwebtoken | 9.x | Autenticacion JWT |
| nodemailer | 7.x | Envio de correos electronicos |
| express-validator | 7.x | Validacion de datos de entrada |
| dotenv | 17.x | Gestion de variables de entorno |

### Infraestructura

| Servicio | Plataforma | Descripcion |
|---------|-----------|-------------|
| Frontend | Vercel | Despliegue estatico con auto-deploy desde GitHub |
| Backend | Render | Servicio web Node.js con auto-deploy desde GitHub |
| Base de datos | Railway | MySQL 8.0 gestionado en la nube |

---

## Estructura del Proyecto

```
segura-mente-app/
|
+-- backend/                          # Servidor Node.js + Express
|   +-- config/
|   |   +-- database.js               # Conexion pool MySQL con SSL
|   +-- controllers/
|   |   +-- authController.js         # Registro, login, verificacion, recuperacion
|   |   +-- userController.js         # CRUD de usuarios
|   |   +-- appointmentController.js  # Gestion de citas
|   +-- middleware/
|   |   +-- validation.js             # Validaciones y autenticacion JWT
|   +-- models/
|   |   +-- User.js                   # Modelo de usuario
|   |   +-- Appointment.js            # Modelo de cita
|   +-- routes/
|   |   +-- auth.js                   # Rutas de autenticacion
|   |   +-- users.js                  # Rutas de usuarios
|   |   +-- appointments.js           # Rutas de citas
|   +-- utils/
|   |   +-- email.js                  # Servicio de envio de correos
|   +-- migrations/                   # Scripts de migracion de BD
|   +-- database.sql                  # Script inicial de base de datos
|   +-- server.js                     # Punto de entrada del servidor
|   +-- package.json
|
+-- src/                              # Frontend React
|   +-- components/
|   |   +-- Appointments/
|   |   |   +-- AppointmentScheduler.jsx      # Calendario de citas (cliente)
|   |   |   +-- PsychologistAppointments.jsx  # Panel de citas (psicologo)
|   |   +-- Dashboard/
|   |   |   +-- Sidebar.jsx           # Menu lateral del dashboard
|   |   |   +-- UserList.jsx          # Lista de usuarios (admin)
|   |   |   +-- UserEditForm.jsx      # Formulario edicion usuario
|   |   |   +-- UserRegisterForm.jsx  # Formulario registro por admin
|   |   +-- Login/
|   |   |   +-- Login.jsx
|   |   |   +-- LoginForm.jsx
|   |   +-- Register/
|   |   |   +-- RegisterForm.jsx
|   |   +-- ProtectedRoute.jsx        # Rutas protegidas por JWT
|   |   +-- SessionWarning.jsx        # Advertencia de inactividad
|   +-- pages/
|   |   +-- DashboardPage.jsx         # Dashboard principal
|   |   +-- AppointmentPage.jsx       # Pagina de citas
|   |   +-- RegisterPage.jsx
|   |   +-- ForgotPasswordPage.jsx
|   |   +-- ResetPasswordPage.jsx
|   |   +-- VerificationPage.jsx
|   +-- config/
|   |   +-- api.js                    # URL base de la API
|   +-- hooks/
|   |   +-- useSessionTimeout.js      # Hook de control de sesion
|   +-- App.jsx                       # Componente raiz con rutas
|
+-- public/                           # Archivos publicos estaticos
+-- vercel.json                       # Configuracion de despliegue Vercel
+-- package.json
+-- README.md
```

---

## Instalacion Local

### Requisitos previos

- Node.js 18 o superior
- MySQL 8.0 (o XAMPP)
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/Juanflo112/Segura-Mente-App-Final.git
cd Segura-Mente-App-Final
```

### 2. Configurar el frontend

```bash
npm install
```

Crear el archivo `.env` en la raiz del proyecto:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Configurar el backend

```bash
cd backend
npm install
```

Crear el archivo `backend/.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=seguramente_db
DB_SSL=false
JWT_SECRET=clave_secreta_larga_y_aleatoria
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_contrasena_de_aplicacion_gmail
EMAIL_FROM=tu_correo@gmail.com
```

### 4. Crear la base de datos

Ejecutar en MySQL local:

```sql
CREATE DATABASE IF NOT EXISTS seguramente_db;
USE seguramente_db;
```

Luego ejecutar el contenido del archivo `backend/database.sql` y la siguiente migracion adicional:

```sql
ALTER TABLE citas ADD COLUMN cancelled_by VARCHAR(20) DEFAULT NULL AFTER status;
```

### 5. Iniciar la aplicacion

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend (desde la raiz)
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Proceso de Despliegue en Produccion

El despliegue se realiza en tres plataformas independientes. El orden recomendado es: Railway (BD) > Render (Backend) > Vercel (Frontend).

### Paso 1 - Base de datos en Railway

1. Crear cuenta en [railway.app](https://railway.app) con GitHub
2. **New Project** > **Database** > **Add MySQL**
3. En el servicio MySQL, pestana **Query**, ejecutar el script SQL completo:

```sql
CREATE TABLE IF NOT EXISTS usuarios (
    email VARCHAR(150) PRIMARY KEY,
    nombre_usuario VARCHAR(100) NOT NULL UNIQUE,
    tipo_identificacion VARCHAR(5) NOT NULL,
    identificacion VARCHAR(50) NOT NULL UNIQUE,
    fecha_nacimiento DATE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    direccion VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) DEFAULT 'Cliente',
    formacion_profesional VARCHAR(255),
    tarjeta_profesional VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    verificado BOOLEAN DEFAULT FALSE,
    token_verificacion VARCHAR(255),
    token_recuperacion VARCHAR(255) DEFAULT NULL,
    token_recuperacion_expira DATETIME DEFAULT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP NULL
);
```

Ejecutar los indices de forma individual (uno por vez en el Query Editor):

```sql
CREATE INDEX idx_nombre_usuario ON usuarios(nombre_usuario);
```
```sql
CREATE INDEX idx_identificacion ON usuarios(identificacion);
```
```sql
CREATE INDEX idx_token_verificacion ON usuarios(token_verificacion);
```
```sql
CREATE INDEX idx_token_recuperacion ON usuarios(token_recuperacion);
```

Luego la tabla de citas:

```sql
CREATE TABLE IF NOT EXISTS citas (
    id VARCHAR(36) PRIMARY KEY,
    client_email VARCHAR(150) NOT NULL,
    client_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(10) NOT NULL,
    psychologist_email VARCHAR(150) NOT NULL,
    psychologist_name VARCHAR(100) NOT NULL,
    psychologist_specialty VARCHAR(255) DEFAULT 'Psicologo/a',
    notes TEXT,
    status ENUM('Agendada', 'Cancelada') DEFAULT 'Agendada',
    cancelled_by VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_client_email (client_email),
    INDEX idx_psychologist_email (psychologist_email),
    INDEX idx_status (status),
    INDEX idx_date (date)
);
```

4. En la pestana **Variables**, copiar el valor de `MYSQL_PUBLIC_URL`:  
   Formato: `mysql://root:PASSWORD@HOST:PORT/railway`

### Paso 2 - Backend en Render

1. Crear cuenta en [render.com](https://render.com) con GitHub
2. **New** > **Web Service** > Conectar repositorio `Segura-Mente-App-Final`
3. Configuracion del servicio:

| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

4. Variables de entorno requeridas:

| Variable | Descripcion |
|----------|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DB_HOST` | Host publico de Railway |
| `DB_PORT` | Puerto publico de Railway |
| `DB_USER` | `root` |
| `DB_PASSWORD` | Password de Railway |
| `DB_NAME` | `railway` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | Cadena aleatoria segura (minimo 32 caracteres) |
| `JWT_EXPIRE` | `7d` |
| `CLIENT_URL` | URL del frontend en Vercel (se completa despues) |
| `EMAIL_USER` | Correo SMTP |
| `EMAIL_PASS` | Contrasena de aplicacion SMTP |
| `EMAIL_FROM` | Remitente de correos |

5. Copiar la URL generada: `https://nombre-servicio.onrender.com`

### Paso 3 - Frontend en Vercel

1. Crear cuenta en [vercel.com](https://vercel.com) con GitHub
2. **Add New Project** > Importar `Segura-Mente-App-Final`
3. Preset: **Create React App**
4. Agregar la variable de entorno antes de hacer deploy:

| Variable | Valor |
|----------|-------|
| `REACT_APP_API_URL` | `https://nombre-servicio.onrender.com/api` |

5. Hacer deploy y copiar la URL del frontend
6. Volver a Render, actualizar `CLIENT_URL` con la URL de Vercel y hacer **Manual Deploy**

### Actualizacion continua

Cualquier `git push` a la rama `master` desencadena automaticamente el redespliegue en Render y Vercel.

---

## URLs de Produccion

| Servicio | URL |
|---------|-----|
| Frontend (Vercel) | https://segura-mente-app-final.vercel.app |
| Backend (Render) | https://segura-mente-app-ga8-220501096-aa1-ev02.onrender.com |
| Repositorio GitHub | https://github.com/Juanflo112/Segura-Mente-App-Final.git |

---

## API REST - Endpoints

Todas las rutas protegidas requieren el header:
```
Authorization: Bearer <token_jwt>
```

### Autenticacion

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/register` | Registro de usuario | No |
| POST | `/api/auth/login` | Inicio de sesion | No |
| GET | `/api/auth/verify` | Verificacion de email por token | No |
| POST | `/api/auth/resend-verification` | Reenviar email de verificacion | No |
| POST | `/api/auth/forgot-password` | Solicitar recuperacion de contrasena | No |
| POST | `/api/auth/reset-password` | Restablecer contrasena | No |

### Usuarios

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| GET | `/api/users` | Listar todos los usuarios | Si |
| GET | `/api/users/:email` | Obtener usuario por email | Si |
| PUT | `/api/users/:email` | Actualizar usuario | Si |
| DELETE | `/api/users/:email` | Eliminar usuario | Si |

### Citas

| Metodo | Ruta | Descripcion | Auth |
|--------|------|-------------|------|
| GET | `/api/appointments` | Listar todas las citas | Si |
| GET | `/api/appointments/psychologist` | Citas del psicologo autenticado | Si |
| POST | `/api/appointments` | Crear nueva cita | Si |
| PUT | `/api/appointments/:id` | Modificar cita | Si |
| PATCH | `/api/appointments/:id/cancel` | Cancelar cita (por el cliente) | Si |
| PATCH | `/api/appointments/:id/cancel-by-psychologist` | Cancelar cita (por el psicologo) | Si |

---

## Derechos de Autor

```
Copyright (c) 2026 Juan Pablo Mejia Vargas

Este proyecto fue desarrollado como evidencia de aprendizaje para el programa
Tecnologia en Analisis y Desarrollo de Software del Servicio Nacional de
Aprendizaje (SENA), en el marco de la etapa productiva.

Evidencia: GA8-220501096-AA1-EV02
Ficha: 220501096

Queda prohibida la reproduccion total o parcial de este software con fines
comerciales sin autorizacion expresa del autor. El uso academico y educativo
esta permitido siempre que se cite la fuente original.

Repositorio actual:  https://github.com/Juanflo112/Segura-Mente-App-Final.git
Repositorio original: https://github.com/Juanflo112/segura-mente-app-GA8-220501096-AA1-EV02.git
```
