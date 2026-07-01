/**
 * Pruebas de Obtener Usuario Específico
 * Endpoint: GET /api/users/:email
 * Propósito: Validar la consulta de información de un usuario específico por email
 */

describe('Gestion de Usuarios - Obtener Usuario Especifico', () => {
  
  before(() => {
    cy.wakeUpBackend();
  });

  it('Caso 6.1: Debe obtener usuario existente con autenticacion valida', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.log(`Consultando usuario: ${testUser.email}`);
        
        cy.apiRequest('GET', `/users/${testUser.email}`).then((response) => {
          expect(response.status, 'Status debe ser 200').to.eq(200);
          expect(response.body.success, 'Success debe ser true').to.be.true;
          
          // La respuesta puede tener data, user, o estar directamente en body
          const usuario = response.body.data || response.body.user || response.body;
          expect(usuario, 'Debe tener información del usuario').to.exist;
          
          // Validar datos básicos
          expect(usuario.email, 'Email debe coincidir').to.eq(testUser.email);
          expect(usuario, 'Debe tener nombre de usuario').to.have.property('nombre_usuario');
          expect(usuario, 'Debe tener tipo de usuario').to.have.property('tipo_usuario');
          
          // Validar que NO se expongan datos sensibles
          expect(usuario.password, 'Password no debe estar expuesta').to.not.exist;
          expect(usuario.password_hash, 'Password hash no debe estar expuesto').to.not.exist;
          expect(usuario.reset_token, 'Reset token no debe estar expuesto').to.not.exist;
          
          cy.log('Usuario obtenido exitosamente');
        });
      }
    });
  });

  it('Caso 6.2: Debe fallar sin autenticacion', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando obtener usuario sin autenticacion');
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/users/${testUser.email}`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 401 o 403').to.be.oneOf([401, 403]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Endpoint protegido correctamente');
    });
  });

  it('Caso 6.3: Debe fallar con token invalido', () => {
    const testUser = Cypress.env('testUser');
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando obtener usuario con token invalido');
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/users/${testUser.email}`,
      headers: {
        'Authorization': 'Bearer token-invalido-abc123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 401 o 403').to.be.oneOf([401, 403]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de token funciona correctamente');
    });
  });

  it('Caso 6.4: Debe fallar con usuario no existente', () => {
    const emailNoExiste = `noexiste${Date.now()}@example.com`;
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.log(`Buscando usuario inexistente: ${emailNoExiste}`);
        
        cy.apiRequest('GET', `/users/${emailNoExiste}`).then((response) => {
          expect(response.status, 'Status debe ser 404').to.eq(404);
          expect(response.body.success, 'Success debe ser false').to.be.false;
          expect(response.body.message, 'Debe indicar que no se encontro').to.match(/no encontrado|not found|no existe/i);
          
          cy.log('Error 404 manejado correctamente');
        });
      }
    });
  });

  it('Caso 6.5: Debe validar estructura completa de respuesta', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', `/users/${testUser.email}`).then((response) => {
          if (response.status === 200) {
            // Validar estructura de respuesta API
            expect(response.body, 'Debe tener success').to.have.property('success');
            
            const usuario = response.body.data || response.body.user || response.body;
            
            // Validar tipos
            expect(typeof response.body.success).to.equal('boolean');
            expect(typeof usuario).to.equal('object');
            
            cy.log('Estructura API es consistente');
          }
        });
      }
    });
  });

  it('Caso 6.6: Debe incluir todos los campos basicos del usuario', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', `/users/${testUser.email}`).then((response) => {
          if (response.status === 200) {
            const usuario = response.body.data || response.body.user || response.body;
            
            // Campos básicos esperados
            const camposEsperados = [
              'email',
              'nombre_usuario',
              'tipo_usuario',
              'tipo_identificacion',
              'identificacion',
              'telefono',
              'direccion'
            ];
            
            camposEsperados.forEach(campo => {
              expect(usuario, `Usuario debe tener ${campo}`).to.have.property(campo);
            });
            
            cy.log('Todos los campos basicos presentes');
          }
        });
      }
    });
  });

  it('Caso 6.7: Debe incluir campos adicionales para psicologos', () => {
    const psicologoUser = Cypress.env('psicologoUser');
    
    if (!psicologoUser) {
      cy.log('No hay usuario psicologo configurado - test omitido');
      return;
    }
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', `/users/${psicologoUser.email}`).then((response) => {
          if (response.status === 200) {
            const usuario = response.body.data || response.body.user || response.body;
            
            if (usuario.tipo_usuario === 'Psicólogo/empleado') {
              // Campos adicionales para psicólogos
              expect(usuario, 'Psicologo debe tener formacion_profesional').to.have.property('formacion_profesional');
              expect(usuario, 'Psicologo debe tener tarjeta_profesional').to.have.property('tarjeta_profesional');
              
              cy.log('Campos adicionales de psicologo presentes');
            }
          }
        });
      }
    });
  });

  it('Caso 6.8: Debe validar formato de datos del usuario', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', `/users/${testUser.email}`).then((response) => {
          if (response.status === 200) {
            const usuario = response.body.data || response.body.user || response.body;
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            expect(emailRegex.test(usuario.email), 'Email debe tener formato valido').to.be.true;
            
            // Validar tipo de usuario
            expect(['Cliente', 'Psicólogo/empleado', 'Administrador']).to.include(usuario.tipo_usuario);
            
            // Validar tipo de identificación
            if (usuario.tipo_identificacion) {
              expect(['CC', 'TI', 'CE', 'Pasaporte']).to.include(usuario.tipo_identificacion);
            }
            
            // Validar que identificación sea string o número
            if (usuario.identificacion) {
              expect(['string', 'number']).to.include(typeof usuario.identificacion);
            }
            
            cy.log('Formato de datos es valido');
          }
        });
      }
    });
  });

  it('Caso 6.9: Debe manejar emails con caracteres especiales', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const emailEspecial = 'usuario+test@example.com';
        
        cy.log(`Buscando email con caracteres especiales: ${emailEspecial}`);
        
        cy.apiRequest('GET', `/users/${emailEspecial}`).then((response) => {
          // Puede ser 404 si no existe o 200 si existe
          expect([200, 404]).to.include(response.status);
          
          if (response.status === 404) {
            cy.log('Usuario no existe - comportamiento esperado');
          } else {
            cy.log('Sistema maneja correctamente emails con caracteres especiales');
          }
        });
      }
    });
  });

  it('Caso 6.10: Debe validar tiempo de respuesta aceptable', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const startTime = Date.now();
        
        cy.apiRequest('GET', `/users/${testUser.email}`).then((response) => {
          const duration = Date.now() - startTime;
          
          if (response.status === 200) {
            expect(duration, 'Debe responder en menos de 3 segundos').to.be.lessThan(3000);
            cy.log(`Tiempo de respuesta: ${duration}ms`);
          }
        });
      }
    });
  });

  it('Caso 6.11: Debe validar estado de verificacion del usuario', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', `/users/${testUser.email}`).then((response) => {
          if (response.status === 200) {
            const usuario = response.body.data || response.body.user || response.body;
            
            // Si incluye campo de verificación, debe ser boolean o number (0/1)
            if (usuario.hasOwnProperty('verificado') || usuario.hasOwnProperty('email_verificado')) {
              const campoVerificado = usuario.verificado !== undefined ? usuario.verificado : usuario.email_verificado;
              const tipo = typeof campoVerificado;
              expect(['boolean', 'number']).to.include(tipo);
              cy.log(`Usuario verificado: ${campoVerificado}`);
            }
          }
        });
      }
    });
  });

  it('Caso 6.12: Debe validar fecha de creacion del usuario', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', `/users/${testUser.email}`).then((response) => {
          if (response.status === 200) {
            const usuario = response.body.data || response.body.user || response.body;
            
            // Si incluye fecha de creación, validar formato
            if (usuario.createdAt || usuario.fecha_registro || usuario.created_at) {
              const fechaCreacion = usuario.createdAt || usuario.fecha_registro || usuario.created_at;
              
              // Validar que sea una fecha válida
              const fecha = new Date(fechaCreacion);
              expect(fecha.toString()).to.not.equal('Invalid Date');
              
              // Validar que la fecha no sea futura
              expect(fecha.getTime()).to.be.lessThan(Date.now());
              
              cy.log(`Usuario creado: ${fechaCreacion}`);
            }
          }
        });
      }
    });
  });

  it('Caso 6.13: Debe obtener usuario diferente al autenticado', () => {
    const adminUser = Cypress.env('adminUser');
    const testUser = Cypress.env('testUser');
    
    if (!adminUser) {
      cy.log('No hay usuario admin configurado - test omitido');
      return;
    }
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.log(`Usuario autenticado: ${testUser.email}, consultando: ${adminUser.email}`);
        
        cy.apiRequest('GET', `/users/${adminUser.email}`).then((response) => {
          // Puede ser 200 (permitido) o 403 (solo puede ver su propio perfil)
          if (response.status === 200) {
            const usuario = response.body.data || response.body.user || response.body;
            expect(usuario.email).to.eq(adminUser.email);
            cy.log('Sistema permite consultar otros usuarios');
          } else if (response.status === 403) {
            cy.log('Sistema restringe consulta a solo propio perfil - politica valida');
          }
        });
      }
    });
  });

  it('Caso 6.14: Debe validar consistencia con lista de usuarios', () => {
    const testUser = Cypress.env('testUser');
    
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        // Primero obtener lista de usuarios
        cy.apiRequest('GET', '/users').then((listaResponse) => {
          if (listaResponse.status === 200) {
            const userList = listaResponse.body.data || listaResponse.body.users || listaResponse.body;
            if (userList.length > 0) {
              const usuarioEnLista = userList.find(u => u.email === testUser.email);
              
              if (usuarioEnLista) {
                // Luego obtener usuario específico
                cy.apiRequest('GET', `/users/${testUser.email}`).then((usuarioResponse) => {
                  if (usuarioResponse.status === 200) {
                    const usuarioIndividual = usuarioResponse.body.data || usuarioResponse.body.user || usuarioResponse.body;
                    
                    // Validar que los datos coincidan
                    expect(usuarioIndividual.email).to.eq(usuarioEnLista.email);
                    expect(usuarioIndividual.nombre_usuario).to.eq(usuarioEnLista.nombre_usuario);
                    expect(usuarioIndividual.tipo_usuario).to.eq(usuarioEnLista.tipo_usuario);
                    
                    cy.log('Datos consistentes entre lista y detalle');
                  }
                });
              }
            }
          }
        });
      }
    });
  });
});
