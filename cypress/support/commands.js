// ***********************************************
// Comandos Personalizados para Segura-Mente App
// Pruebas de API desplegada en Render + Vercel
// ***********************************************

/**
 * Comando: wakeUpBackend
 * Propósito: Despertar el backend de Render si está en "sleep mode"
 * Render Free Tier duerme el servidor después de 15 minutos de inactividad
 */
Cypress.Commands.add('wakeUpBackend', () => {
  const apiUrl = Cypress.env('apiUrl');
  const baseUrl = apiUrl.replace('/api', '');
  
  cy.log('Despertando backend de Render...');
  cy.log('Esto puede tardar hasta 90 segundos en cold start');
  
  // Intento 1
  cy.request({
    method: 'GET',
    url: baseUrl,
    timeout: 30000,
    failOnStatusCode: false
  }).then((response) => {
    cy.log(`Intento 1: Status ${response.status}`);
  });
  
  cy.wait(10000);
  
  // Intento 2
  cy.request({
    method: 'GET',
    url: baseUrl,
    timeout: 30000,
    failOnStatusCode: false
  }).then((response) => {
    cy.log(`Intento 2: Status ${response.status}`);
  });
  
  cy.wait(10000);
  
  // Intento 3
  cy.request({
    method: 'GET',
    url: baseUrl,
    timeout: 30000,
    failOnStatusCode: false
  }).then((response) => {
    cy.log(`Intento 3: Status ${response.status}`);
  });
  
  cy.wait(10000);
  
  // Intento 4 - Final
  cy.request({
    method: 'GET',
    url: baseUrl,
    timeout: 30000,
    failOnStatusCode: false
  }).then((response) => {
    cy.log(`Intento 4: Status ${response.status}`);
    if (response.status === 200 || response.status === 404) {
      cy.log('✓ Backend activo y respondiendo');
    } else {
      cy.log('⚠ Backend aún no responde correctamente, continuando de todos modos...');
    }
  });
  
  cy.wait(5000); // Espera final para estabilización
});

/**
 * Comando: login
 * Propósito: Hacer login y obtener token JWT
 * @param {string} userType - Tipo de usuario: 'testUser', 'adminUser', etc.
 * @returns {string} Token JWT
 */
Cypress.Commands.add('login', (userType = 'testUser') => {
  // Si ya hay un token guardado, no hacer login de nuevo
  const existingToken = Cypress.env('authToken');
  if (existingToken) {
    cy.log('✓ Usando token existente');
    return;
  }
  
  const apiUrl = Cypress.env('apiUrl');
  const user = Cypress.env(userType);
  
  cy.log(`Iniciando sesion como: ${userType}`);
  
  if (!user || !user.email || !user.password) {
    throw new Error(`Usuario ${userType} no encontrado en cypress.env.json`);
  }
  
  cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/login`,
    body: {
      email: user.email,
      password: user.password
    },
    timeout: 30000,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 200) {
      // El token puede estar en body.token o en body.data.token
      const token = response.body.token || (response.body.data && response.body.data.token);
      if (token) {
        Cypress.env('authToken', token);
        cy.log(`Login exitoso. Token obtenido.`);
      } else {
        throw new Error('Login exitoso pero no se encontró token en la respuesta');
      }
    } else {
      cy.log(`Login fallo: ${response.body.message || response.statusText}`);
      throw new Error(`Login fallo: ${response.body.message || response.statusText}`);
    }
  });
});

/**
 * Comando: apiRequest
 * Propósito: Hacer peticiones autenticadas al API
 * @param {string} method - Método HTTP: GET, POST, PUT, DELETE
 * @param {string} endpoint - Endpoint (ej: '/users', '/auth/login')
 * @param {object} body - Cuerpo de la petición (opcional)
 * @param {boolean} useToken - Si debe usar token de autenticación (default: true)
 */
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, useToken = true) => {
  const apiUrl = Cypress.env('apiUrl');
  
  const options = {
    method: method,
    url: `${apiUrl}${endpoint}`,
    timeout: 60000,
    failOnStatusCode: false
  };
  
  if (body) {
    options.body = body;
  }
  
  if (useToken) {
    const token = Cypress.env('authToken');
    if (token) {
      options.headers = {
        'Authorization': `Bearer ${token}`
      };
    }
  }
  
  cy.log(`${method} ${endpoint}`);
  return cy.request(options);
});

/**
 * Comando: apiRequestWithDelay
 * Propósito: Hacer petición con delay para evitar rate limiting
 * @param {string} method - Método HTTP
 * @param {string} endpoint - Endpoint
 * @param {object} body - Cuerpo de la petición (opcional)
 * @param {number} delay - Milisegundos de espera (default: 1000)
 */
Cypress.Commands.add('apiRequestWithDelay', (method, endpoint, body = null, delay = 1000) => {
  cy.wait(delay);
  return cy.apiRequest(method, endpoint, body);
});

/**
 * Comando: registerUser
 * Propósito: Registrar un nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {object} Respuesta del registro
 */
Cypress.Commands.add('registerUser', (userData) => {
  const apiUrl = Cypress.env('apiUrl');
  
  cy.log(`Registrando usuario: ${userData.email}`);
  
  return cy.request({
    method: 'POST',
    url: `${apiUrl}/auth/register`,
    body: userData,
    timeout: 60000,
    failOnStatusCode: false
  }).then((response) => {
    // No usar cy.log() dentro de .then() cuando se retorna un valor
    return response;
  });
});

/**
 * Comando: createUserFromDashboard
 * Propósito: Crear usuario desde el dashboard (requiere autenticación)
 * @param {object} userData - Datos del usuario
 */
Cypress.Commands.add('createUserFromDashboard', (userData) => {
  cy.log(`Creando usuario desde dashboard: ${userData.email}`);
  
  return cy.apiRequest('POST', '/users', {
    nombre_usuario: userData.nombreUsuario,
    tipo_identificacion: userData.tipoIdentificacion,
    identificacion: userData.identificacion,
    fecha_nacimiento: userData.fechaNacimiento,
    telefono: userData.telefono,
    direccion: userData.direccion,
    email: userData.email,
    password: userData.password,
    tipo_usuario: userData.tipo_usuario || 'Cliente',
    formacion_profesional: userData.formacion_profesional || null,
    tarjeta_profesional: userData.tarjeta_profesional || null
  });
});

/**
 * Comando: deleteUser
 * Propósito: Eliminar un usuario por email
 * @param {string} email - Email del usuario a eliminar
 */
Cypress.Commands.add('deleteUser', (email) => {
  cy.log(`Eliminando usuario: ${email}`);
  
  return cy.apiRequest('DELETE', `/users/${email}`);
});

/**
 * Comando: generateUniqueEmail
 * Propósito: Generar un email único para pruebas
 * @param {string} prefix - Prefijo del email (default: 'test')
 * @returns {string} Email único
 */
Cypress.Commands.add('generateUniqueEmail', (prefix = 'test') => {
  const timestamp = Date.now();
  const email = `${prefix}${timestamp}@example.com`;
  return email;
});

/**
 * Comando: generateTestUser
 * Propósito: Generar datos de usuario de prueba con email único
 * @param {string} type - Tipo de usuario: 'Cliente' o 'Psicólogo/empleado'
 * @returns {object} Datos del usuario
 */
Cypress.Commands.add('generateTestUser', (type = 'Cliente') => {
  const timestamp = Date.now();
  
  const baseUser = {
    nombreUsuario: `testuser${timestamp}`,
    tipoIdentificacion: 'CC',
    identificacion: `${timestamp}`.substring(0, 10),
    fechaNacimiento: '1990-01-01',
    telefono: `300${timestamp}`.substring(0, 10),
    direccion: 'Calle Test 123',
    email: `test${timestamp}@example.com`,
    password: 'TestUser123!',
    confirmPassword: 'TestUser123!',
    tipo_usuario: type
  };
  
  if (type === 'Psicólogo/empleado') {
    baseUser.formacion_profesional = 'Psicologo Clinico';
    baseUser.tarjeta_profesional = `PSI-${timestamp}`.substring(0, 15);
  }
  
  return baseUser;
});

// Exportar también como función global para compatibilidad
Cypress.generateTestUser = (type = 'Cliente') => {
  const timestamp = Date.now();
  
  const baseUser = {
    nombreUsuario: `testuser${timestamp}`,
    tipoIdentificacion: 'CC',
    identificacion: `${timestamp}`.substring(0, 10),
    fechaNacimiento: '1990-01-01',
    telefono: `300${timestamp}`.substring(0, 10),
    direccion: 'Calle Test 123',
    email: `test${timestamp}@example.com`,
    password: 'TestUser123!',
    confirmPassword: 'TestUser123!',
    tipo_usuario: type
  };
  
  if (type === 'Psicólogo/empleado') {
    baseUser.formacion_profesional = 'Psicologo Clinico';
    baseUser.tarjeta_profesional = `PSI-${timestamp}`.substring(0, 15);
  }
  
  return baseUser;
};

/**
 * Comando: verifyApiConnection
 * Propósito: Verificar que el API está accesible
 */
Cypress.Commands.add('verifyApiConnection', () => {
  const apiUrl = Cypress.env('apiUrl');
  const baseUrl = apiUrl.replace('/api', '');
  
  cy.log('Verificando conexion al API...');
  
  return cy.request({
    method: 'GET',
    url: baseUrl,
    timeout: 60000,
    failOnStatusCode: false
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 404]);
    return response;
  });
});

/**
 * Comando: cleanupTestData
 * Propósito: Limpiar datos de prueba creados durante las pruebas
 * @param {array} emails - Array de emails a eliminar
 */
Cypress.Commands.add('cleanupTestData', (emails = []) => {
  if (emails.length === 0) {
    cy.log('No hay datos para limpiar');
    return;
  }
  
  cy.log(`Limpiando ${emails.length} usuarios de prueba...`);
  
  emails.forEach((email) => {
    cy.deleteUser(email);
  });
});

/**
 * Comando: waitForBackend
 * Propósito: Esperar a que el backend responda (útil después de cold start)
 * @param {number} maxAttempts - Intentos máximos (default: 10)
 */
Cypress.Commands.add('waitForBackend', (maxAttempts = 10) => {
  const apiUrl = Cypress.env('apiUrl');
  const baseUrl = apiUrl.replace('/api', '');
  
  cy.log('Esperando respuesta del backend...');
  
  function attemptConnection(attempt = 1) {
    return cy.request({
      method: 'GET',
      url: baseUrl,
      timeout: 10000,
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200 || response.status === 404) {
        return response;
      } else if (attempt < maxAttempts) {
        cy.wait(5000);
        return attemptConnection(attempt + 1);
      } else {
        throw new Error('Backend no respondio despues de varios intentos');
      }
    });
  }
  
  return attemptConnection();
});

/**
 * Comando: loginUI
 * Propósito: Hacer login a través de la interfaz de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 */
Cypress.Commands.add('loginUI', (email, password) => {
  const frontendUrl = Cypress.env('frontendUrl');
  
  cy.log(`Iniciando sesion por UI: ${email}`);
  
  cy.visit(`${frontendUrl}/login`);
  cy.get('[name="email"]', { timeout: 15000 }).should('be.visible').type(email);
  cy.get('[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Esperar redirección
  cy.url({ timeout: 30000 }).should('include', '/dashboard');
});

/**
 * Comando: checkResponseTime
 * Propósito: Verificar que el tiempo de respuesta esté dentro del límite
 * @param {number} duration - Duración de la respuesta
 * @param {number} maxTime - Tiempo máximo en milisegundos
 */
Cypress.Commands.add('checkResponseTime', (duration, maxTime) => {
  expect(duration).to.be.lessThan(maxTime);
});

// ***********************************************
// Sobrescribir comando 'request' para medir tiempo
// ***********************************************
// Sobrescribir comando 'request' para medir tiempo
// ***********************************************
Cypress.Commands.overwrite('request', (originalFn, ...args) => {
  const startTime = Date.now();
  
  return originalFn(...args).then((response) => {
    const duration = Date.now() - startTime;
    
    // Agregar duración al response
    response.duration = duration;
    
    return response;
  });
});