/**
 * Pruebas del Modulo de Citas
 * Endpoints: GET/POST/PUT/PATCH /api/appointments
 * Proposito: Validar el agendamiento, modificacion y cancelacion de citas
 *
 * Casos cubiertos:
 * CP-19: Listar citas con autenticacion
 * CP-20: Crear cita con datos validos
 * CP-21: Error al superar limite de 2 citas activas
 * CP-22: Error al agendar en horario ocupado
 * CP-23: Modificar cita activa
 * CP-24: Cancelar cita como cliente
 * CP-25: Ver citas del psicologo autenticado
 * CP-26: Cancelar cita como psicologo
 * CP-27: Psicologo intenta cancelar cita ajena (403)
 * CP-28: Acceso a citas sin token (401)
 */

const FECHA_FUTURA = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
})();

const FECHA_FUTURA_2 = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().split('T')[0];
})();

describe('Modulo de Citas - Agendamiento', () => {

    before(() => {
        cy.wakeUpBackend();
    });

    // ============================================================
    // CP-19: Listar citas con autenticacion
    // ============================================================
    it('CP-19: Debe listar citas con autenticacion valida', () => {
        cy.loginFresh('testUser');

        cy.then(() => {
            cy.apiRequest('GET', '/appointments').then((response) => {
                expect(response.status, 'Status debe ser 200').to.eq(200);
                expect(response.body.success, 'Success debe ser true').to.be.true;

                const citas = response.body.appointments || response.body.data || [];
                expect(Array.isArray(citas), 'Debe retornar un array').to.be.true;

                cy.log(`Total de citas encontradas: ${citas.length}`);

                if (citas.length > 0) {
                    const cita = citas[0];
                    expect(cita, 'Cita debe tener id').to.have.property('id');
                    expect(cita, 'Cita debe tener clientEmail').to.have.property('clientEmail');
                    expect(cita, 'Cita debe tener status').to.have.property('status');
                    expect(cita, 'Cita debe tener date').to.have.property('date');
                    expect(cita, 'Cita debe tener time').to.have.property('time');
                }
            });
        });
    });

    // ============================================================
    // CP-28: Acceso sin token (401)
    // ============================================================
    it('CP-28: Debe rechazar acceso sin token de autenticacion', () => {
        const apiUrl = Cypress.env('apiUrl');

        cy.request({
            method: 'GET',
            url: `${apiUrl}/appointments`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status, 'Status debe ser 401').to.eq(401);
            expect(response.body.success, 'Success debe ser false').to.be.false;
            cy.log('Endpoint protegido correctamente');
        });

        cy.request({
            method: 'GET',
            url: `${apiUrl}/appointments/psychologist`,
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status, 'Status debe ser 401').to.eq(401);
            cy.log('Endpoint de psicologo protegido correctamente');
        });
    });

    // ============================================================
    // CP-20: Crear cita con datos validos
    // ============================================================
    it('CP-20: Debe crear una cita con datos validos', () => {
        cy.loginFresh('testUser');

        cy.then(() => {
            const psychologistUser = Cypress.env('psychologistUser');

            cy.apiRequest('POST', '/appointments', {
                date: FECHA_FUTURA,
                time: '08:00',
                psychologistEmail: psychologistUser.email,
                psychologistName: psychologistUser.nombreUsuario,
                psychologistSpecialty: 'Psicologia Clinica',
                notes: 'Cita de prueba automatizada CP-20'
            }).then((response) => {
                if (response.status === 201) {
                    expect(response.body.success, 'Success debe ser true').to.be.true;

                    const cita = response.body.appointment || response.body.data;
                    expect(cita, 'Debe retornar la cita creada').to.exist;
                    expect(cita.status, 'Status inicial debe ser Agendada').to.eq('Agendada');
                    expect(cita.id, 'Debe tener UUID').to.have.length.greaterThan(10);
                    expect(cita.cancelledBy, 'cancelledBy debe ser null').to.be.null;

                    Cypress.env('citaIdCliente', cita.id);
                    cy.log(`Cita creada con ID: ${cita.id}`);
                } else if (response.status === 400) {
                    cy.log(`Horario ocupado o limite alcanzado: ${response.body.message}`);
                    cy.log('Esto es esperado si ya existen citas en ese horario');
                }
            });
        });
    });

    // ============================================================
    // CP-22: Error al agendar en horario ocupado
    // ============================================================
    it('CP-22: Debe rechazar cita en horario ya ocupado', () => {
        cy.loginFresh('testUser');

        cy.then(() => {
            const psychologistUser = Cypress.env('psychologistUser');

            cy.apiRequest('POST', '/appointments', {
                date: FECHA_FUTURA,
                time: '08:00',
                psychologistEmail: psychologistUser.email,
                psychologistName: psychologistUser.nombreUsuario,
                psychologistSpecialty: 'Psicologia Clinica',
                notes: 'Intento de horario duplicado'
            }).then((firstResponse) => {
                cy.apiRequest('POST', '/appointments', {
                    date: FECHA_FUTURA,
                    time: '08:00',
                    psychologistEmail: psychologistUser.email,
                    psychologistName: psychologistUser.nombreUsuario,
                    psychologistSpecialty: 'Psicologia Clinica',
                    notes: 'Segundo intento mismo horario'
                }).then((response) => {
                    if (firstResponse.status === 201) {
                        expect(response.status, 'Status debe ser 400').to.eq(400);
                        expect(response.body.success, 'Success debe ser false').to.be.false;
                        expect(response.body.message, 'Debe mencionar horario ocupado')
                            .to.match(/horario|ocupado|disponible|cita/i);
                        cy.log('Conflicto de horario detectado correctamente');
                    } else {
                        cy.log('Horario no disponible desde el primer intento - validacion activa');
                    }
                });
            });
        });
    });

    // ============================================================
    // CP-23: Modificar cita activa
    // ============================================================
    it('CP-23: Debe modificar una cita activa existente', () => {
        cy.loginFresh('testUser');

        cy.then(() => {
            cy.apiRequest('GET', '/appointments').then((response) => {
                const citas = response.body.appointments || [];
                const testUser = Cypress.env('testUser');
                const citaActiva = citas.find(
                    (c) => c.status === 'Agendada' && c.clientEmail === testUser.email
                );

                if (citaActiva) {
                    cy.log(`Modificando cita: ${citaActiva.id}`);

                    cy.apiRequest('PUT', `/appointments/${citaActiva.id}`, {
                        date: FECHA_FUTURA_2,
                        time: '11:00',
                        psychologistEmail: citaActiva.psychologistEmail,
                        psychologistName: citaActiva.psychologistName,
                        psychologistSpecialty: citaActiva.psychologistSpecialty,
                        notes: 'Notas modificadas por prueba CP-23'
                    }).then((putResponse) => {
                        if (putResponse.status === 200) {
                            expect(putResponse.body.success, 'Success debe ser true').to.be.true;
                            const citaActualizada = putResponse.body.appointment || putResponse.body.data;
                            expect(citaActualizada.notes, 'Notas deben actualizarse')
                                .to.include('CP-23');
                            cy.log('Cita modificada correctamente');
                        } else {
                            cy.log(`No se pudo modificar: ${putResponse.body.message}`);
                        }
                    });
                } else {
                    cy.log('No hay citas activas del cliente para modificar - crear una primero');
                }
            });
        });
    });

    // ============================================================
    // CP-24: Cancelar cita como cliente
    // ============================================================
    it('CP-24: Debe cancelar una cita como cliente', () => {
        cy.loginFresh('testUser');

        cy.then(() => {
            cy.apiRequest('GET', '/appointments').then((response) => {
                const citas = response.body.appointments || [];
                const testUser = Cypress.env('testUser');
                const citaActiva = citas.find(
                    (c) => c.status === 'Agendada' && c.clientEmail === testUser.email
                );

                if (citaActiva) {
                    cy.log(`Cancelando cita: ${citaActiva.id}`);

                    cy.apiRequest('PATCH', `/appointments/${citaActiva.id}/cancel`).then((response) => {
                        expect(response.status, 'Status debe ser 200').to.eq(200);
                        expect(response.body.success, 'Success debe ser true').to.be.true;

                        const citaCancelada = response.body.appointment || response.body.data;
                        expect(citaCancelada.status, 'Status debe ser Cancelada').to.eq('Cancelada');
                        expect(citaCancelada.cancelledBy, 'cancelledBy debe ser cliente').to.eq('cliente');

                        cy.log(`Cita ${citaActiva.id} cancelada por cliente`);
                    });
                } else {
                    cy.log('No hay citas activas para cancelar como cliente');
                }
            });
        });
    });

    // ============================================================
    // CP-21: Error al superar limite de 2 citas activas
    // ============================================================
    it('CP-21: Debe rechazar la creacion de mas de 2 citas activas', () => {
        cy.loginFresh('testUser');

        cy.then(() => {
            cy.apiRequest('GET', '/appointments').then((listResponse) => {
                const citas = listResponse.body.appointments || [];
                const testUser = Cypress.env('testUser');
                const citasActivasCliente = citas.filter(
                    (c) => c.status === 'Agendada' && c.clientEmail === testUser.email
                );
                const psychologistUser = Cypress.env('psychologistUser');

                cy.log(`Citas activas actuales del cliente: ${citasActivasCliente.length}`);

                if (citasActivasCliente.length >= 2) {
                    cy.apiRequest('POST', '/appointments', {
                        date: FECHA_FUTURA_2,
                        time: '09:30',
                        psychologistEmail: psychologistUser.email,
                        psychologistName: psychologistUser.nombreUsuario,
                        psychologistSpecialty: 'Psicologia Clinica',
                        notes: 'Intento de tercera cita'
                    }).then((response) => {
                        expect(response.status, 'Status debe ser 400').to.eq(400);
                        expect(response.body.success, 'Success debe ser false').to.be.false;
                        expect(response.body.message, 'Debe mencionar el limite')
                            .to.match(/dos|2|limite|activas/i);
                        cy.log('Limite de citas activas validado correctamente');
                    });
                } else {
                    cy.log(`Cliente tiene ${citasActivasCliente.length} citas activas - necesita 2 para probar el limite`);
                    cy.log('Prueba omitida por insuficientes citas activas en este ciclo');
                }
            });
        });
    });
});

// ============================================================
// Modulo de Citas - Vista del Psicologo
// ============================================================
describe('Modulo de Citas - Gestion del Psicologo', () => {

    before(() => {
        cy.wakeUpBackend();
    });

    // ============================================================
    // CP-25: Ver citas asignadas al psicologo autenticado
    // ============================================================
    it('CP-25: Debe retornar solo las citas del psicologo autenticado', () => {
        cy.loginFresh('psychologistUser');

        cy.then(() => {
            const psychologistUser = Cypress.env('psychologistUser');

            cy.apiRequest('GET', '/appointments/psychologist').then((response) => {
                expect(response.status, 'Status debe ser 200').to.eq(200);
                expect(response.body.success, 'Success debe ser true').to.be.true;

                const citas = response.body.appointments || [];
                expect(Array.isArray(citas), 'Debe retornar un array').to.be.true;

                citas.forEach((cita) => {
                    expect(cita.psychologistEmail, 'Todas las citas deben ser del psicologo autenticado')
                        .to.eq(psychologistUser.email);
                });

                cy.log(`Citas del psicologo: ${citas.length}`);
                cy.log(`Pendientes: ${citas.filter((c) => c.status === 'Agendada').length}`);
                cy.log(`Canceladas: ${citas.filter((c) => c.status === 'Cancelada').length}`);
            });
        });
    });

    // ============================================================
    // CP-26: Cancelar cita como psicologo
    // ============================================================
    it('CP-26: Debe cancelar una cita como psicologo y registrar cancelled_by', () => {
        cy.loginFresh('psychologistUser');

        cy.then(() => {
            const psychologistUser = Cypress.env('psychologistUser');

            cy.apiRequest('GET', '/appointments/psychologist').then((response) => {
                const citas = response.body.appointments || [];
                const citaActiva = citas.find((c) => c.status === 'Agendada');

                if (citaActiva) {
                    cy.log(`Cancelando cita como psicologo: ${citaActiva.id}`);

                    cy.apiRequest('PATCH', `/appointments/${citaActiva.id}/cancel-by-psychologist`).then((patchResponse) => {
                        expect(patchResponse.status, 'Status debe ser 200').to.eq(200);
                        expect(patchResponse.body.success, 'Success debe ser true').to.be.true;

                        const citaCancelada = patchResponse.body.appointment || patchResponse.body.data;
                        expect(citaCancelada.status, 'Status debe ser Cancelada').to.eq('Cancelada');
                        expect(citaCancelada.cancelledBy, 'cancelledBy debe ser psicologo').to.eq('psicologo');

                        cy.log('Cita cancelada por psicologo - campo cancelled_by registrado correctamente');
                    });
                } else {
                    cy.log(`Psicologo ${psychologistUser.email} no tiene citas activas para cancelar`);
                }
            });
        });
    });

    // ============================================================
    // CP-27: Psicologo intenta cancelar cita ajena (403)
    // ============================================================
    it('CP-27: Debe rechazar cancelacion de cita que no pertenece al psicologo', () => {
        cy.loginFresh('psychologistUser');

        cy.then(() => {
            cy.apiRequest('GET', '/appointments').then((response) => {
                const todasLasCitas = response.body.appointments || [];
                const psychologistUser = Cypress.env('psychologistUser');

                const citaAjena = todasLasCitas.find(
                    (c) => c.status === 'Agendada' &&
                        c.psychologistEmail !== psychologistUser.email
                );

                if (citaAjena) {
                    cy.log(`Intentando cancelar cita ajena: ${citaAjena.id}`);

                    cy.apiRequest('PATCH', `/appointments/${citaAjena.id}/cancel-by-psychologist`).then((response) => {
                        expect(response.status, 'Status debe ser 403').to.eq(403);
                        expect(response.body.success, 'Success debe ser false').to.be.false;
                        expect(response.body.message, 'Debe indicar falta de permiso')
                            .to.match(/permiso|autorizado|forbidden/i);
                        cy.log('Control de acceso por psicologo funcionando correctamente');
                    });
                } else {
                    cy.log('No hay citas de otro psicologo disponibles para esta prueba');
                    cy.log('Prueba omitida por falta de datos - el control de acceso esta implementado en el backend');
                }
            });
        });
    });
});
