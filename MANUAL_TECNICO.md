# Manual Técnico - Segura Mente App

##  Información del Documento

**Proyecto:** Segura Mente - Sistema de Gestión de Usuarios  
**Versión:** 1.0.0  
**Fecha:** 12/01/2026
**Estudiante:** Juan Pablo Mejia Vargas
**Evidencia:** GA8-220501096-AA1-EV02 módulos integrados 
**Tipo:** Manual Técnico para Desarrolladores y Administradores

---

##  Índice

. [Arquitectura del Sistema](#arquitectura-del-sistema)
. [Instalación y Configuración Local](#instalación-y-configuración-local)
. [Estructura del Proyecto](#estructura-del-proyecto)
. [Tecnologías Utilizadas](#tecnologías-utilizadas)
. [Base de Datos](#base-de-datos)
. [API REST - Endpoints](#api-rest---endpoints)
7. [Autenticación y Seguridad](#autenticación-y-seguridad)
. [Deployment](#deployment)
. [Mantenimiento y Troubleshooting](#mantenimiento-y-troubleshooting)
0. [Escalabilidad y Mejoras Futuras](#escalabilidad-y-mejoras-futuras)

---

## . Arquitectura del Sistema

### . Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                        │
│                      (Navegador Web)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    FRONTEND (React)                          │
│                  Vercel Cloud Platform                       │
│  URL: segura-mente-app-frontend.vercel.app                   │
│                                                              │
│  - React ..0                                              │
│  - React Router 7.0.                                       │
│  - Axios para peticiones HTTP                                │
│  - LocalStorage para JWT                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ REST API (HTTPS)
                         │ CORS Enabled
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 BACKEND (Node.js + Express)                  │
│                   Render Cloud Platform                      │
│  URL: segura-mente-app-ga-000-aa-ev0.onrender.com  │
│                                                              │
│  - Express ..                                             │
│  - JWT Authentication                                        │
│  - Bcrypt Password Hashing                                   │
│  - MySQL Driver                                             │
│  - Nodemailer (Email)                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ MySQL Connection (SSL)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  BASE DE DATOS (MySQL .0)                   │
│                   Railway Cloud Platform                     │
│  Host: caboose.proxy.rlwy.net:                          │
│                                                              │
│  - Tabla: usuarios                                           │
│  - Índices optimizados                                       │
│  - SSL Required                                              │
│  - Public Networking Enabled                                 │
└──────────────────────────────────────────────────────────────┘
```

### . Patrón de Diseño

**Arquitectura:** Modelo-Vista-Controlador (MVC) Distribuido

- **Modelo (Model):** `backend/models/User.js` - Lógica de datos y consultas SQL
- **Vista (View):** `src/components/**/*.jsx` - Componentes React
- **Controlador (Controller):** `backend/controllers/**/*.js` - Lógica de negocio

**Separación de Responsabilidades:**
- Frontend: Presentación e interacción con usuario
- Backend: Lógica de negocio, validaciones, autenticación
- Database: Persistencia y almacenamiento

---

## . Instalación y Configuración Local

### . Requisitos Previos

```bash
Node.js: v.0.0 o superior
npm: v.0.0 o superior
MySQL: v.0 o superior
Git: v.0.0 o superior
```

### . Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/Juanflo/segura-mente-app-GA-000-AA-EV0.git

# Navegar al directorio
cd segura-mente-app-GA-000-AA-EV0
```

### . Configuración del Backend

```bash
# Navegar a la carpeta backend
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
# Copiar el contenido siguiente:
```

**Archivo `backend/.env`:**
```env
# Configuración del servidor
NODE_ENV=development
PORT=000

# Configuración de la base de datos
DB_HOST=localhost
DB_PORT=0
DB_USER=root
DB_PASSWORD=tu_password_mysql
DB_NAME=seguramente_db
DB_SSL=false

# JWT Secret (generar uno aleatorio para producción)
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRE=7d

# URL del Frontend (para CORS)
CLIENT_URL=http://localhost:000

# Configuración de Email (opcional en desarrollo)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=7
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_FROM=noreply@seguramente.com
```

### . Configuración de la Base de Datos Local

```bash
# Conectar a MySQL
mysql -u root -p

# Crear base de datos
CREATE DATABASE seguramente_db CHARACTER SET utfmb COLLATE utfmb_unicode_ci;

# Usar la base de datos
USE seguramente_db;

# Ejecutar el script de creación de tablas
source backend/database.sql;

# Ejecutar migraciones
source backend/migrations/add_employee_fields.sql;
source backend/migrations/add_password_reset_fields.sql;
```

### . Iniciar el Backend

```bash
# Desde la carpeta backend
npm start

# Deberías ver:
# Server running on port 000
# MySQL conectado exitosamente
```

### . Configuración del Frontend

```bash
# Volver a la raíz del proyecto
cd ..

# Instalar dependencias del frontend
npm install

# Crear archivo .env en la raíz
# Copiar el contenido siguiente:
```

**Archivo `.env` (raíz del proyecto):**
```env
REACT_APP_API_URL=http://localhost:000/api
```

### .7 Iniciar el Frontend

```bash
# Desde la raíz del proyecto
npm start

# Se abrirá automáticamente en http://localhost:000
```

---

## . Estructura del Proyecto

### . Estructura Completa

```
segura-mente-app/
│
├── backend/                          # Servidor Node.js + Express
│   ├── config/
│   │   └── database.js              # Configuración MySQL
│   ├── controllers/
│   │   ├── authController.js        # Lógica de autenticación
│   │   └── userController.js        # Lógica de gestión usuarios
│   ├── middleware/
│   │   └── validation.js            # Validaciones de entrada
│   ├── migrations/
│   │   ├── add_employee_fields.sql  # Migración campos empleado
│   │   └── add_password_reset_fields.sql
│   ├── models/
│   │   └── User.js                  # Modelo de usuario
│   ├── routes/
│   │   ├── auth.js                  # Rutas de autenticación
│   │   └── users.js                 # Rutas de usuarios
│   ├── utils/
│   │   └── email.js                 # Utilidad envío emails
│   ├── database.sql                 # Script inicial DB
│   ├── server.js                    # Punto de entrada backend
│   ├── package.json                 # Dependencias backend
│   └── .env                         # Variables de entorno
│
├── src/                             # Código fuente React
│   ├── components/                  # Componentes reutilizables
│   │   ├── Dashboard/
│   │   │   ├── Sidebar.jsx          # Menú lateral
│   │   │   ├── UserList.jsx         # Lista de usuarios
│   │   │   ├── UserEditForm.jsx     # Formulario edición
│   │   │   └── UserRegisterForm.jsx # Formulario registro admin
│   │   ├── Login/
│   │   │   ├── Login.jsx            # Layout login
│   │   │   └── LoginForm.jsx        # Formulario login
│   │   ├── Register/
│   │   │   ├── RegisterForm.jsx     # Formulario registro
│   │   │   ├── SuccessMessage.jsx   # Mensaje éxito
│   │   │   └── VerificationMessage.jsx
│   │   ├── Logo/
│   │   │   └── Logo.jsx             # Logo de la app
│   │   ├── ProtectedRoute.jsx       # HOC rutas protegidas
│   │   └── SessionWarning.jsx       # Advertencia timeout
│   ├── hooks/
│   │   └── useSessionTimeout.js     # Hook gestión sesión
│   ├── pages/                       # Páginas principales
│   │   ├── DashboardPage.jsx        # Página dashboard
│   │   ├── RegisterPage.jsx         # Página registro
│   │   ├── SuccessPage.jsx          # Página éxito
│   │   └── VerificationPage.jsx     # Página verificación
│   ├── config/
│   │   └── api.js                   # Configuración API
│   ├── App.jsx                      # Componente principal
│   ├── main.jsx                     # Punto de entrada React
│   └── index.css                    # Estilos globales
│
├── public/                          # Archivos públicos estáticos
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
│
├── build/                           # Build de producción (generado)
│
├── package.json                     # Dependencias frontend
├── README.md                        # Documentación principal
├── DEPLOYMENT.md                    # Guía de despliegue
├── DEPLOYMENT_URLS.md               # URLs de producción
├── DOCUMENTACION_MODULOS.md         # Este documento
├── DOCUMENTACION_PRUEBAS.md         # Documentación de pruebas
└── MANUAL_TECNICO.md                # Manual técnico
```

### . Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `backend/server.js` | Punto de entrada del backend, configura Express |
| `backend/config/database.js` | Pool de conexiones MySQL |
| `backend/models/User.js` | Operaciones CRUD de usuarios |
| `src/App.jsx` | Configuración de rutas y layout principal |
| `src/config/api.js` | Base URL del API centralizada |
| `src/hooks/useSessionTimeout.js` | Lógica de timeout de sesión |

---

## . Tecnologías Utilizadas

### . Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | ..0 | Framework UI |
| React Router DOM | 7.0. | Navegación SPA |
| Axios | .7. | Cliente HTTP |
| CSS | - | Estilos |

**Dependencias de Desarrollo:**
```json
{
  "@testing-library/react": "^.0.",
  "@testing-library/jest-dom": "^.7.0",
  "react-scripts": ".0."
}
```

### . Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | .x | Runtime JavaScript |
| Express | .. | Framework web |
| MySQL | .. | Driver MySQL |
| bcryptjs | .0. | Hash de contraseñas |
| jsonwebtoken | .0. | Autenticación JWT |
| cors | .0.0 | Manejo CORS |
| nodemailer | 7.0. | Envío de emails |
| dotenv | ..0 | Variables de entorno |

### . Base de Datos

| Componente | Detalle |
|------------|---------|
| Motor | MySQL .0 |
| Charset | utfmb |
| Collation | utfmb_unicode_ci |
| Storage Engine | InnoDB |
| Transacciones | Soportadas |

---

## . Base de Datos

### . Diagrama Entidad-Relación

```
┌──────────────────────────────────────────────────────────┐
│                      USUARIOS                             │
├──────────────────────────────────────────────────────────┤
│ PK  email                    VARCHAR(0)                 │
│     nombre_usuario           VARCHAR(00)  UNIQUE         │
│     tipo_identificacion      VARCHAR()                   │
│     identificacion           VARCHAR(0)   UNIQUE         │
│     fecha_nacimiento         DATE                         │
│     telefono                 VARCHAR(0)                  │
│     direccion                VARCHAR()                 │
│     tipo_usuario             VARCHAR(0)   DEFAULT Cliente│
│     formacion_profesional    VARCHAR()  NULL           │
│     tarjeta_profesional      VARCHAR(00)  NULL           │
│     password                 VARCHAR()                 │
│     verificado               BOOLEAN       DEFAULT FALSE  │
│     token_verificacion       VARCHAR()  NULL           │
│     token_recuperacion       VARCHAR()  NULL           │
│     token_recuperacion_expira DATETIME     NULL           │
│     fecha_registro           TIMESTAMP     AUTO           │
│     ultimo_acceso            TIMESTAMP     NULL           │
└──────────────────────────────────────────────────────────┘
```

### . Script de Creación

```sql
CREATE DATABASE IF NOT EXISTS seguramente_db 
CHARACTER SET utfmb COLLATE utfmb_unicode_ci;

USE seguramente_db;

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

-- Índices para optimización
CREATE INDEX idx_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX idx_identificacion ON usuarios(identificacion);
CREATE INDEX idx_token_verificacion ON usuarios(token_verificacion);
CREATE INDEX idx_token_recuperacion ON usuarios(token_recuperacion);
CREATE INDEX idx_fecha_registro ON usuarios(fecha_registro);
```

### . Migraciones

**Migración : Campos de Empleado**
```sql
-- backend/migrations/add_employee_fields.sql
ALTER TABLE usuarios 
ADD COLUMN tipo_usuario VARCHAR(0) DEFAULT 'Cliente' AFTER direccion;

ALTER TABLE usuarios 
ADD COLUMN formacion_profesional VARCHAR() AFTER tipo_usuario;

ALTER TABLE usuarios 
ADD COLUMN tarjeta_profesional VARCHAR(00) AFTER formacion_profesional;
```

**Migración : Password Reset**
```sql
-- backend/migrations/add_password_reset_fields.sql
ALTER TABLE usuarios 
ADD COLUMN token_recuperacion VARCHAR() DEFAULT NULL AFTER token_verificacion;

ALTER TABLE usuarios 
ADD COLUMN token_recuperacion_expira DATETIME DEFAULT NULL AFTER token_recuperacion;

CREATE INDEX idx_token_recuperacion ON usuarios(token_recuperacion);
```

### . Consultas Comunes

**Crear Usuario:**
```sql
INSERT INTO usuarios (
    email, nombre_usuario, tipo_identificacion, identificacion,
    fecha_nacimiento, telefono, direccion, password, 
    token_verificacion, verificado
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

**Listar Usuarios:**
```sql
SELECT email, nombre_usuario, tipo_identificacion, identificacion,
       fecha_nacimiento, telefono, direccion, tipo_usuario,
       formacion_profesional, tarjeta_profesional,
       verificado, fecha_registro, ultimo_acceso
FROM usuarios
ORDER BY fecha_registro DESC;
```

**Actualizar Usuario:**
```sql
UPDATE usuarios 
SET nombre_usuario = ?,
    tipo_identificacion = ?,
    identificacion = ?,
    fecha_nacimiento = ?,
    telefono = ?,
    direccion = ?,
    tipo_usuario = ?,
    formacion_profesional = ?,
    tarjeta_profesional = ?
WHERE email = ?;
```

**Eliminar Usuario:**
```sql
DELETE FROM usuarios WHERE email = ?;
```

---

## . API REST - Endpoints

### . Autenticación

#### POST /api/auth/register

**Descripción:** Registrar nuevo usuario

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "nombreUsuario": "Juan Pérez",
  "tipoIdentificacion": "CC",
  "identificacion": "70",
  "fechaNacimiento": "0-0-",
  "telefono": "007",
  "direccion": "Calle  #-7",
  "email": "juan@example.com",
  "password": "Password!"
}
```

**Response 0:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "email": "juan@example.com",
    "nombreUsuario": "Juan Pérez"
  }
}
```

---

#### POST /api/auth/login

**Descripción:** Iniciar sesión

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password!"
}
```

**Response 00:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzINiIsInRcCIIkpXVCJ...",
  "user": {
    "email": "juan@example.com",
    "nombreUsuario": "Juan Pérez",
    "verificado": true
  }
}
```

---

#### GET /api/auth/verify-email?token=xxx

**Descripción:** Verificar email del usuario

**Response 00:**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

---

### . Gestión de Usuarios

#### GET /api/users

**Descripción:** Obtener todos los usuarios

**Headers:**
```
Authorization: Bearer <token>
```

**Response 00:**
```json
{
  "success": true,
  "users": [
    {
      "email": "juan@example.com",
      "nombre_usuario": "Juan Pérez",
      "tipo_identificacion": "CC",
      "identificacion": "70",
      "fecha_nacimiento": "0-0-",
      "telefono": "007",
      "direccion": "Calle  #-7",
      "tipo_usuario": "Cliente",
      "verificado": true,
      "fecha_registro": "0-0-T00:00:00.000Z",
      "ultimo_acceso": "0-0-T0:0:00.000Z"
    }
  ]
}
```

---

#### POST /api/users

**Descripción:** Crear usuario desde dashboard

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nombre_usuario": "María González",
  "tipo_identificacion": "CC",
  "identificacion": "70",
  "fecha_nacimiento": "-0-0",
  "telefono": "07",
  "direccion": "Carrera  #7-",
  "tipo_usuario": "Empleado",
  "formacion_profesional": "Psicología - Universidad Nacional",
  "tarjeta_profesional": "TP-",
  "email": "maria@example.com",
  "password": "Secure!"
}
```

---

#### PUT /api/users/:email

**Descripción:** Actualizar usuario existente

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** (campos a actualizar)
```json
{
  "telefono": "00",
  "direccion": "Nueva dirección "
}
```

---

#### DELETE /api/users/:email

**Descripción:** Eliminar usuario

**Headers:**
```
Authorization: Bearer <token>
```

**Response 00:**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## 7. Autenticación y Seguridad

### 7. Flujo de Autenticación JWT

```
. Usuario envía credenciales (email + password)
   ↓
. Backend verifica en base de datos
   ↓
. bcrypt.compare(password, hashedPassword)
   ↓
. Si es válido: jwt.sign({ email }, SECRET, { expiresIn: '7d' })
   ↓
. Token enviado al frontend
   ↓
. Frontend almacena token en localStorage
   ↓
7. Todas las peticiones subsecuentes incluyen:
   Header: Authorization: Bearer <token>
   ↓
. Backend verifica token en cada petición protegida
```

### 7. Hash de Contraseñas

**Algoritmo:** bcrypt con 0 rounds de salt

```javascript
// Al registrar
const hashedPassword = await bcrypt.hash(password, 0);

// Al login
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### 7. Middleware de Autenticación

**Archivo:** Implementado inline en `backend/routes/users.js`

```javascript
const jwt = require('jsonwebtoken');

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[];

  if (!token) {
    return res.status(0).json({ 
      success: false, 
      message: 'No autorizado' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(0).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
};
```

### 7. CORS Configuration

```javascript
// backend/server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 7. Variables de Entorno Sensibles

**NUNCA commitear al repositorio:**
- JWT_SECRET
- DB_PASSWORD
- EMAIL_PASS

**Uso de .env:**
```javascript
require('dotenv').config();

const secret = process.env.JWT_SECRET;
```

---

## . Deployment

### . Despliegue Frontend (Vercel)

**Pasos:**

. **Conectar Repositorio GitHub**
   - Ir a https://vercel.com
   - "Add New Project"
   - Importar repositorio GitHub

. **Configurar Build**
   ```
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

. **Variables de Entorno**
   ```
   REACT_APP_API_URL=https://[tu-backend].onrender.com/api
   ```

. **Deploy**
   - Vercel auto-deploya desde el branch `main`
   - URL generada: https://[proyecto].vercel.app

---

### . Despliegue Backend (Render)

**Pasos:**

. **Crear Web Service**
   - Ir a https://render.com
   - "New Web Service"
   - Conectar GitHub repo

. **Configurar Service**
   ```
   Name: segura-mente-app-backend
   Region: Oregon (US West)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

. **Variables de Entorno** (todas las del .env)
   ```
   NODE_ENV=production
   PORT=0000
   DB_HOST=caboose.proxy.rlwy.net
   DB_PORT=
   DB_USER=root
   DB_PASSWORD=[tu_password]
   DB_NAME=railway
   DB_SSL=true
   JWT_SECRET=[tu_secret]
   JWT_EXPIRE=7d
   CLIENT_URL=https://[tu-frontend].vercel.app
   ```

. **Deploy**
   - Render auto-deploya desde `main`
   - Health check en ruta `/`

---

### . Despliegue Base de Datos (Railway)

**Pasos:**

. **Crear MySQL Database**
   - Ir a https://railway.app
   - "New Project" → "Provision MySQL"

. **Habilitar Public Networking**
   - Settings → Networking
   - Enable "Public Networking"
   - Anotar host público y puerto

. **Ejecutar Scripts**
   - Conectar con cliente MySQL:
   ```bash
   mysql -h caboose.proxy.rlwy.net -P  -u root -p
   ```
   - Ejecutar `database.sql`
   - Ejecutar migraciones

. **SSL Requerido**
   - Railway requiere conexiones SSL
   - Configurar en backend: `DB_SSL=true`

---

## . Mantenimiento y Troubleshooting

### . Logs del Backend

**Render:**
- Dashboard → Tu servicio → "Logs"
- Logs en tiempo real
- Filtrar por nivel (info, error, warning)

**Logs importantes a monitorear:**
```javascript
console.log('MySQL conectado exitosamente');
console.log('Server running on port', PORT);
console.error('Error de conexión:', error);
```

### . Problemas Comunes

#### Error: "Connection timeout" en Railway

**Causa:** Backend usando host interno en lugar de público

**Solución:**
```env
# Usar host público
DB_HOST=caboose.proxy.rlwy.net
DB_PORT=
```

---

#### Error: "CORS policy blocked"

**Causa:** CLIENT_URL no configurado o incorrecto

**Solución:**
```env
# Asegurar que coincide exactamente
CLIENT_URL=https://segura-mente-app-frontend.vercel.app
```

---

#### Error: "JWT malformed"

**Causa:** Token no incluido o formato incorrecto

**Solución:**
```javascript
// Frontend debe enviar:
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

#### Backend tarda mucho en responder (primera vez)

**Causa:** Cold start de Render free tier ( min inactividad)

**Solución:**
- Esperar 0-0 segundos en primera carga
- Upgrade a plan paid (sin cold start)
- Implementar keep-alive ping

---

### . Monitoreo

**Uptime Monitoring:**
- Usar servicio como UptimeRobot
- Ping cada  minutos a: `https://[backend].onrender.com/`

**Performance:**
- Vercel Analytics (incluido gratis)
- Response time promedio < s

**Database:**
- Railway dashboard muestra:
  - Connections activas
  - CPU usage
  - Memory usage
  - Storage usado

---

### . Backups

**Base de Datos:**
```bash
# Exportar desde Railway
mysqldump -h caboose.proxy.rlwy.net -P  -u root -p railway > backup_$(date +%Y%m%d).sql

# Importar
mysql -h caboose.proxy.rlwy.net -P  -u root -p railway < backup_00.sql
```

**Código Fuente:**
- Automático en GitHub
- Tags para versiones importantes:
```bash
git tag -a v.0.0 -m "Primera versión estable"
git push origin v.0.0
```

---

## 0. Escalabilidad y Mejoras Futuras

### 0. Optimizaciones Recomendadas

**Backend:**
- [ ] Implementar rate limiting (express-rate-limit)
- [ ] Agregar logging profesional (Winston)
- [ ] Cachear queries frecuentes (Redis)
- [ ] Implementar paginación en el backend
- [ ] Agregar compresión gzip

**Frontend:**
- [ ] Implementar lazy loading de componentes
- [ ] Agregar PWA capabilities
- [ ] Optimizar imágenes (WebP)
- [ ] Implementar service workers

**Database:**
- [ ] Implementar réplicas de lectura
- [ ] Agregar índices compuestos
- [ ] Implementar soft deletes
- [ ] Particionamiento de tablas grandes

---

### 0. Funcionalidades Futuras

**Sistema de Roles:**
```sql
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(0) UNIQUE NOT NULL
);

CREATE TABLE usuario_roles (
    usuario_email VARCHAR(0),
    role_id INT,
    FOREIGN KEY (usuario_email) REFERENCES usuarios(email),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    PRIMARY KEY (usuario_email, role_id)
);
```

**Auditoría:**
```sql
CREATE TABLE auditoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_email VARCHAR(0),
    accion VARCHAR(0),
    tabla VARCHAR(0),
    registro_id VARCHAR(0),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_email) REFERENCES usuarios(email)
);
```

**Notificaciones:**
- Implementar WebSockets (Socket.io)
- Notificaciones push
- Email transaccional via API (SendGrid API REST)

---

## . Comandos Útiles

### Git

```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción"

# Push a GitHub (auto-deploy)
git push origin main

# Ver logs
git log --oneline --graph
```

### npm

```bash
# Instalar dependencias
npm install

# Actualizar paquete específico
npm update <paquete>

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix

# Limpiar caché
npm cache clean --force
```

### MySQL

```bash
# Conectar a Railway
mysql -h caboose.proxy.rlwy.net -P  -u root -p railway

# Ver tablas
SHOW TABLES;

# Describir tabla
DESCRIBE usuarios;

# Ver cantidad de usuarios
SELECT COUNT(*) FROM usuarios;

# Ver últimos usuarios registrados
SELECT nombre_usuario, email, fecha_registro 
FROM usuarios 
ORDER BY fecha_registro DESC 
LIMIT 0;
```

---

## . Contacto y Soporte

**Repositorio GitHub:**  
https://github.com/Juanflo/segura-mente-app-GA-000-AA-EV0

**Issues:**  
https://github.com/Juanflo/segura-mente-app-GA-000-AA-EV0/issues

**Documentación Adicional:**
- [README.md](README.md) - Introducción al proyecto
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guía detallada de despliegue
- [DEPLOYMENT_URLS.md](DEPLOYMENT_URLS.md) - URLs de producción
- [DOCUMENTACION_MODULOS.md](DOCUMENTACION_MODULOS.md) - Documentación de módulos
- [DOCUMENTACION_PRUEBAS.md](DOCUMENTACION_PRUEBAS.md) - Documentación de pruebas

---


