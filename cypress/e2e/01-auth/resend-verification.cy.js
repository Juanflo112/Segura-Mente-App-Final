/**
 * Pruebas de Reenvio de Verificacion
 * Endpoint: POST /api/auth/resend-verification
 *
 * ESTADO: OMITIDAS - Funcionalidad no operativa
 * El envio de correos electronicos (SMTP) no esta configurado en produccion.
 * El sistema auto-verifica los usuarios al registrarse como workaround.
 * Estas pruebas se mantienen para documentar los requisitos futuros.
 */

describe.skip('Autenticacion - Reenvio de Verificacion [OMITIDO - Email no configurado]', () => {

  it('CP-OMITIDO: resend-verification - funcionalidad pendiente de implementacion', () => {
    cy.log('Este modulo requiere configuracion SMTP funcional');
    cy.log('Los usuarios son auto-verificados al registrarse en la version actual');
  });

});

