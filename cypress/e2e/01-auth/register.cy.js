/**
 * Pruebas de Registro de Usuario
 * Endpoint: POST /api/auth/register
 * Propósito: Validar el proceso de registro de nuevos usuarios
 */

describe('Autenticacion - Registro de Usuario', () => {
  
  before(() => {
    cy.log('Despertando backend de Render...');
    cy.wakeUpBackend();
  });

  it('Caso 1.1: Debe registrar un nuevo usuario con datos validos', () => {
    // Generar usuario con email único
    const userData = Cypress.generateTestUser('Cliente');
    cy.log(`Registrando usuario: ${userData.email}`);
    
    cy.registerUser(userData).then((response) => {
      // Validaciones
      expect(response.status, 'Status debe ser 201').to.eq(201);
      expect(response.body.success, 'Success debe ser true').to.be.true;
      expect(response.body.data, 'Debe tener data').to.exist;
      expect(response.body.data.email, 'Email debe coincidir').to.eq(userData.email);
      expect(response.body.data.nombreUsuario, 'Nombre debe coincidir').to.eq(userData.nombreUsuario);
      expect(response.body.message, 'Debe tener mensaje de éxito').to.include('exitosamente');
      
      // Validar que no se devuelva la contraseña
      expect(response.body.data.password, 'Password no debe estar en respuesta').to.not.exist;
      
      // Validar tiempo de respuesta (generoso para cold start de Render)
      expect(response.duration, 'Debe responder en menos de 30 segundos').to.be.lessThan(30000);
      
      cy.log(`Usuario registrado exitosamente en ${response.duration}ms`);
    });
  });

  it('Caso 1.2: Debe fallar con email duplicado', () => {
    const testUser = Cypress.env('testUser');
    
    cy.log(`Intentando registrar email duplicado: ${testUser.email}`);
    
    cy.registerUser(testUser).then((response) => {
      // Debe fallar porque el email ya existe
      expect(response.status, 'Status debe ser 400 o 409').to.be.oneOf([400, 409]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message, 'Debe mencionar que el email ya existe').to.match(/correo|email|ya está|registrado|duplicado/i);
      
      cy.log('Error de email duplicado detectado correctamente');
    });
  });

  it('Caso 1.3: Debe fallar con contrasena debil', () => {
    const userData = Cypress.generateTestUser('Cliente');
    // Modificar para tener contraseña débil
    userData.password = '123';
    userData.confirmPassword = '123';
    
    cy.log('Intentando registrar con contrasena debil: 123');
    
    cy.registerUser(userData).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message || response.body.errors, 'Debe mencionar requisitos de contraseña').to.exist;
      
      cy.log('Validacion de contrasena debil funciona correctamente');
    });
  });

  it('Caso 1.4: Debe fallar con campos faltantes', () => {
    const datosIncompletos = {
      email: `incompleto${Date.now()}@example.com`,
      password: 'Password123!'
      // Faltan campos requeridos
    };
    
    cy.log('Intentando registrar con datos incompletos');
    
    cy.registerUser(datosIncompletos).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      // Debe indicar errores de validación
      const hasErrors = response.body.errors || response.body.message;
      expect(hasErrors, 'Debe tener errores de validacion').to.exist;
      
      cy.log('Validacion de campos obligatorios funciona correctamente');
    });
  });

  it('Caso 1.5: Debe fallar con usuario menor de edad', () => {
    const userData = Cypress.generateTestUser('Cliente');
    // Cambiar fecha de nacimiento a menor de 18 años
    const currentYear = new Date().getFullYear();
    userData.fechaNacimiento = `${currentYear - 10}-01-01`;
    
    cy.log(`Intentando registrar menor de edad: ${userData.fechaNacimiento}`);
    
    cy.registerUser(userData).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      // El mensaje puede ser genérico o específico
      expect(response.body.message || response.body.errors, 'Debe tener mensaje de error').to.exist;
      
      cy.log('Validacion de edad minima funciona correctamente');
    });
  });

  it('Caso 1.6: Debe fallar con telefono invalido', () => {
    const userData = Cypress.generateTestUser('Cliente');
    userData.telefono = '123'; // Teléfono muy corto
    
    cy.log('Intentando registrar con telefono invalido: 123');
    
    cy.registerUser(userData).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message || response.body.errors, 'Debe tener mensaje de error').to.exist;
      
      cy.log('Validacion de telefono funciona correctamente');
    });
  });

  it('Caso 1.7: Debe fallar con formato de email invalido', () => {
    const userData = Cypress.generateTestUser('Cliente');
    userData.email = 'email-invalido'; // Sin @
    
    cy.log('Intentando registrar con email invalido: email-invalido');
    
    cy.registerUser(userData).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message || response.body.errors, 'Debe mencionar formato de email').to.exist;
      
      cy.log('Validacion de formato de email funciona correctamente');
    });
  });

  it('Caso 1.8: Debe validar que las contrasenas coincidan', () => {
    const userData = Cypress.generateTestUser('Cliente');
    userData.password = 'Password123!';
    userData.confirmPassword = 'DiferentePassword123!';
    
    cy.log('Intentando registrar con contrasenas diferentes');
    
    cy.registerUser(userData).then((response) => {
      expect(response.status, 'Status debe ser 400').to.eq(400);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      expect(response.body.message || response.body.errors, 'Debe tener mensaje de error').to.exist;
      
      cy.log('Validacion de coincidencia de contrasenas funciona correctamente');
    });
  });

  it('Caso 1.9: Debe registrar usuario tipo Psicologo con campos adicionales', () => {
    const userData = Cypress.generateTestUser('Psicólogo/empleado');
    cy.log(`Registrando psicologo: ${userData.email}`);
    
    cy.registerUser(userData).then((response) => {
      expect(response.status, 'Status debe ser 201').to.eq(201);
      expect(response.body.success, 'Success debe ser true').to.be.true;
      expect(response.body.data.email, 'Email debe coincidir').to.eq(userData.email);
      
      cy.log('Psicologo registrado exitosamente');
    });
  });

  it('Caso 1.10: Debe validar tiempo de respuesta aceptable', () => {
    const userData = Cypress.generateTestUser('Cliente');
    const startTime = Date.now();
    
    cy.registerUser(userData).then((response) => {
      const duration = Date.now() - startTime;
      
      // Validar que responda en tiempo razonable
      // Considerar cold start de Render (puede tardar hasta 30 segundos)
      expect(duration, 'Debe responder en menos de 30 segundos').to.be.lessThan(30000);
      
      cy.log(`Tiempo de respuesta: ${duration}ms`);
    });
  });
});
