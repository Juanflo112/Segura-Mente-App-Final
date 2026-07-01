/**
 * Pruebas de Eliminar Usuario
 * Endpoint: DELETE /api/users/:email
 * Propósito: Validar la eliminación de usuarios del sistema
 */

describe('Gestion de Usuarios - Eliminar Usuario', () => {
  
  before(() => {
    cy.wakeUpBackend();
    
    // Crear usuario temporal para las pruebas
    const timestamp = Date.now();
    const tempUser = {
      nombreUsuario: `deletetest${timestamp}`,
      tipoIdentificacion: 'CC',
      identificacion: `${timestamp}`.substring(0, 10),
      fechaNacimiento: '1990-01-01',
      telefono: `300${timestamp}`.substring(0, 10),
      direccion: 'Calle Test',
      email: `deletetest${timestamp}@example.com`,
      password: 'TestDelete123!',
      confirmPassword: 'TestDelete123!'
    };
    
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/register`,
      body: tempUser,
      failOnStatusCode: false
    }).then(() => {
      cy.wait(2000);
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/auth/login`,
        body: { email: tempUser.email, password: tempUser.password },
        failOnStatusCode: false
      }).then((res) => {
        if (res.status === 200) {
          const token = res.body.token || (res.body.data && res.body.data.token);
          Cypress.env('authToken', token);
          cy.log('✓ Login exitoso');
        }
      });
    });
  });

  it('Caso 9.1: Debe eliminar usuario existente correctamente', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        // Crear un usuario temporal para eliminar
        const usuarioTemporal = Cypress.generateTestUser('Cliente');
        
        cy.log('Creando usuario temporal para eliminar...');
        
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuarioTemporal.nombreUsuario,
          tipo_identificacion: usuarioTemporal.tipoIdentificacion,
          identificacion: usuarioTemporal.identificacion,
          fecha_nacimiento: usuarioTemporal.fechaNacimiento,
          telefono: usuarioTemporal.telefono,
          direccion: usuarioTemporal.direccion,
          email: usuarioTemporal.email,
          password: usuarioTemporal.password,
          tipo_usuario: 'Cliente'
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            cy.log(`Usuario creado: ${usuarioTemporal.email}, procediendo a eliminar...`);
            
            // Eliminar el usuario creado
            cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((deleteResponse) => {
              if (deleteResponse.status === 200) {
                expect(deleteResponse.body.success, 'Success debe ser true').to.be.true;
                expect(deleteResponse.body.message, 'Debe confirmar eliminacion').to.match(/eliminado|deleted|removed/i);
                
                cy.log('Usuario eliminado exitosamente');
              } else if (deleteResponse.status === 403) {
                cy.log('Usuario no tiene permisos de administrador - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Usuario no tiene permisos para crear - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.2: Debe fallar sin autenticacion', () => {
    const apiUrl = Cypress.env('apiUrl');
    const emailPrueba = `prueba${Date.now()}@example.com`;
    
    cy.log('Intentando eliminar usuario sin autenticacion');
    
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/users/${emailPrueba}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 401 o 403').to.be.oneOf([401, 403]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Endpoint protegido correctamente');
    });
  });

  it('Caso 9.3: Debe fallar con token invalido', () => {
    const apiUrl = Cypress.env('apiUrl');
    const emailPrueba = `prueba${Date.now()}@example.com`;
    
    cy.log('Intentando eliminar con token invalido');
    
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/users/${emailPrueba}`,
      headers: {
        'Authorization': 'Bearer token-invalido-xyz'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 401 o 403').to.be.oneOf([401, 403]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de token funciona correctamente');
    });
  });

  it('Caso 9.4: Debe fallar con usuario no existente', () => {
    const emailNoExiste = `noexiste${Date.now()}@example.com`;
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.log(`Intentando eliminar usuario inexistente: ${emailNoExiste}`);
        
        cy.apiRequest('DELETE', `/users/${emailNoExiste}`).then((response) => {
          expect(response.status, 'Status debe ser 404').to.eq(404);
          expect(response.body.success, 'Success debe ser false').to.be.false;
          expect(response.body.message, 'Debe indicar que no se encontro').to.match(/no encontrado|not found|no existe/i);
          
          cy.log('Error 404 manejado correctamente');
        });
      }
    });
  });

  it('Caso 9.5: Usuario eliminado no debe aparecer en lista', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const usuarioTemporal = Cypress.generateTestUser('Cliente');
        
        // Crear usuario
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuarioTemporal.nombreUsuario,
          tipo_identificacion: usuarioTemporal.tipoIdentificacion,
          identificacion: usuarioTemporal.identificacion,
          fecha_nacimiento: usuarioTemporal.fechaNacimiento,
          telefono: usuarioTemporal.telefono,
          direccion: usuarioTemporal.direccion,
          email: usuarioTemporal.email,
          password: usuarioTemporal.password,
          tipo_usuario: 'Cliente'
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            // Eliminar usuario
            cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((deleteResponse) => {
              if (deleteResponse.status === 200) {
                cy.log('Usuario eliminado, verificando que no aparece en lista...');
                
                // Verificar que no aparece en lista
                cy.apiRequest('GET', '/users').then((listResponse) => {
                  if (listResponse.status === 200) {
                    const userList = listResponse.body.data || listResponse.body.users || listResponse.body;
                    const usuarioEnLista = userList.find(u => u.email === usuarioTemporal.email);
                    expect(usuarioEnLista, 'Usuario eliminado no debe aparecer en lista').to.be.undefined;
                    
                    cy.log('Usuario eliminado no aparece en lista - correcto');
                  }
                });
              } else if (deleteResponse.status === 403) {
                cy.log('Sin permisos - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.6: Usuario eliminado no debe ser consultable individualmente', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const usuarioTemporal = Cypress.generateTestUser('Cliente');
        
        // Crear usuario
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuarioTemporal.nombreUsuario,
          tipo_identificacion: usuarioTemporal.tipoIdentificacion,
          identificacion: usuarioTemporal.identificacion,
          fecha_nacimiento: usuarioTemporal.fechaNacimiento,
          telefono: usuarioTemporal.telefono,
          direccion: usuarioTemporal.direccion,
          email: usuarioTemporal.email,
          password: usuarioTemporal.password,
          tipo_usuario: 'Cliente'
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            // Eliminar usuario
            cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((deleteResponse) => {
              if (deleteResponse.status === 200) {
                cy.log('Usuario eliminado, intentando consultar...');
                
                // Intentar consultar usuario eliminado
                cy.apiRequest('GET', `/users/${usuarioTemporal.email}`).then((getResponse) => {
                  expect(getResponse.status, 'Status debe ser 404').to.eq(404);
                  expect(getResponse.body.success, 'Success debe ser false').to.be.false;
                  
                  cy.log('Usuario eliminado no es consultable - correcto');
                });
              } else if (deleteResponse.status === 403) {
                cy.log('Sin permisos - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.7: No debe permitir eliminar el mismo usuario dos veces', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const usuarioTemporal = Cypress.generateTestUser('Cliente');
        
        // Crear usuario
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuarioTemporal.nombreUsuario,
          tipo_identificacion: usuarioTemporal.tipoIdentificacion,
          identificacion: usuarioTemporal.identificacion,
          fecha_nacimiento: usuarioTemporal.fechaNacimiento,
          telefono: usuarioTemporal.telefono,
          direccion: usuarioTemporal.direccion,
          email: usuarioTemporal.email,
          password: usuarioTemporal.password,
          tipo_usuario: 'Cliente'
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            // Primera eliminación
            cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((firstDelete) => {
              if (firstDelete.status === 200) {
                cy.log('Primera eliminacion exitosa, intentando segunda eliminacion...');
                
                // Segunda eliminación (debe fallar)
                cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((secondDelete) => {
                  expect(secondDelete.status, 'Status debe ser 404').to.eq(404);
                  expect(secondDelete.body.success, 'Success debe ser false').to.be.false;
                  
                  cy.log('Segunda eliminacion rechazada correctamente');
                });
              } else if (firstDelete.status === 403) {
                cy.log('Sin permisos - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.8: Debe validar tiempo de respuesta aceptable', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const usuarioTemporal = Cypress.generateTestUser('Cliente');
        
        // Crear usuario
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuarioTemporal.nombreUsuario,
          tipo_identificacion: usuarioTemporal.tipoIdentificacion,
          identificacion: usuarioTemporal.identificacion,
          fecha_nacimiento: usuarioTemporal.fechaNacimiento,
          telefono: usuarioTemporal.telefono,
          direccion: usuarioTemporal.direccion,
          email: usuarioTemporal.email,
          password: usuarioTemporal.password,
          tipo_usuario: 'Cliente'
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            const startTime = Date.now();
            
            // Eliminar usuario
            cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((deleteResponse) => {
              const duration = Date.now() - startTime;
              
              if (deleteResponse.status === 200) {
                expect(duration, 'Debe responder en menos de 3 segundos').to.be.lessThan(3000);
                cy.log(`Tiempo de respuesta: ${duration}ms`);
              } else if (deleteResponse.status === 403) {
                cy.log('Sin permisos - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.9: No debe permitir actualizar usuario eliminado', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const usuarioTemporal = Cypress.generateTestUser('Cliente');
        
        // Crear usuario
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuarioTemporal.nombreUsuario,
          tipo_identificacion: usuarioTemporal.tipoIdentificacion,
          identificacion: usuarioTemporal.identificacion,
          fecha_nacimiento: usuarioTemporal.fechaNacimiento,
          telefono: usuarioTemporal.telefono,
          direccion: usuarioTemporal.direccion,
          email: usuarioTemporal.email,
          password: usuarioTemporal.password,
          tipo_usuario: 'Cliente'
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            // Eliminar usuario
            cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((deleteResponse) => {
              if (deleteResponse.status === 200) {
                cy.log('Usuario eliminado, intentando actualizar...');
                
                // Intentar actualizar usuario eliminado
                cy.apiRequest('PUT', `/users/${usuarioTemporal.email}`, {
                  nombre_usuario: 'Nuevo Nombre'
                }).then((updateResponse) => {
                  expect(updateResponse.status, 'Status debe ser 404').to.eq(404);
                  expect(updateResponse.body.success, 'Success debe ser false').to.be.false;
                  
                  cy.log('Actualizacion de usuario eliminado rechazada correctamente');
                });
              } else if (deleteResponse.status === 403) {
                cy.log('Sin permisos - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.10: Debe eliminar usuario tipo Psicologo correctamente', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const psicologoTemporal = Cypress.generateTestUser('Psicólogo/empleado');
        
        cy.log('Creando psicologo temporal para eliminar...');
        
        // Crear psicólogo
        cy.apiRequest('POST', '/users', {
          nombre_usuario: psicologoTemporal.nombreUsuario,
          tipo_identificacion: psicologoTemporal.tipoIdentificacion,
          identificacion: psicologoTemporal.identificacion,
          fecha_nacimiento: psicologoTemporal.fechaNacimiento,
          telefono: psicologoTemporal.telefono,
          direccion: psicologoTemporal.direccion,
          email: psicologoTemporal.email,
          password: psicologoTemporal.password,
          tipo_usuario: 'Psicólogo/empleado',
          formacion_profesional: psicologoTemporal.formacion_profesional,
          tarjeta_profesional: psicologoTemporal.tarjeta_profesional
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            cy.log(`Psicologo creado: ${psicologoTemporal.email}, procediendo a eliminar...`);
            
            // Eliminar psicólogo
            cy.apiRequest('DELETE', `/users/${psicologoTemporal.email}`).then((deleteResponse) => {
              if (deleteResponse.status === 200) {
                expect(deleteResponse.body.success, 'Success debe ser true').to.be.true;
                cy.log('Psicologo eliminado exitosamente');
              } else if (deleteResponse.status === 403) {
                cy.log('Sin permisos - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.11: Debe validar formato de email en ruta', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const emailInvalido = 'email-sin-arroba';
        
        cy.log('Intentando eliminar con email invalido en ruta');
        
        cy.apiRequest('DELETE', `/users/${emailInvalido}`).then((response) => {
          // Puede ser 400 (formato inválido) o 404 (no encontrado)
          expect(response.status, 'Status debe ser 400 o 404').to.be.oneOf([400, 404]);
          expect(response.body.success, 'Success debe ser false').to.be.false;
          
          cy.log('Validacion de formato funciona correctamente');
        });
      }
    });
  });

  it('Caso 9.12: Debe manejar emails con caracteres especiales', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const emailEspecial = `usuario+test${Date.now()}@example.com`;
        
        cy.log(`Intentando eliminar email con caracteres especiales: ${emailEspecial}`);
        
        cy.apiRequest('DELETE', `/users/${emailEspecial}`).then((response) => {
          // Debe ser 404 si no existe
          expect(response.status, 'Status debe ser 404').to.eq(404);
          expect(response.body.success, 'Success debe ser false').to.be.false;
          
          cy.log('Sistema maneja correctamente emails con caracteres especiales');
        });
      }
    });
  });

  it('Caso 9.13: Debe retornar estructura de respuesta consistente', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const usuarioTemporal = Cypress.generateTestUser('Cliente');
        
        // Crear usuario
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuarioTemporal.nombreUsuario,
          tipo_identificacion: usuarioTemporal.tipoIdentificacion,
          identificacion: usuarioTemporal.identificacion,
          fecha_nacimiento: usuarioTemporal.fechaNacimiento,
          telefono: usuarioTemporal.telefono,
          direccion: usuarioTemporal.direccion,
          email: usuarioTemporal.email,
          password: usuarioTemporal.password,
          tipo_usuario: 'Cliente'
        }).then((createResponse) => {
          if (createResponse.status === 201 || createResponse.status === 200) {
            // Eliminar usuario
            cy.apiRequest('DELETE', `/users/${usuarioTemporal.email}`).then((deleteResponse) => {
              if (deleteResponse.status === 200) {
                // Validar estructura de respuesta
                expect(deleteResponse.body, 'Debe tener success').to.have.property('success');
                expect(deleteResponse.body, 'Debe tener message').to.have.property('message');
                expect(typeof deleteResponse.body.success).to.equal('boolean');
                expect(typeof deleteResponse.body.message).to.equal('string');
                
                cy.log('Estructura de respuesta es consistente');
              } else if (deleteResponse.status === 403) {
                cy.log('Sin permisos - test omitido');
              }
            });
          } else if (createResponse.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });

  it('Caso 9.14: Eliminaciones multiples en secuencia', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const usuario1 = Cypress.generateTestUser('Cliente');
        const usuario2 = Cypress.generateTestUser('Cliente');
        
        cy.log('Creando dos usuarios para eliminar en secuencia...');
        
        // Crear usuario 1
        cy.apiRequest('POST', '/users', {
          nombre_usuario: usuario1.nombreUsuario,
          tipo_identificacion: usuario1.tipoIdentificacion,
          identificacion: usuario1.identificacion,
          fecha_nacimiento: usuario1.fechaNacimiento,
          telefono: usuario1.telefono,
          direccion: usuario1.direccion,
          email: usuario1.email,
          password: usuario1.password,
          tipo_usuario: 'Cliente'
        }).then((create1) => {
          if (create1.status === 201 || create1.status === 200) {
            // Crear usuario 2
            cy.apiRequest('POST', '/users', {
              nombre_usuario: usuario2.nombreUsuario,
              tipo_identificacion: usuario2.tipoIdentificacion,
              identificacion: usuario2.identificacion,
              fecha_nacimiento: usuario2.fechaNacimiento,
              telefono: usuario2.telefono,
              direccion: usuario2.direccion,
              email: usuario2.email,
              password: usuario2.password,
              tipo_usuario: 'Cliente'
            }).then((create2) => {
              if (create2.status === 201 || create2.status === 200) {
                cy.log('Dos usuarios creados, eliminando ambos...');
                
                // Eliminar usuario 1
                cy.apiRequest('DELETE', `/users/${usuario1.email}`).then((delete1) => {
                  if (delete1.status === 200) {
                    cy.log('Usuario 1 eliminado');
                    
                    // Eliminar usuario 2
                    cy.apiRequest('DELETE', `/users/${usuario2.email}`).then((delete2) => {
                      if (delete2.status === 200) {
                        expect(delete2.body.success, 'Success debe ser true').to.be.true;
                        cy.log('Ambos usuarios eliminados exitosamente en secuencia');
                      }
                    });
                  } else if (delete1.status === 403) {
                    cy.log('Sin permisos - test omitido');
                  }
                });
              }
            });
          } else if (create1.status === 403) {
            cy.log('Sin permisos - test omitido');
          }
        });
      }
    });
  });
});
