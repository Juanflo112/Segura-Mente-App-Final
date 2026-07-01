# Backend - Segura-Mente App

Backend API REST para la aplicación Segura-Mente, desarrollado con Node.js, Express y MySQL.

## Características

- Registro de usuarios con validaciones completas
- Verificación de email mediante token único
- Encriptación de contraseñas con bcrypt
- Envío de correos electrónicos con Nodemailer
- Validación de datos con express-validator
- Conexión a MySQL mediante mysql2
- Manejo de CORS
- Variables de entorno con dotenv

## Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar base de datos (XAMPP)

1. Inicia XAMPP y activa MySQL
2. Abre phpMyAdmin (http://localhost/phpmyadmin)
3. Ejecuta el script SQL que está en `database.sql`

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=seguramente_db
JWT_SECRET=tu_clave_secreta_muy_segura_12345_seguramente
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app_gmail
FRONTEND_URL=http://localhost:3000
```

### 4. Configurar Gmail para envío de emails

Para poder enviar correos de verificación:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la verificación en 2 pasos
3. Ve a "Seguridad" > "Contraseñas de aplicaciones"
4. Genera una nueva contraseña de aplicación para "Correo"
5. Copia esa contraseña en `EMAIL_PASSWORD` del archivo `.env`

## Ejecutar el servidor

### Modo desarrollo
```bash
npm start
```

El servidor se ejecutará en `http://localhost:5000`

### Modo desarrollo con nodemon (opcional)
```bash
npm install -g nodemon
npm run dev
```

## Endpoints disponibles

### Autenticación

#### Registrar usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "nombreUsuario": "juanperez",
  "tipoIdentificacion": "CC",
  "identificacion": "1234567890",
  "fechaNacimiento": "1990-01-01",
  "telefono": "3001234567",
  "direccion": "Calle 123 #45-67",
  "email": "juan@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Por favor verifica tu correo electrónico.",
  "data": {
    "email": "juan@example.com",
    "nombreUsuario": "juanperez"
  }
}
```

#### Verificar email
```http
GET /api/auth/verify?token=TOKEN_DE_VERIFICACION
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Email verificado exitosamente. Ya puedes iniciar sesión.",
  "data": {
    "email": "juan@example.com",
    "nombreUsuario": "juanperez"
  }
}
```

#### Reenviar email de verificación
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "juan@example.com"
}
```

## Estructura del proyecto

```
backend/
├── config/
│   └── database.js          # Configuración MySQL
├── controllers/
│   └── authController.js    # Lógica de autenticación
├── middleware/
│   └── validation.js        # Validaciones
├── models/
│   └── User.js              # Modelo de usuario
├── routes/
│   └── auth.js              # Rutas de autenticación
├── utils/
│   └── email.js             # Envío de emails
├── .env                     # Variables de entorno (no subir a git)
├── .gitignore
├── database.sql             # Script de base de datos
├── package.json
└── server.js                # Archivo principal
```

## Seguridad

- Contraseñas encriptadas con bcrypt (10 rounds)
- Validación de datos con express-validator
- CORS configurado
- Variables sensibles en .env
- Email como PRIMARY KEY (identificador único)
- Validación de usuario único por email, nombre de usuario e identificación

## Estructura de la Base de Datos

### Tabla: usuarios

| Campo               | Tipo         | Descripción                      |
|---------------------|--------------|----------------------------------|
| email               | VARCHAR(150) | PRIMARY KEY - Email único        |
| nombre_usuario      | VARCHAR(100) | UNIQUE - Nombre de usuario único |
| tipo_identificacion | VARCHAR(5)   | CC o CE                          |
| identificacion      | VARCHAR(50)  | UNIQUE - Número de identificación|
| fecha_nacimiento    | DATE         | Fecha de nacimiento              |
| telefono            | VARCHAR(20)  | Número de teléfono               |
| direccion           | VARCHAR(255) | Dirección física                 |
| password            | VARCHAR(255) | Contraseña encriptada            |
| verificado          | BOOLEAN      | Estado de verificación (default: false) |
| token_verificacion  | VARCHAR(255) | Token único de verificación      |
| fecha_registro      | TIMESTAMP    | Fecha de creación (auto)         |
| ultimo_acceso       | TIMESTAMP    | Último inicio de sesión          |

## Validaciones implementadas

### Nombre de usuario
- Obligatorio
- Entre 3 y 100 caracteres
- Solo letras, números y guiones bajos
- Único en la base de datos

### Identificación
- Obligatoria
- Entre 5 y 50 caracteres
- Solo números
- Única en la base de datos

### Email
- Obligatorio
- Formato de email válido
- Máximo 150 caracteres
- Único en la base de datos (PRIMARY KEY)

### Contraseña
- Obligatoria
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número
- Al menos un símbolo especial (@$!%*?&_#)

### Fecha de nacimiento
- Obligatoria
- Formato de fecha válido
- Usuario debe ser mayor de 18 años

### Teléfono
- Obligatorio
- Exactamente 10 dígitos numéricos

## Probar el backend

### 1. Verificar que el servidor está corriendo
```bash
curl http://localhost:5000
```

Deberías ver:
```json
{
  "success": true,
  "message": "API Segura-Mente funcionando correctamente",
  "version": "1.0.0",
  "timestamp": "..."
}
```

### 2. Probar registro de usuario
Usa Postman, Insomnia o Thunder Client con los endpoints documentados arriba.

## Errores comunes

### "Error al conectar a la base de datos"
- Verifica que XAMPP esté corriendo
- Verifica que las credenciales en `.env` sean correctas
- Asegúrate de haber ejecutado el script `database.sql`

### "Error al enviar email"
- Verifica que hayas configurado correctamente las credenciales de Gmail
- Asegúrate de usar una "Contraseña de aplicación" y no tu contraseña normal
- Verifica que la verificación en 2 pasos esté activa

### "CORS error" desde el frontend
- Verifica que `FRONTEND_URL` en `.env` sea correcto
- Asegúrate de que el frontend esté corriendo en el puerto especificado

## Soporte

Si tienes problemas, verifica:
1. XAMPP está corriendo (Apache y MySQL)
2. Base de datos fue creada correctamente
3. Archivo `.env` está configurado
4. Todas las dependencias fueron instaladas (`npm install`)
5. No hay otro proceso usando el puerto 5000

