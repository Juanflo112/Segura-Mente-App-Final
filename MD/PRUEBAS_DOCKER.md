# Pruebas de Validación de Docker - Segura-Mente App

Este archivo contiene pruebas para validar que el despliegue de Docker funciona correctamente.

## 1. Verificar Estado de los Contenedores

```powershell
docker-compose ps
```

Deberías ver:
- `seguramente-mysql` - STATUS: Up (healthy)
- `seguramente-backend` - STATUS: Up

## 2. Ver Logs

```powershell
# Ver logs de ambos servicios
docker-compose logs

# Ver logs solo del backend
docker-compose logs backend

# Ver logs solo de MySQL
docker-compose logs mysql

# Seguir logs en tiempo real
docker-compose logs -f
```

## 3. Probar Registro de Usuario

```powershell
$body = @{
    email = "test@example.com"
    nombre_usuario = "testuser"
    tipo_identificacion = "CC"
    identificacion = "1234567890"
    fecha_nacimiento = "1990-01-01"
    telefono = "3001234567"
    direccion = "Calle Test 123"
    tipo_usuario = "Cliente"
    password = "Test123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

## 4. Probar Login

```powershell
$loginBody = @{
    email = "test@example.com"
    password = "Test123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = ($response.Content | ConvertFrom-Json).token
Write-Output "Token: $token"
```

## 5. Listar Usuarios (requiere token)

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/users" -Method GET -Headers $headers | Select-Object -ExpandProperty Content
```

## 6. Verificar Base de Datos MySQL

```powershell
# Conectarse al contenedor MySQL
docker exec -it seguramente-mysql mysql -u seguramente_user -pseguramente_pass_123 seguramente_db

# Dentro de MySQL, ejecutar:
# SHOW TABLES;
# SELECT * FROM usuarios;
# EXIT;
```

## 7. Comandos de Gestión

```powershell
# Detener contenedores
docker-compose down

# Detener y eliminar volúmenes (CUIDADO: borra datos)
docker-compose down -v

# Reiniciar servicios
docker-compose restart

# Ver uso de recursos
docker stats

# Reconstruir imágenes
docker-compose up -d --build
```

## 8. Solución de Problemas

### Backend no se conecta a MySQL
```powershell
# Ver logs detallados
docker-compose logs backend

# Verificar que MySQL esté saludable
docker-compose ps
```

### Cambiar puerto si 5000 está ocupado
Editar `docker-compose.yml`, cambiar:
```yaml
ports:
  - "5001:5000"  # Usar puerto 5001 en tu máquina
```

### Limpiar todo y empezar de nuevo
```powershell
docker-compose down -v
docker system prune -a --volumes
docker-compose up -d --build
```
