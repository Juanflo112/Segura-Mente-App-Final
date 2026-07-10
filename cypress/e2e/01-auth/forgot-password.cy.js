/**
 * Pruebas de Recuperacion de Contrasena
 * Endpoints: POST /api/auth/forgot-password, POST /api/auth/reset-password
 *
 * ESTADO: OMITIDAS - Funcionalidad no operativa
 * El envio de correos electronicos (SMTP) no esta configurado en produccion.
 * Los endpoints existen en el codigo pero no envian emails.
 * Estas pruebas se mantienen para documentar los requisitos futuros.
 */

describe.skip('Autenticacion - Recuperacion de Contrasena [OMITIDO - Email no configurado]', () => {

  it('CP-OMITIDO: forgot-password - funcionalidad pendiente de implementacion', () => {
    cy.log('Este modulo requiere configuracion SMTP funcional');
    cy.log('El endpoint existe pero el envio de email no opera en produccion');
  });

});

