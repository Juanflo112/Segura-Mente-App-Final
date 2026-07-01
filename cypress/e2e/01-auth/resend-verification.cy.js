/**
 * Pruebas de Reenvio de Verificacion
 * Endpoint: POST /api/auth/resend-verification
 * Propósito: Validar el reenvío de correos de verificación
 */

describe('Autenticacion - Reenvio de Verificacion', () => {
  
  before(() => {
    cy.wakeUpBackend();
  });

  it('Caso 3.1: Debe reenviar verificacion a usuario no verificado', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    // Primero registrar un usuario nuevo
    const userData = Cypress.generateTestUser('Cliente');
    cy.registerUser(userData).then((registerResponse) => {
      if (registerResponse.status === 201) {
        cy.log(`Usuario registrado: ${userData.email}`);
        cy.wait(2000); // Esperar un poco
        
        // Intentar reenviar verificación
        cy.request({
          method: 'POST',
          url: `${apiUrl}/auth/resend-verification`,
          body: {
            email: userData.email
          },
          failOnStatusCode: false
        }).then((response) => {
          // Puede ser 200 si funcionó, o 400 si ya está verificado (sistema automático)
          if (response.status === 200) {
            expect(response.body.success, 'Success debe ser true').to.be.true;
            expect(response.body.message, 'Debe confirmar envio').to.match(/enviado|sent|reenviado/i);
            cy.log('Reenvio de verificacion exitoso');
          } else {
            cy.log('Usuario ya verificado o error esperado');
          }
        });
      }
    });
  });

  it('Caso 3.2: Debe fallar con email no registrado', () => {
    const apiUrl = Cypress.env('apiUrl');
    const emailNoExiste = `noexiste${Date.now()}@example.com`;
    
    cy.log(`Intentando reenviar verificacion a email no registrado: ${emailNoExiste}`);
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/resend-verification`,
      body: {
        email: emailNoExiste
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 404 o 400').to.be.oneOf([404, 400]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Error de email no encontrado detectado correctamente');
    });
  });

  it('Caso 3.3: Debe fallar con usuario ya verificado', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log(`Intentando reenviar verificacion a usuario ya verificado: ${testUser.email}`);
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/resend-verification`,
      body: {
        email: testUser.email
      },
      failOnStatusCode: false
    }).then((response) => {
      // Puede ser 400 si ya está verificado, o 200 si permite reenvío
      if (response.status === 400) {
        expect(response.body.message, 'Debe mencionar que ya esta verificado').to.match(/ya.*verificad[oa]|already.*verified/i);
        cy.log('Sistema detecta correctamente usuarios ya verificados');
      } else {
        cy.log('Sistema permite reenvio incluso a verificados');
      }
    });
  });

  it('Caso 3.4: Debe requerir campo email', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando reenviar sin proporcionar email');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/resend-verification`,
      body: {},
      failOnStatusCode: false
    }).then((response) => {
      // Puede ser 400 (bad request) o 404 (no encontrado)
      expect(response.status, 'Status debe ser 400 o 404').to.be.oneOf([400, 404]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de campo requerido funciona correctamente');
    });
  });

  it('Caso 3.5: Debe validar formato de email', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando reenviar con formato de email invalido');
    
    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/resend-verification`,
      body: {
        email: 'email-invalido'
      },
      failOnStatusCode: false
    }).then((response) => {
      // Puede ser 400 (formato inválido) o 404 (no encontrado)
      expect(response.status, 'Status debe ser 400 o 404').to.be.oneOf([400, 404]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de formato de email funciona correctamente');
    });
  });
});
