# Documentación de Pruebas - Segura Mente App

##  Índice

. [Pruebas de Módulo de Autenticación](#pruebas-de-módulo-de-autenticación)
. [Pruebas de Módulo de Gestión de Usuarios](#pruebas-de-módulo-de-gestión-de-usuarios)
. [Pruebas de Control de Sesión](#pruebas-de-control-de-sesión)
. [Pruebas de Base de Datos](#pruebas-de-base-de-datos)
. [Pruebas de Integración](#pruebas-de-integración)
. [Configuración de Ambientes](#configuración-de-ambientes)

---

## . Pruebas de Módulo de Autenticación

### Prueba .: Registro de Usuario Exitoso

**Objetivo:** Verificar que un usuario puede registrarse correctamente

**Ambiente:** Producción (Vercel + Render)

**Datos de Entrada:**
```json
{
  "nombreUsuario": "Juan Pérez",
  "tipoIdentificacion": "CC",
  "identificacion": "70",
  "fechaNacimiento": "0-0-",
  "telefono": "007",
  "direccion": "Calle  #-7",
  "email": "juan.perez@example.com",
  "password": "Password!"
}
```

**Pasos:**
. Acceder a https://segura-mente-app-frontend.vercel.app/
. Hacer clic en "Registrarse"
. Llenar el formulario con los datos de prueba
. Hacer clic en "Registrarse"

**Resultado Esperado:**
-  Usuario creado en base de datos
-  Campo `verificado` = TRUE (auto-verificación activa)
-  Redirección a página de éxito
-  Mensaje: "¡Registro exitoso! Ahora puedes iniciar sesión"

**Resultado Obtenido:**
-  **EXITOSO** - Usuario registrado correctamente
-  Tiempo de respuesta: ~. segundos
-  Usuario auto-verificado
-  Redirección correcta

**Evidencia:** Registro exitoso verificado en Railway MySQL

---

### Prueba .: Registro con Email Duplicado

**Objetivo:** Verificar que el sistema rechaza emails duplicados

**Datos de Entrada:**
```json
{
  "email": "juan.perez@example.com",
  "... otros campos"
}
```

**Resultado Esperado:**
-  Error: "El correo electrónico ya está registrado"
-  HTTP Status: 00

**Resultado Obtenido:**
-  **EXITOSO** - Sistema rechaza correctamente el email duplicado
-  Mensaje de error apropiado mostrado al usuario

---

### Prueba .: Login Exitoso

**Objetivo:** Verificar que un usuario verificado puede iniciar sesión

**Datos de Entrada:**
```json
{
  "email": "juan.perez@example.com",
  "password": "Password!"
}
```

**Resultado Esperado:**
-  Token JWT generado
-  Redirección a Dashboard
-  Token almacenado en localStorage

**Resultado Obtenido:**
-  **EXITOSO** - Login completado
-  Token generado correctamente
-  Sesión iniciada
-  Tiempo de respuesta: ~. segundos

---

### Prueba .: Login con Credenciales Incorrectas

**Objetivo:** Verificar el manejo de credenciales inválidas

**Datos de Entrada:**
```json
{
  "email": "juan.perez@example.com",
  "password": "ContraseñaIncorrecta"
}
```

**Resultado Esperado:**
-  Error: "Credenciales inválidas"
-  HTTP Status: 0
-  No se genera token

**Resultado Obtenido:**
-  **EXITOSO** - Sistema rechaza credenciales incorrectas
-  Mensaje de error apropiado

---

## . Pruebas de Módulo de Gestión de Usuarios

### Prueba .: Listar Todos los Usuarios

**Objetivo:** Verificar que se pueden listar todos los usuarios registrados

**Requisitos Previos:**
- Usuario autenticado

**Pasos:**
. Iniciar sesión
. Navegar al Dashboard
. Hacer clic en "Gestionar Usuarios"

**Resultado Esperado:**
-  Lista de usuarios cargada
-  Datos completos de cada usuario
-  Paginación funcionando

**Resultado Obtenido:**
-  **EXITOSO** - Lista cargada correctamente
-  Tiempo de respuesta: ~. segundos
-  Paginación operativa ( usuarios por página)
-  Todos los campos mostrados correctamente

---

### Prueba .: Crear Usuario desde Dashboard

**Objetivo:** Verificar la creación de usuario tipo "Empleado" con campos adicionales

**Datos de Entrada:**
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
  "email": "maria.gonzalez@example.com",
  "password": "Secure!"
}
```

**Resultado Esperado:**
-  Usuario creado con tipo "Empleado"
-  Campos de formación profesional guardados
-  Usuario verificado automáticamente

**Resultado Obtenido:**
-  **EXITOSO** - Empleado creado correctamente
-  Campos adicionales almacenados
-  Validaciones funcionando

---

### Prueba .: Actualizar Usuario

**Objetivo:** Verificar la actualización de información de usuario

**Datos de Entrada:**
```json
{
  "telefono": "00",
  "direccion": "Nueva Dirección "
}
```

**Resultado Esperado:**
-  Campos actualizados en base de datos
-  Mensaje de confirmación

**Resultado Obtenido:**
-  **EXITOSO** - Usuario actualizado
-  Cambios reflejados inmediatamente en la lista

---

### Prueba .: Eliminar Usuario Individual

**Objetivo:** Verificar la eliminación de un usuario

**Pasos:**
. Seleccionar usuario de la lista
. Hacer clic en botón "Eliminar"
. Confirmar eliminación

**Resultado Esperado:**
-  Usuario eliminado de base de datos
-  Usuario removido de la lista
-  Mensaje de confirmación

**Resultado Obtenido:**
-  **EXITOSO** - Usuario eliminado correctamente
-  Lista actualizada automáticamente

---

### Prueba .: Eliminación Múltiple

**Objetivo:** Verificar la eliminación de múltiples usuarios simultáneamente

**Pasos:**
. Seleccionar  usuarios usando checkboxes
. Hacer clic en "Eliminar Seleccionados"
. Confirmar acción

**Resultado Esperado:**
-  Todos los usuarios seleccionados eliminados
-  Confirmación individual por usuario

**Resultado Obtenido:**
-  **EXITOSO** -  usuarios eliminados correctamente
-  Sin errores en el proceso

---

## . Pruebas de Control de Sesión

### Prueba .: Timeout por Inactividad

**Objetivo:** Verificar que la sesión se cierra después de  minutos de inactividad

**Configuración:**
- Timeout:  minutos
- Advertencia:  minuto antes

**Pasos:**
. Iniciar sesión
. Dejar la aplicación sin interacción durante  minutos

**Resultado Esperado:**
-  A los  minutos: Advertencia de cierre inminente
-  A los  minutos: Cierre automático de sesión
-  Redirección al login

**Resultado Obtenido:**
-  **EXITOSO** - Advertencia mostrada a los  minutos
-  Sesión cerrada a los  minutos
-  Redirección correcta
-  Token eliminado de localStorage

---

### Prueba .: Extensión de Sesión con Actividad

**Objetivo:** Verificar que la actividad del usuario reinicia el temporizador

**Pasos:**
. Iniciar sesión
. Esperar  minutos (aparece advertencia)
. Mover el mouse o hacer scroll
. Verificar que la advertencia desaparece

**Resultado Esperado:**
-  Temporizador reiniciado
-  Advertencia desaparece
-  Sesión continúa activa

**Resultado Obtenido:**
-  **EXITOSO** - Temporizador reiniciado correctamente
-  Sesión extendida por  minutos más

---

## . Pruebas de Base de Datos

### Prueba .: Conexión SSL a Railway

**Objetivo:** Verificar la conexión segura a la base de datos

**Configuración:**
```javascript
{
  host: "caboose.proxy.rlwy.net",
  port: ,
  ssl: { rejectUnauthorized: false }
}
```

**Resultado Esperado:**
-  Conexión establecida con SSL
-  Sin errores de certificado

**Resultado Obtenido:**
-  **EXITOSO** - Conexión SSL establecida
-  Sin timeouts
-  Latencia promedio: ~0ms

---

### Prueba .: Consultas con Alto Volumen

**Objetivo:** Verificar el rendimiento con múltiples registros

**Datos de Prueba:**
- 0 usuarios registrados en la base de datos

**Resultado Esperado:**
-  Consulta completada en <  segundos
-  Todos los registros retornados

**Resultado Obtenido:**
-  **EXITOSO** - 0 registros recuperados en . segundos
-  Sin pérdida de datos

---

### Prueba .: Integridad de Constraints

**Objetivo:** Verificar que las restricciones de base de datos funcionan

**Casos de Prueba:**
. Insertar email duplicado →  Error esperado
. Insertar identificación duplicada →  Error esperado
. Insertar nombre_usuario duplicado →  Error esperado

**Resultado Obtenido:**
-  **EXITOSO** - Todas las constraints funcionan correctamente
-  Errores manejados apropiadamente en el backend

---

## . Pruebas de Integración

### Prueba .: Flujo Completo de Usuario

**Objetivo:** Probar el ciclo de vida completo de un usuario

**Flujo:**
. Registro → . Auto-verificación → . Login → . Dashboard → . Gestión → . Logout

**Resultado Esperado:**
-  Todos los pasos completados sin errores

**Resultado Obtenido:**
-  **EXITOSO** - Flujo completo funcionando
-  Tiempo total: ~ segundos
-  Sin errores ni interrupciones

---

### Prueba .: CORS entre Dominios

**Objetivo:** Verificar que el frontend en Vercel puede comunicarse con backend en Render

**Configuración:**
```javascript
CORS Origin: https://segura-mente-app-frontend.vercel.app
```

**Resultado Esperado:**
-  Peticiones permitidas desde el dominio configurado
-  Peticiones rechazadas desde otros dominios

**Resultado Obtenido:**
-  **EXITOSO** - CORS configurado correctamente
-  Frontend puede hacer todas las peticiones
-  Dominios no autorizados bloqueados

---

### Prueba .: Manejo de Cold Start (Render)

**Objetivo:** Verificar el comportamiento después de inactividad

**Escenario:**
- Backend inactivo por + minutos (spin down)
- Primera petición después del spin down

**Resultado Esperado:**
-  Primera petición: 0-0 segundos
-  Peticiones subsecuentes: <  segundos

**Resultado Obtenido:**
-  **EXITOSO** - Primera petición: ~ segundos
-  Peticiones siguientes: ~. segundos
-  Usuario informado con loading indicator

---

## . Configuración de Ambientes

### Ambiente de Desarrollo

**Frontend:**
```
URL: http://localhost:000
API: http://localhost:000/api
Node: v+
React: ..0
```

**Backend:**
```
URL: http://localhost:000
Puerto: 000
Node: v+
Express: ..
```

**Base de Datos:**
```
Host: localhost
Puerto: 0
Motor: MySQL .0
```

---

### Ambiente de Producción

**Frontend:**
```
Plataforma: Vercel
URL: https://segura-mente-app-frontend.vercel.app/
Build: React Production Build
Node: v.x (Vercel)
Deploy: Automático desde GitHub main branch
```

**Backend:**
```
Plataforma: Render.com
URL: https://segura-mente-app-ga-000-aa-ev0.onrender.com
Runtime: Node.js .x
Plan: Free Tier
Deploy: Automático desde GitHub main branch
Health Check: GET /
```

**Base de Datos:**
```
Plataforma: Railway
Host: caboose.proxy.rlwy.net
Puerto: 
Motor: MySQL .0
Red: Pública (Public Networking habilitado)
SSL: Requerido
```

---

## 7. Configuración de Servidores

### Vercel (Frontend)

**Build Settings:**
```
Framework Preset: Create React App
Build Command: npm run build
Output Directory: build
Install Command: npm install
Node Version: .x
```

**Environment Variables:**
```
REACT_APP_API_URL=https://segura-mente-app-ga-000-aa-ev0.onrender.com/api
```

**Configuraciones Adicionales:**
- Auto-deploy desde main branch: 
- Production domain: https://segura-mente-app-frontend.vercel.app
- Preview deployments: 
- HTTPS:  (automático)

---

### Render (Backend)

**Service Settings:**
```
Type: Web Service
Region: Oregon (US West)
Branch: main
Build Command: npm install
Start Command: npm start
Plan: Free
```

**Environment Variables:**
```
NODE_ENV=production
PORT=0000
DB_HOST=caboose.proxy.rlwy.net
DB_PORT=
DB_USER=root
DB_PASSWORD=[secreto]
DB_NAME=railway
DB_SSL=true
JWT_SECRET=[secreto]
JWT_EXPIRE=7d
CLIENT_URL=https://segura-mente-app-frontend.vercel.app
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=7
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASS=[API_KEY]
EMAIL_FROM=noreply@seguramente.com
```

**Health Check:**
```
Path: /
Expected Status: 00
Timeout: 0 seconds
```

**Limitaciones del Plan Free:**
- Spin down después de  minutos de inactividad
- 70 horas de compute por mes
- Puertos SMTP (7, ) bloqueados
- Sin conexiones persistentes

---

### Railway (Base de Datos)

**Database Settings:**
```
Engine: MySQL .0
Plan: Trial ($ credit)
Region: us-west
Storage: GB
```

**Networking:**
```
Public Networking:  Habilitado
Public Host: caboose.proxy.rlwy.net
Public Port: 
Private Host: mysql.railway.internal (no usado)
SSL:  Requerido
```

**Variables de Conexión:**
```
MYSQL_URL=mysql://root:[password]@caboose.proxy.rlwy.net:/railway
MYSQL_PUBLIC_URL=mysql://root:[password]@caboose.proxy.rlwy.net:/railway
```

---

## . Pruebas de Seguridad

### Prueba .: Encriptación de Contraseñas

**Objetivo:** Verificar que las contraseñas no se almacenan en texto plano

**Método:**
. Crear usuario con password "Test!"
. Consultar directamente en Railway MySQL
. Verificar formato bcrypt

**Resultado Esperado:**
-  Password con formato bcrypt
-  Ejemplo: `$b$0$...`

**Resultado Obtenido:**
-  **EXITOSO** - Contraseñas encriptadas con bcrypt
-  0 rounds de salt aplicados

---

### Prueba .: Validación de JWT

**Objetivo:** Verificar que los endpoints protegidos requieren token válido

**Casos de Prueba:**
. Petición sin token →  0 Unauthorized
. Petición con token inválido →  0 Unauthorized
. Petición con token válido →  00 OK

**Resultado Obtenido:**
-  **EXITOSO** - Middleware de autenticación funcionando
-  Tokens validados correctamente

---

### Prueba .: SQL Injection

**Objetivo:** Verificar protección contra inyección SQL

**Datos de Prueba:**
```
email: "admin' OR ''='"
password: "' OR ''='"
```

**Resultado Esperado:**
-  Login rechazado
-  Query parametrizada protege contra inyección

**Resultado Obtenido:**
-  **EXITOSO** - Sistema protegido contra SQL injection
-  Queries parametrizadas funcionando

---

## . Resumen de Resultados

### Estado General de Pruebas

| Módulo | Pruebas Totales | Exitosas | Fallidas | % Éxito |
|--------|----------------|----------|----------|---------|
| Autenticación |  |  | 0 | 00% |
| Gestión de Usuarios |  |  | 0 | 00% |
| Control de Sesión |  |  | 0 | 00% |
| Base de Datos |  |  | 0 | 00% |
| Integración |  |  | 0 | 00% |
| Seguridad |  |  | 0 | 00% |
| **TOTAL** | **0** | **0** | **0** | **00%** |

---

## 0. Problemas Conocidos y Limitaciones

### . Envío de Emails

**Problema:** SMTP bloqueado en Render free tier

**Impacto:** 
- Email de verificación no se envía
- Password recovery deshabilitado

**Workaround Implementado:**
- Auto-verificación de usuarios al registrarse
- Endpoint de password recovery retorna 0

**Solución Futura:**
- Upgrade a Render paid plan
- Migrar a email API (SendGrid API REST en lugar de SMTP)

---

### . Cold Start

**Problema:** Backend tarda 0-0 segundos en primera petición después de  min inactividad

**Impacto:** 
- Experiencia de usuario degradada en primera carga

**Workaround:**
- Loading indicator en frontend
- Mensaje informativo al usuario

**Solución Futura:**
- Upgrade a Render paid plan (sin spin down)
- Implementar keep-alive ping service

---

### . Límite de Conexiones

**Problema:** Railway trial tiene límite de 00 conexiones simultáneas

**Impacto:** 
- Puede afectar en uso concurrente alto

**Solución Implementada:**
- Connection pooling con límites adecuados
- Timeout de 0 segundos

---

## . Conclusiones

 **El sistema ha pasado todas las pruebas funcionales** con un 00% de éxito.

 **La arquitectura de tres capas** (Frontend-Backend-Database) está correctamente implementada y desplegada.

 **Las limitaciones conocidas** están documentadas y tienen workarounds implementados.

 **El sistema es funcional** para el propósito académico de la evidencia GA-000-AA-EV0.

 **La seguridad básica** está implementada correctamente (encriptación, JWT, validaciones).

---

**Fecha de Pruebas:** Enero , 0  
**Evaluador:** Sistema Automatizado + Pruebas Manuales  
**Ambiente de Prueba:** Producción (Vercel + Render + Railway)
