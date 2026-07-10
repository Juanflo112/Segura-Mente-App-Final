# Guía de Despliegue - Segura Mente App

##  Pasos para Desplegar en Producción

### ️⃣ Preparación de la Base de Datos MySQL

#### Opción A: Railway (Recomendado)
. Visita [railway.app](https://railway.app)
. Regístrate con GitHub
. Click en "New Project" → "Provision MySQL"
. Copia las credenciales de conexión:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`

. Conecta a la base de datos y ejecuta el script:
   ```bash
   # Desde tu terminal local
   mysql -h <MYSQL_HOST> -u <MYSQL_USER> -p<MYSQL_PASSWORD> <MYSQL_DATABASE> < backend/database.sql
   ```

#### Opción B: PlanetScale
. Visita [planetscale.com](https://planetscale.com)
. Crea una cuenta y una nueva base de datos
. Obtén la cadena de conexión
. Ejecuta las migraciones desde el dashboard web

---

### ️⃣ Desplegar el Backend (API)

#### Usando Render
. Visita [render.com](https://render.com)
. Regístrate con tu cuenta de GitHub
. Click en "New +" → "Web Service"
. Conecta tu repositorio: `segura-mente-app-GA-000-AA-EV0`
. Configuración:
   - **Name:** `seguramente-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

. **Variables de Entorno** (Environment Variables):
   ```
   NODE_ENV=production
   PORT=0000
   DB_HOST=<tu_host_mysql>
   DB_USER=<tu_usuario>
   DB_PASSWORD=<tu_contraseña>
   DB_NAME=seguramente_db
   DB_PORT=0
   JWT_SECRET=<genera_una_clave_aleatoria_larga>
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=7
   EMAIL_SECURE=false
   EMAIL_USER=<tu_correo@gmail.com>
   EMAIL_PASS=<tu_app_password>
   EMAIL_FROM=<tu_correo@gmail.com>
   CLIENT_URL=<URL_de_tu_frontend>
   ```

7. Click en "Create Web Service"
. Espera a que se despliegue (-0 minutos)
. Guarda la URL del backend: `https://seguramente-backend.onrender.com`

#### Generar JWT_SECRET
```bash
# Ejecutar en terminal para generar una clave segura
node -e "console.log(require('crypto').randomBytes().toString('hex'))"
```

---

### ️⃣ Configurar el Frontend para Producción

#### Actualizar la URL del API en el Frontend
Crear archivo `.env.production` en la raíz del proyecto:

```env
REACT_APP_API_URL=https://seguramente-backend.onrender.com/api
```

#### Verificar que el código use esta variable
Los archivos del frontend deben usar:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:000/api';
```

---

### ️⃣ Desplegar el Frontend (React)

#### Opción A: Vercel (Recomendado para React)
. Visita [vercel.com](https://vercel.com)
. Regístrate con GitHub
. Click en "Add New" → "Project"
. Importa tu repositorio: `segura-mente-app-GA-000-AA-EV0`
. Configuración:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `./` (raíz del proyecto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   
. **Variables de Entorno:**
   ```
   REACT_APP_API_URL=https://seguramente-backend.onrender.com/api
   ```

7. Click en "Deploy"
. Espera - minutos
. Tu app estará en: `https://tu-proyecto.vercel.app`

#### Opción B: Netlify
. Visita [netlify.com](https://netlify.com)
. Conecta con GitHub
. Click en "Add new site" → "Import an existing project"
. Selecciona tu repositorio
. Configuración:
   - **Build command:** `npm run build`
   - **Publish directory:** `build`
   - **Environment variables:**
     ```
     REACT_APP_API_URL=https://seguramente-backend.onrender.com/api
     ```
. Click en "Deploy site"

---

### ️⃣ Actualizar CORS en el Backend

Una vez desplegado el frontend, actualiza la URL permitida en el backend:

En `backend/server.js`, verifica que esté configurado para usar `CLIENT_URL`:
```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:000',
  credentials: true
};
app.use(cors(corsOptions));
```

Luego en Render, actualiza la variable de entorno:
```
CLIENT_URL=https://tu-proyecto.vercel.app
```

---

##  Actualizar el Despliegue

### Backend (Render)
- Automático: Cada push a `main` en GitHub redespliega automáticamente
- Manual: En el dashboard de Render → "Manual Deploy" → "Deploy latest commit"

### Frontend (Vercel/Netlify)
- Automático: Cada push a `main` redespliega automáticamente
- Manual: En el dashboard → "Redeploy"

---

##  Probar el Despliegue

. **Backend Health Check:**
   ```bash
   curl https://seguramente-backend.onrender.com/api/health
   ```

. **Frontend:**
   - Visita tu URL de Vercel/Netlify
   - Prueba el registro de usuario
   - Prueba el login
   - Verifica que lleguen los emails de verificación

---

##  Configurar Email (Gmail)

Para que funcione el envío de correos:

. Inicia sesión en tu cuenta de Gmail
. Ve a "Gestionar tu cuenta de Google"
. Seguridad → Verificación en dos pasos (actívala)
. Seguridad → Contraseñas de aplicaciones
. Genera una contraseña para "Otra (nombre personalizado)"
. Usa esa contraseña en `EMAIL_PASS`

---

##  Monitoreo

### Logs del Backend
- En Render: Dashboard → Logs (tiempo real)

### Logs del Frontend
- En Vercel: Dashboard → Functions → Logs
- Console del navegador

---

##  Costos (Plan Gratuito)

| Servicio | Costo | Límites |
|----------|-------|---------|
| Railway (MySQL) | **Gratis** | 00 horas/mes, GB RAM, GB disco |
| Render (Backend) | **Gratis** | Duerme después de  min inactividad |
| Vercel (Frontend) | **Gratis** | 00GB bandwidth/mes |

**Nota:** En el plan gratuito de Render, el backend "duerme" después de  minutos de inactividad. La primera solicitud tardará 0-0 segundos en despertar.

---

##  URLs de Ejemplo

Después del despliegue tendrás:

- **Frontend:** `https://segura-mente-app-frontend.vercel.app/  `
- **Backend:** `https://segura-mente-app-ga8-220501096-aa1-ev02.onrender.com`
- **Base de datos:** Conexión privada vía Railway/PlanetScale

---

##  Checklist Final

- [ ] Base de datos MySQL creada y tablas migradas
- [ ] Backend desplegado en Render con todas las variables de entorno
- [ ] Frontend desplegado en Vercel
- [ ] Variable `REACT_APP_API_URL` configurada en Vercel
- [ ] Variable `CLIENT_URL` configurada en Render
- [ ] CORS configurado correctamente
- [ ] Contraseña de aplicación de Gmail configurada
- [ ] Pruebas de registro y login funcionando
- [ ] Emails de verificación llegando correctamente

---

## 🆘 Solución de Problemas

### Error: CORS blocked
- Verifica que `CLIENT_URL` en el backend coincida con la URL de Vercel
- Verifica `corsOptions` en `server.js`

### Error: Cannot connect to database
- Verifica las credenciales de MySQL en Render
- Verifica que la base de datos esté activa
- Revisa los logs en Render

### Emails no llegan
- Verifica que uses la contraseña de aplicación de Gmail
- Revisa los logs del backend
- Verifica que `EMAIL_USER`, `EMAIL_PASS` y `EMAIL_FROM` estén configurados

### Backend muy lento (primera solicitud)
- Normal en plan gratuito de Render: el servicio "duerme"
- Considera usar Railway o un plan de pago para estar siempre activo

---

##  Comandos Útiles

```bash
# Construir el frontend localmente
npm run build

# Ver el build de producción localmente
npx serve -s build

# Probar el backend en producción
curl https://tu-backend.onrender.com/api/health

# Generar JWT secret
node -e "console.log(require('crypto').randomBytes().toString('hex'))"
```

---

