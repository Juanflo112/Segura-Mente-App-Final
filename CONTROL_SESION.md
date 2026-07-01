# Sistema de Control de Sesión por Inactividad

## Descripción

Sistema automático que cierra la sesión del usuario después de ** minutos de inactividad**, con una advertencia ** minuto antes** de cerrar.

## Archivos Creados

. **`src/hooks/useSessionTimeout.js`** - Hook personalizado
. **`src/components/SessionWarning.jsx`** - Componente de advertencia
. **`src/components/SessionWarning.css`** - Estilos del modal
. **`src/pages/DashboardPage.jsx`** - Actualizado con el hook

## Cómo Funciona

### . Detección de Actividad
El sistema detecta estos eventos del usuario:
- Movimiento del mouse (`mousemove`)
- Clicks del mouse (`mousedown`, `click`)
- Teclas presionadas (`keypress`)
- Scroll de la página (`scroll`)
- Touch en móviles (`touchstart`)

### . Temporizador de Inactividad
```
Tiempo total:  minutos
├─ Minutos 0-: Usuario activo, temporizador se reinicia con cada acción
├─ Minuto : Aparece advertencia "Sesión por expirar"
└─ Minuto : Cierre automático de sesión
```

### . Flujo del Sistema

```
Usuario activo
    ↓
[Detecta evento] → Reinicia temporizador
    ↓
 minutos sin actividad
    ↓
[Muestra advertencia]
    ↓
Usuario puede:
├─ Hacer click en "Continuar sesión" → Reinicia todo
└─ No hacer nada → Cierra sesión automáticamente
```

## Uso del Hook

```javascript
// Importar el hook
import useSessionTimeout from '../hooks/useSessionTimeout';

// Usar en el componente
const { showWarning, remainingTime, resetTimer } = useSessionTimeout(, );
//                                                                     ↑  ↑
//                                                       min total ─┘  └─  min advertencia
```

### Parámetros:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `timeoutMinutes` | number |  | Tiempo total de inactividad antes de cerrar sesión |
| `warningMinutes` | number |  | Tiempo de advertencia antes del cierre |

### Valores de retorno:

| Valor | Tipo | Descripción |
|-------|------|-------------|
| `showWarning` | boolean | `true` cuando debe mostrar la advertencia |
| `remainingTime` | number | Segundos restantes antes de cerrar |
| `resetTimer` | function | Función para reiniciar manualmente el temporizador |

## Componente SessionWarning

```javascript
<SessionWarning 
  remainingTime={0}        // Segundos restantes
  onContinue={resetTimer}   // Función al hacer click en "Continuar"
/>
```

### Características:
- Muestra cuenta regresiva en formato `MM:SS`
- Fondo oscuro semitransparente
- Modal centrado con animaciones
- Botón para continuar la sesión
- Icono de reloj

## Acciones al Cerrar Sesión

Cuando se cierra la sesión automáticamente:

. **Limpia localStorage:**
   - Elimina `userData`
   - Elimina `token`

. **Limpia temporizadores:**
   - Cancela timeout de advertencia
   - Cancela timeout de cierre

. **Redirección:**
   - Envía al usuario a `/login`

## Configuración Personalizada

### Cambiar tiempos:

```javascript
// 0 minutos de inactividad, advertencia  minutos antes
const { showWarning, remainingTime, resetTimer } = useSessionTimeout(0, );

//  minutos de inactividad, advertencia 0 segundos antes
const { showWarning, remainingTime, resetTimer } = useSessionTimeout(, 0.);
```

### Deshabilitar advertencia:

```javascript
// Solo cierre automático sin advertencia
const { showWarning, remainingTime, resetTimer } = useSessionTimeout(, 0);

// Y no renderizar el componente SessionWarning
```

### Aplicar en toda la aplicación:

Puedes mover el hook a `App.jsx` para que funcione en todas las páginas:

```javascript
// src/App.jsx
function App() {
  const { showWarning, remainingTime, resetTimer } = useSessionTimeout(, );

  return (
    <Router>
      <Routes>
        {/* tus rutas */}
      </Routes>
      
      {/* Advertencia global */}
      {showWarning && (
        <SessionWarning 
          remainingTime={remainingTime}
          onContinue={resetTimer}
        />
      )}
    </Router>
  );
}
```

## Pruebas

### Para probar rápidamente:

Cambia los tiempos a valores pequeños:

```javascript
// 0 segundos de inactividad, advertencia 0 segundos antes
const { showWarning, remainingTime, resetTimer } = useSessionTimeout(0., 0.7);
```

### Pasos para probar:

. Inicia sesión en la aplicación
. Ve al Dashboard
. **No muevas el mouse ni toques el teclado**
. Después de  minutos, verás la advertencia
. Opciones:
   - Hacer click en "Continuar sesión" → Reinicia el temporizador
   - No hacer nada → Después de  minuto más, cierra sesión automáticamente

##  Logs en Consola

El sistema imprime logs útiles:

```
Cerrando sesión por inactividad...
```

## Beneficios
**Seguridad:** Protege cuentas en computadoras compartidas  
**Automático:** No requiere acción del usuario  
**Configurable:** Tiempos personalizables  
**User-friendly:** Advertencia antes de cerrar  
**Reutilizable:** Hook puede usarse en cualquier componente  

## Extensiones Futuras

Posibles mejoras:

- Guardar estado del usuario antes de cerrar
- Enviar logs al backend
- Notificaciones de escritorio
- Reproducir sonido en la advertencia
- Guardar trabajo en progreso automáticamente
- Diferentes tiempos según el tipo de usuario (admin vs normal)

## Notas Importantes

- El temporizador se reinicia con **cualquier actividad** del usuario
- Si el usuario cierra la pestaña, la sesión permanece (considera agregar validación en el backend)
- En producción, considera combinar con validación de token en el backend
- os eventos de red (fetch, axios) NO reinician el temporizador automáticamente

## Implementación Actual

El sistema está configurado en:
- **Página:** Dashboard
- **Tiempo de inactividad:**  minutos
- **Advertencia:**  minuto antes
- **Eventos detectados:** Mouse, teclado, scroll, touch

¿Necesitas cambiar alguna configuración? Edita los valores en `DashboardPage.jsx`:

```javascript
const { showWarning, remainingTime, resetTimer } = useSessionTimeout(, );
//                                                  Cambia aquí ─┘  └─ y aquí
```
