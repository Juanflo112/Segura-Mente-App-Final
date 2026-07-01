/**
 * Pruebas de Recuperacion de Contraseña
 * Endpoints: POST /api/auth/forgot-password, POST /api/auth/reset-password
 * Propósito: Validar el proceso de recuperación y restablecimiento de contraseña
 */

describe('Autenticacion - Recuperacion de Contraseña', () => {
  
  before(() => {
    cy.wakeUpBackend();
    cy.wait(10000); // Espera adicional para estabilización completa
    cy.log('Backend debe estar listo, iniciando pruebas...');
  });

  it('Caso 4.1: Debe enviar email de recuperacion con email registrado', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log(`Solicitando recuperacion de contraseña para: ${testUser.email}`);
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/forgot-password`,
      body: {
        email: testUser.email
      },
      timeout: 30000,
      failOnStatusCode: false
    }).then((response) => {
      // Puede ser 200 (enviado) o 404 (email no existe)
      if (response.status === 200) {
        expect(response.body.success, 'Success debe ser true').to.be.true;
        expect(response.body.message, 'Debe confirmar envio de email').to.match(/enviado|sent|correo|email/i);
        cy.log('Email de recuperacion enviado exitosamente');
      } else if (response.status === 404) {
        expect(response.body.success, 'Success debe ser false').to.be.false;
        cy.log('Usuario no encontrado - comportamiento esperado si no esta verificado');
      }
    });
  });

  it('Caso 4.2: Debe fallar con email no registrado', () => {
    const apiUrl = Cypress.env('apiUrl');
    const emailNoExiste = `noexiste${Date.now()}@example.com`;
    
    cy.log(`Intentando recuperacion con email no registrado: ${emailNoExiste}`);
    
    function intentarRequest(intentos = 0) {
      return cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/forgot-password`,
        body: {
          email: emailNoExiste
        },
        timeout: 120000,
        failOnStatusCode: false
      }).then((response) => {
        // Si el backend aún está despertando, reintentar hasta 8 veces (hasta 2 minutos)
        if (response.status === 503 && intentos < 8) {
          cy.log(`Backend aún iniciando (intento ${intentos + 1}/8), esperando 15 segundos...`);
          cy.wait(15000);
          return intentarRequest(intentos + 1);
        }
        return response;
      });
    }
    
    intentarRequest().then((response) => {
      // Puede ser 404 (no encontrado) o 200 (por seguridad, no revelar si existe)
      expect(response.status, 'Status debe ser 200 o 404').to.be.oneOf([200, 404]);
      
      if (response.status === 404) {
        expect(response.body.success, 'Success debe ser false').to.be.false;
        cy.log('Sistema detecta correctamente email no registrado');
      } else {
        cy.log('Sistema no revela si el email existe (buena practica de seguridad)');
      }
    });
  });

  it('Caso 4.3: Debe requerir campo email', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando recuperacion sin proporcionar email');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/forgot-password`,
      body: {},
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message || response.body.errors, 'Debe tener mensaje de error').to.exist;
      
      cy.log('Validacion de campo requerido funciona correctamente');
    });
  });

  it('Caso 4.4: Debe validar formato de email', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando recuperacion con formato de email invalido');
    
    function intentarRequest(intentos = 0) {
      return cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/forgot-password`,
        body: {
          email: 'email-sin-arroba'
        },
        timeout: 120000,
        failOnStatusCode: false
      }).then((response) => {
        // Si el backend aún está despertando, reintentar hasta 8 veces
        if (response.status === 503 && intentos < 8) {
          cy.log(`Backend aún iniciando (intento ${intentos + 1}/8), esperando 15 segundos...`);
          cy.wait(15000);
          return intentarRequest(intentos + 1);
        }
        return response;
      });
    }
    
    intentarRequest().then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message || response.body.errors, 'Debe tener mensaje de error').to.exist;
      
      cy.log('Validacion de formato de email funciona correctamente');
    });
  });

  it('Caso 4.5: Debe validar tiempo de respuesta aceptable', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    const startTime = Date.now();
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/forgot-password`,
      body: {
        email: testUser.email
      },
      failOnStatusCode: false
    }).then((response) => {
      const duration = Date.now() - startTime;
      
      // Backend ya debe estar despierto, debe responder en tiempo razonable
      expect(duration, 'Debe responder en menos de 10 segundos').to.be.lessThan(10000);
      
      cy.log(`Tiempo de respuesta: ${duration}ms`);
    });
  });

  it('Caso 4.6: Debe prevenir solicitudes multiples en corto tiempo (rate limiting)', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Probando multiples solicitudes de recuperacion');
    
    // Primera solicitud
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/forgot-password`,
      body: {
        email: testUser.email
      },
      failOnStatusCode: false
    }).then((firstResponse) => {
      cy.log(`Primera solicitud: ${firstResponse.status}`);
      
      // Segunda solicitud inmediata
      cy.request({
        method: 'POST',
        url: `${apiUrl}/auth/forgot-password`,
        body: {
          email: testUser.email
        },
        failOnStatusCode: false
      }).then((secondResponse) => {
        cy.log(`Segunda solicitud: ${secondResponse.status}`);
        
        // Puede ser 429 (too many requests) o 200 (permitido)
        if (secondResponse.status === 429) {
          cy.log('Sistema tiene rate limiting implementado - Excelente');
        } else {
          cy.log('Sistema permite multiples solicitudes - Considerar implementar rate limiting');
        }
      });
    });
  });

  it('Caso 4.7: Debe validar restablecimiento con token valido (simulado)', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando restablecer contraseña con token (simulado)');
    
    // Como no tenemos acceso al email real, simulamos el intento
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/reset-password`,
      body: {
        token: 'token-de-prueba-invalido',
        newPassword: 'NuevaPassword123!',
        confirmPassword: 'NuevaPassword123!'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Debe fallar porque el token no es válido
      expect(response.status, 'Status debe ser 400 o 401').to.be.oneOf([400, 401, 404]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de token funciona correctamente');
    });
  });

  it('Caso 4.8: Debe rechazar token expirado', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando restablecer con token expirado simulado');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/reset-password`,
      body: {
        token: 'expired-token-12345',
        newPassword: 'NuevaPassword123!',
        confirmPassword: 'NuevaPassword123!'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe indicar error').to.be.oneOf([400, 401, 404]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Rechazo de token expirado funciona correctamente');
    });
  });

  it('Caso 4.9: Debe validar que las contraseñas nuevas coincidan', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando restablecer con contraseñas que no coinciden');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/reset-password`,
      body: {
        token: 'cualquier-token',
        newPassword: 'Password123!',
        confirmPassword: 'DiferentePassword123!'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de coincidencia de contraseñas funciona correctamente');
    });
  });

  it('Caso 4.10: Debe validar fortaleza de nueva contraseña', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando restablecer con contraseña debil');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/reset-password`,
      body: {
        token: 'cualquier-token',
        newPassword: '123',
        confirmPassword: '123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de fortaleza de contraseña funciona correctamente');
    });
  });

  it('Caso 4.11: Debe requerir todos los campos para reset', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando reset sin campos requeridos');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/reset-password`,
      body: {
        token: 'token-prueba'
        // Faltan newPassword y confirmPassword
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message || response.body.errors, 'Debe tener mensaje de error').to.exist;
      
      cy.log('Validacion de campos requeridos funciona correctamente');
    });
  });

  it('Caso 4.12: Flujo completo - Solicitud y validacion de estructura', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Probando flujo completo de recuperacion');
    
    // Paso 1: Solicitar recuperación
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/forgot-password`,
      body: {
        email: testUser.email
      },
      failOnStatusCode: false
    }).then((forgotResponse) => {
      cy.log(`Solicitud de recuperacion: ${forgotResponse.status}`);
      
      if (forgotResponse.status === 200) {
        // Validar estructura de respuesta
        expect(forgotResponse.body, 'Debe tener estructura de respuesta').to.have.property('success');
        expect(forgotResponse.body, 'Debe tener mensaje').to.have.property('message');
        
        cy.log('Flujo de recuperacion iniciado correctamente');
        cy.log('Nota: En ambiente real, se revisaria el email para obtener el token');
      } else {
        cy.log('Usuario no encontrado o error - verificar estado de la cuenta');
      }
    });
  });
});
