/**
 * Prueba de Verificación de Entorno
 * Propósito: Validar que todas las variables de entorno están configuradas
 * y que el backend en Render está accesible
 */

describe('Verificacion de Entorno - Segura-Mente', () => {
  
  it('Debe tener variables de entorno configuradas', () => {
    const apiUrl = Cypress.env('apiUrl');
    const frontendUrl = Cypress.env('frontendUrl');
    const renderColdStartTimeout = Cypress.env('renderColdStartTimeout');
    
    // Verificar URLs
    expect(apiUrl, 'API URL debe existir').to.exist;
    expect(apiUrl, 'API URL debe ser HTTPS').to.include('https://');
    expect(apiUrl, 'API URL debe incluir /api').to.include('/api');
    
    expect(frontendUrl, 'Frontend URL debe existir').to.exist;
    expect(frontendUrl, 'Frontend URL debe ser HTTPS').to.include('https://');
    
    expect(renderColdStartTimeout, 'Timeout debe existir').to.exist;
    expect(renderColdStartTimeout, 'Timeout debe ser numero').to.be.a('number');
    
    cy.log('Variables de entorno configuradas correctamente');
    cy.log(`API: ${apiUrl}`);
    cy.log(`Frontend: ${frontendUrl}`);
    cy.log(`Cold Start Timeout: ${renderColdStartTimeout}ms`);
  });
  
  it('Debe tener credenciales de testUser configuradas', () => {
    const testUser = Cypress.env('testUser');
    
    expect(testUser, 'testUser debe existir').to.exist;
    expect(testUser.email, 'testUser.email debe existir').to.exist;
    expect(testUser.password, 'testUser.password debe existir').to.exist;
    expect(testUser.nombreUsuario, 'testUser.nombreUsuario debe existir').to.exist;
    expect(testUser.tipoIdentificacion, 'testUser.tipoIdentificacion debe existir').to.exist;
    expect(testUser.identificacion, 'testUser.identificacion debe existir').to.exist;
    
    cy.log('Credenciales de testUser configuradas');
    cy.log(`Email: ${testUser.email}`);
  });
  
  it('Debe tener credenciales de adminUser configuradas', () => {
    const adminUser = Cypress.env('adminUser');
    
    expect(adminUser, 'adminUser debe existir').to.exist;
    expect(adminUser.email, 'adminUser.email debe existir').to.exist;
    expect(adminUser.password, 'adminUser.password debe existir').to.exist;
    
    cy.log('Credenciales de adminUser configuradas');
    cy.log(`Email: ${adminUser.email}`);
  });
  
  it('Debe poder conectarse al backend de Render', () => {
    const apiUrl = Cypress.env('apiUrl');
    const baseUrl = apiUrl.replace('/api', '');
    
    cy.log('Intentando conectar al backend...');
    cy.log('NOTA: Primera conexion puede tardar hasta 60 segundos (cold start)');
    
    cy.request({
      method: 'GET',
      url: baseUrl,
      timeout: 60000,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Backend debe responder').to.be.oneOf([200, 404]);
      cy.log(`Backend respondio con status: ${response.status}`);
      cy.log(`Tiempo de respuesta: ${response.duration}ms`);
    });
  });
  
  it('Debe poder conectarse al frontend de Vercel', () => {
    const frontendUrl = Cypress.env('frontendUrl');
    
    cy.log('Intentando conectar al frontend...');
    
    cy.request({
      method: 'GET',
      url: frontendUrl,
      timeout: 30000,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Frontend debe responder').to.eq(200);
      cy.log(`Frontend respondio con status: ${response.status}`);
      cy.log(`Tiempo de respuesta: ${response.duration}ms`);
    });
  });
  
  it('Debe verificar que los comandos personalizados estan cargados', () => {
    // Verificar que los comandos existen
    expect(cy.wakeUpBackend, 'Comando wakeUpBackend debe existir').to.exist;
    expect(cy.login, 'Comando login debe existir').to.exist;
    expect(cy.apiRequest, 'Comando apiRequest debe existir').to.exist;
    expect(cy.registerUser, 'Comando registerUser debe existir').to.exist;
    expect(cy.generateTestUser, 'Comando generateTestUser debe existir').to.exist;
    
    cy.log('Todos los comandos personalizados estan cargados');
  });
  
  it('Debe poder despertar el backend con comando personalizado', () => {
    cy.wakeUpBackend().then(() => {
      cy.log('Backend despertado exitosamente');
    });
  });
  
  it('Debe verificar la estructura del API', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Verificando endpoints del API...');
    
    // Intentar acceder a un endpoint sin autenticacion
    cy.request({
      method: 'GET',
      url: `${apiUrl}/users`,
      timeout: 30000,
      failOnStatusCode: false
    }).then((response) => {
      // Debe retornar 401 porque no hay token
      expect(response.status, 'Debe requerir autenticacion').to.eq(401);
      cy.log('API requiere autenticacion correctamente');
    });
  });
});
