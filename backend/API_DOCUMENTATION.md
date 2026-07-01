# Documentación de API - Segura-Mente

## Información General

**Base URL:** `http://localhost:5000`

**Formato de respuesta:** JSON

**Autenticación:** JWT Token (Bearer Token) para rutas protegidas

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Modelos de Datos](#modelos-de-datos)
4. [Códigos de Respuesta](#códigos-de-respuesta)
5. [Manejo de Errores](#manejo-de-errores)

---

## Autenticación

### 1. Registrar Usuario (Público)

Crea una nueva cuenta de usuario. El usuario debe verificar su email antes de poder iniciar sesión.

**Endpoint:** `POST /api/auth/register`

**Autenticación:** No requerida

**Body:**
```json
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

**Validaciones:**
- `nombreUsuario`: 3-100 caracteres, solo letras, números y guiones bajos, único
- `tipoIdentificacion`: "CC" o "CE"
- `identificacion`: 5-50 caracteres numéricos, único
- `fechaNacimiento`: Fecha válida, usuario debe ser mayor de 18 años
- `telefono`: Exactamente 10 dígitos numéricos
- `direccion`: Obligatorio, máximo 255 caracteres
- `email`: Formato válido, máximo 150 caracteres, único
- `password`: Mínimo 8 caracteres, debe contener mayúsculas, minúsculas, números y símbolos
- `confirmPassword`: Debe coincidir con password

**Respuesta exitosa (201):**
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

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "El email ya está registrado"
}
```

```json
{
  "success": false,
  "errors": [
    {
      "field": "password",
      "message": "La contraseña debe contener al menos una mayúscula, minúscula, número y símbolo"
    }
  ]
}
```

---

### 2. Verificar Email

Verifica la cuenta de usuario mediante el token enviado por email.

**Endpoint:** `GET /api/auth/verify`

**Autenticación:** No requerida

**Query Parameters:**
- `token` (requerido): Token de verificación recibido por email

**Ejemplo:**
```
GET /api/auth/verify?token=abc123def456ghi789
```

**Respuesta exitosa (200):**
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

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

### 3. Iniciar Sesión

Autentica al usuario y devuelve un token JWT.

**Endpoint:** `POST /api/auth/login`

**Autenticación:** No requerida

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Validaciones:**
- `email`: Formato válido, obligatorio
- `password`: Obligatorio

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "email": "juan@example.com",
      "nombreUsuario": "juanperez",
      "tipoIdentificacion": "CC",
      "identificacion": "1234567890",
      "telefono": "3001234567",
      "direccion": "Calle 123 #45-67",
      "fechaNacimiento": "1990-01-01",
      "tipoUsuario": "Cliente",
      "formacionProfesional": null,
      "tarjetaProfesional": null,
      "verificado": true
    }
  }
}
```

**Respuesta de error (401):**
```json
{
  "success": false,
  "message": "Credenciales incorrectas"
}
```

```json
{
  "success": false,
  "message": "Debes verificar tu correo electrónico antes de iniciar sesión"
}
```

---

### 4. Reenviar Email de Verificación

Reenvía el email de verificación a un usuario no verificado.

**Endpoint:** `POST /api/auth/resend-verification`

**Autenticación:** No requerida

**Body:**
```json
{
  "email": "juan@example.com"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Email de verificación reenviado. Por favor revisa tu bandeja de entrada."
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "El usuario no existe o ya está verificado"
}
```

---

## Gestión de Usuarios

Todas las rutas de gestión de usuarios requieren autenticación mediante token JWT.

**Header requerido:**
```
Authorization: Bearer {token}
```

---

### 5. Listar Todos los Usuarios

Obtiene la lista completa de usuarios registrados.

**Endpoint:** `GET /api/users`

**Autenticación:** Requerida (JWT Token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "email": "juan@example.com",
      "nombreUsuario": "juanperez",
      "tipoIdentificacion": "CC",
      "identificacion": "1234567890",
      "fechaNacimiento": "1990-01-01",
      "telefono": "3001234567",
      "direccion": "Calle 123 #45-67",
      "tipoUsuario": "Cliente",
      "formacionProfesional": null,
      "tarjetaProfesional": null,
      "verificado": true,
      "fechaRegistro": "2024-01-15T10:30:00.000Z",
      "ultimoAcceso": "2024-01-20T15:45:00.000Z"
    },
    {
      "email": "maria@example.com",
      "nombreUsuario": "mariagomez",
      "tipoIdentificacion": "CC",
      "identificacion": "9876543210",
      "fechaNacimiento": "1985-05-20",
      "telefono": "3109876543",
      "direccion": "Carrera 45 #12-34",
      "tipoUsuario": "Psicólogo/empleado",
      "formacionProfesional": "Psicóloga Clínica",
      "tarjetaProfesional": "PSI-12345",
      "verificado": true,
      "fechaRegistro": "2024-01-10T08:20:00.000Z",
      "ultimoAcceso": "2024-01-21T09:15:00.000Z"
    }
  ],
  "count": 2
}
```

**Respuesta de error (401):**
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

---

### 6. Obtener Usuario por Email

Obtiene los detalles de un usuario específico.

**Endpoint:** `GET /api/users/:email`

**Autenticación:** Requerida (JWT Token)

**Parámetros de URL:**
- `email`: Email del usuario (URL encoded si contiene caracteres especiales)

**Ejemplo:**
```
GET /api/users/juan@example.com
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "email": "juan@example.com",
    "nombreUsuario": "juanperez",
    "tipoIdentificacion": "CC",
    "identificacion": "1234567890",
    "fechaNacimiento": "1990-01-01",
    "telefono": "3001234567",
    "direccion": "Calle 123 #45-67",
    "tipoUsuario": "Cliente",
    "formacionProfesional": null,
    "tarjetaProfesional": null,
    "verificado": true,
    "fechaRegistro": "2024-01-15T10:30:00.000Z",
    "ultimoAcceso": "2024-01-20T15:45:00.000Z"
  }
}
```

**Respuesta de error (404):**
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

---

### 7. Crear Usuario (desde Dashboard)

Crea un nuevo usuario desde el panel de administración. El usuario se crea ya verificado.

**Endpoint:** `POST /api/users`

**Autenticación:** Requerida (JWT Token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body:**
```json
{
  "nombre_usuario": "carlosrodriguez",
  "tipo_identificacion": "CC",
  "identificacion": "5555555555",
  "fecha_nacimiento": "1992-08-15",
  "telefono": "3205555555",
  "direccion": "Avenida 68 #23-45",
  "email": "carlos@example.com",
  "password": "SecurePass456!",
  "tipo_usuario": "Psicólogo/empleado",
  "formacion_profesional": "Psicólogo Organizacional",
  "tarjeta_profesional": "PSI-67890"
}
```

**Validaciones:**
- Mismas validaciones que el registro público
- `tipo_usuario`: "Cliente" o "Psicólogo/empleado"
- `formacion_profesional`: Opcional (requerido si tipo_usuario es "Psicólogo/empleado")
- `tarjeta_profesional`: Opcional (requerido si tipo_usuario es "Psicólogo/empleado")
- El usuario se crea con `verificado = true` automáticamente
- No requiere `confirmPassword`

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "email": "carlos@example.com",
    "nombreUsuario": "carlosrodriguez",
    "tipoUsuario": "Psicólogo/empleado"
  }
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "El email ya está registrado"
}
```

```json
{
  "success": false,
  "errors": [
    {
      "field": "nombre_usuario",
      "message": "El nombre de usuario ya existe"
    },
    {
      "field": "identificacion",
      "message": "La identificación ya está registrada"
    }
  ]
}
```

---

### 8. Actualizar Usuario

Actualiza los datos de un usuario existente. El email no puede ser modificado.

**Endpoint:** `PUT /api/users/:email`

**Autenticación:** Requerida (JWT Token)

**Parámetros de URL:**
- `email`: Email del usuario a actualizar (no modificable)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body (todos los campos son opcionales):**
```json
{
  "nombre_usuario": "juanperez_updated",
  "tipo_identificacion": "CE",
  "identificacion": "1234567890",
  "fecha_nacimiento": "1990-01-01",
  "telefono": "3001234567",
  "direccion": "Nueva Dirección 456",
  "password": "NewPassword789!",
  "tipo_usuario": "Psicólogo/empleado",
  "formacion_profesional": "Psicólogo Clínico Especializado",
  "tarjeta_profesional": "PSI-99999"
}
```

**Ejemplo:**
```
PUT /api/users/juan@example.com
```

**Notas:**
- Solo se actualizan los campos enviados en el body
- El campo `email` no puede ser modificado (es PRIMARY KEY)
- Si se envía `password`, se encriptará automáticamente
- Si se cambia `nombre_usuario` o `identificacion`, se valida que no existan

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "email": "juan@example.com",
    "nombreUsuario": "juanperez_updated",
    "tipoUsuario": "Psicólogo/empleado"
  }
}
```

**Respuesta de error (404):**
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "El nombre de usuario ya existe"
}
```

---

### 9. Eliminar Usuario

Elimina permanentemente un usuario de la base de datos.

**Endpoint:** `DELETE /api/users/:email`

**Autenticación:** Requerida (JWT Token)

**Parámetros de URL:**
- `email`: Email del usuario a eliminar

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Ejemplo:**
```
DELETE /api/users/juan@example.com
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

**Respuesta de error (404):**
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

---

## Modelos de Datos

### Usuario

```typescript
{
  email: string,                    // PRIMARY KEY, único, máximo 150 caracteres
  nombreUsuario: string,            // Único, 3-100 caracteres
  tipoIdentificacion: string,       // "CC" o "CE"
  identificacion: string,           // Único, 5-50 caracteres
  fechaNacimiento: string,          // Formato: YYYY-MM-DD
  telefono: string,                 // 10 dígitos numéricos
  direccion: string,                // Máximo 255 caracteres
  password: string,                 // Encriptado con bcrypt
  tipoUsuario: string,              // "Cliente" o "Psicólogo/empleado"
  formacionProfesional: string | null,  // Opcional
  tarjetaProfesional: string | null,    // Opcional
  verificado: boolean,              // true/false
  tokenVerificacion: string | null, // Token único de verificación
  fechaRegistro: timestamp,         // Fecha de creación (auto)
  ultimoAcceso: timestamp | null    // Última sesión
}
```

---

## Códigos de Respuesta

### Códigos de Éxito

- `200 OK`: Solicitud procesada exitosamente
- `201 Created`: Recurso creado exitosamente

### Códigos de Error del Cliente

- `400 Bad Request`: Datos inválidos o falta información requerida
- `401 Unauthorized`: Token no proporcionado o inválido
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto con recurso existente (email duplicado, etc.)

### Códigos de Error del Servidor

- `500 Internal Server Error`: Error interno del servidor

---

## Manejo de Errores

Todas las respuestas de error siguen este formato:

### Error Simple
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

### Error con Validaciones Múltiples
```json
{
  "success": false,
  "errors": [
    {
      "field": "campo_con_error",
      "message": "Descripción del error específico"
    }
  ]
}
```

### Error del Servidor
```json
{
  "success": false,
  "message": "Error al procesar la solicitud",
  "error": "Detalles técnicos del error (solo en desarrollo)"
}
```

---

## Ejemplos de Uso con cURL

### Registrar Usuario
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombreUsuario": "juanperez",
    "tipoIdentificacion": "CC",
    "identificacion": "1234567890",
    "fechaNacimiento": "1990-01-01",
    "telefono": "3001234567",
    "direccion": "Calle 123",
    "email": "juan@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
  }'
```

### Iniciar Sesión
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "Password123!"
  }'
```

### Listar Usuarios (requiere token)
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Actualizar Usuario (requiere token)
```bash
curl -X PUT http://localhost:5000/api/users/juan@example.com \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "3009999999",
    "direccion": "Nueva dirección actualizada"
  }'
```

### Eliminar Usuario (requiere token)
```bash
curl -X DELETE http://localhost:5000/api/users/juan@example.com \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Notas de Seguridad

1. **Tokens JWT**: Expiran en 7 días. Después de ese tiempo, el usuario debe iniciar sesión nuevamente.

2. **Contraseñas**: Se encriptan con bcrypt usando 10 rounds de salt. Nunca se almacenan ni devuelven en texto plano.

3. **Validación de Email**: Los usuarios deben verificar su email antes de poder iniciar sesión (excepto usuarios creados desde el dashboard).

4. **CORS**: Solo permite solicitudes desde el frontend configurado en `FRONTEND_URL`.

5. **Rate Limiting**: Se recomienda implementar limitación de solicitudes en producción.

---

## Contacto y Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo.

**Versión de la API:** 1.0.0

**Última actualización:** Diciembre 2024
