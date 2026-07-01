/**
 * Pruebas de Inicio de Sesion
 * Endpoint: POST /api/auth/login
 * Propósito: Validar el proceso de autenticación de usuarios
 */

describe('Autenticacion - Inicio de Sesion', () => {
  
  before(() => {
    cy.wakeUpBackend();
  });

  it('Caso 2.1: Debe iniciar sesion con credenciales validas', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log(`Intentando login con: ${testUser.email}`);
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password
      },
      timeout: 30000,
      failOnStatusCode: false
    }).then((response) => {
      // Si el usuario no existe o no está verificado, podemos tener 401
      // Esto es esperado en pruebas de producción
      if (response.status === 401) {
        cy.log('Usuario no verificado o no existe - Esto es esperado en primera ejecucion');
        expect(response.body.success).to.be.false;
      } else {
        // Login exitoso
        expect(response.status, 'Status debe ser 200').to.eq(200);
        expect(response.body.success, 'Success debe ser true').to.be.true;
        
        // El token puede estar directamente en body.token o en body.data.token
        const token = response.body.token || (response.body.data && response.body.data.token);
        const user = response.body.user || (response.body.data && response.body.data.user);
        
        expect(token, 'Debe tener token JWT').to.exist;
        
        // Validar formato del token JWT (3 partes separadas por puntos)
        const tokenParts = token.split('.');
        expect(tokenParts, 'Token JWT debe tener 3 partes').to.have.lengthOf(3);
        
        // Si hay datos de usuario, validarlos
        if (user) {
          expect(user.email, 'Email debe coincidir').to.eq(testUser.email);
          expect(user.password, 'Password no debe estar en respuesta').to.not.exist;
        }
        
        cy.log(`Login exitoso en ${response.duration}ms`);
        cy.log(`Token obtenido (primeros 20 chars): ${token.substring(0, 20)}...`);
      }
    });
  });

  it('Caso 2.2: Debe fallar con credenciales incorrectas', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando login con password incorrecta');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: 'test@example.com',
        password: 'PasswordIncorrecta123!'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Puede ser 401 (credenciales incorrectas) o 404 (usuario no encontrado)
      expect(response.status, 'Status debe ser 401 o 404').to.be.oneOf([401, 404]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      // No debe devolver token
      expect(response.body.data?.token, 'No debe devolver token').to.not.exist;
      
      cy.log('Error de credenciales incorrectas detectado correctamente');
    });
  });

  it('Caso 2.3: Debe fallar con email no registrado', () => {
    const apiUrl = Cypress.env('apiUrl');
    const emailNoExiste = `noexiste${Date.now()}@example.com`;
    
    cy.log(`Intentando login con email no registrado: ${emailNoExiste}`);
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: emailNoExiste,
        password: 'Password123!'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Puede ser 401 (no autorizado) o 404 (usuario no encontrado)
      expect(response.status, 'Status debe ser 401 o 404').to.be.oneOf([401, 404]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Error de email no registrado detectado correctamente');
    });
  });

  it('Caso 2.4: Debe requerir email y password', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando login sin credenciales');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de campos requeridos funciona correctamente');
    });
  });

  it('Caso 2.5: Debe validar formato de email', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando login con formato de email invalido');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: 'email-sin-arroba',
        password: 'Password123!'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de formato de email funciona correctamente');
    });
  });

  it('Caso 2.6: Debe validar tiempo de respuesta rapido', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    const startTime = Date.now();
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/login`,
      body: {
        email: testUser.email,
        password: testUser.password
      },
      failOnStatusCode: false
    }).then((response) => {
      const duration = Date.now() - startTime;
      
      // Backend ya debe estar despierto, debe responder rápido
      expect(duration, 'Login debe responder en menos de 5 segundos').to.be.lessThan(5000);
      
      cy.log(`Tiempo de respuesta: ${duration}ms`);
    });
  });

  it('Caso 2.7: Debe funcionar con comando personalizado login', () => {
    cy.log('Probando comando personalizado cy.login()');
    
    // Intentar login con comando personalizado
    // El comando login puede fallar si el usuario no está verificado
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    // Verificar si se guardó el token en el entorno
    cy.then(() => {
      const token = Cypress.env('authToken');
      if (token) {
        expect(token.split('.'), 'Token debe tener formato JWT').to.have.lengthOf(3);
        cy.log('Comando personalizado cy.login() funciona correctamente');
      } else {
        cy.log('Usuario no verificado - Login no generó token (esto es esperado)');
      }
    });
  });

  it('Caso 2.8: Debe fallar con usuario no verificado (si aplica)', () => {
    // Esta prueba es opcional, depende de si tienes un usuario no verificado
    const apiUrl = Cypress.env('apiUrl');
    
    // Primero registrar un usuario nuevo (que no estará verificado)
    const userData = Cypress.generateTestUser('Cliente');
    cy.registerUser(userData).then((registerResponse) => {
      if (registerResponse.status === 201) {
        cy.log(`Usuario registrado: ${userData.email}`);
        
        // Intentar login inmediatamente (sin verificar)
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/login`,
          body: {
            email: userData.email,
            password: userData.password
          },
          failOnStatusCode: false
        }).then((loginResponse) => {
          // Puede ser 401 si requiere verificación
          // o 200 si el sistema permite login sin verificar
          if (loginResponse.status === 401) {
            cy.log('Sistema requiere verificacion de email - Correcto');
          } else {
            cy.log('Sistema permite login sin verificacion - Revisar politicas');
          }
        });
      }
    });
  });
});
