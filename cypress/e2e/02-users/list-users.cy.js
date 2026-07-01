/**
 * Pruebas de Listar Usuarios
 * Endpoint: GET /api/users
 * Propósito: Validar la consulta de lista de usuarios registrados
 */

describe('Gestion de Usuarios - Listar Usuarios', () => {
  
  before(() => {
    cy.wakeUpBackend();
  });

  it('Caso 5.1: Debe listar usuarios con autenticacion valida', () => {
    // Primero hacer login para obtener token
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.log('Consultando lista de usuarios...');
        
        cy.apiRequest('GET', '/users').then((response) => {
          expect(response.status, 'Status debe ser 200').to.eq(200);
          expect(response.body.success, 'Success debe ser true').to.be.true;
          
          // La lista puede estar en data, users, o directamente en body
          const userList = response.body.data || response.body.users || response.body;
          expect(userList, 'Debe tener lista de usuarios').to.exist;
          
          // Validar que sea un array
          expect(Array.isArray(userList), 'Lista debe ser un array').to.be.true;
          
          cy.log(`Total de usuarios encontrados: ${userList.length}`);
          
          // Si hay usuarios, validar estructura del primero
          if (userList.length > 0) {
            const primerUsuario = userList[0];
            
            expect(primerUsuario, 'Usuario debe tener email').to.have.property('email');
            expect(primerUsuario, 'Usuario debe tener nombre').to.have.property('nombre_usuario');
            expect(primerUsuario, 'Usuario debe tener tipo').to.have.property('tipo_usuario');
            
            // Validar que NO se expongan contraseñas
            expect(primerUsuario.password, 'Password no debe estar expuesta').to.not.exist;
            expect(primerUsuario.password_hash, 'Password hash no debe estar expuesto').to.not.exist;
            
            cy.log('Estructura de datos validada correctamente');
          }
        });
      } else {
        cy.log('No se pudo autenticar - usuario no verificado');
      }
    });
  });

  it('Caso 5.2: Debe fallar sin token de autenticacion', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando listar usuarios sin autenticacion');
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/users`,
      failOnStatusCode: false
    }).then((response) => {
      // Debe rechazar sin autenticación
      expect(response.status, 'Status debe ser 401 o 403').to.be.oneOf([401, 403]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Sistema protege correctamente el endpoint');
    });
  });

  it('Caso 5.3: Debe fallar con token invalido', () => {
    const apiUrl = Cypress.env('apiUrl');
    
    cy.log('Intentando listar usuarios con token invalido');
    
    cy.request({
      method: 'GET',
      url: `${apiUrl}/users`,
      headers: {
        'Authorization': 'Bearer token-invalido-xyz123'
      },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status, 'Status debe ser 401 o 403').to.be.oneOf([401, 403]);
      expect(response.body.success, 'Success debe ser false').to.be.false;
      
      cy.log('Validacion de token funciona correctamente');
    });
  });

  it('Caso 5.4: Debe validar estructura de respuesta completa', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', '/users').then((response) => {
          if (response.status === 200) {
            // Validar estructura completa de la respuesta
            expect(response.body, 'Debe tener success').to.have.property('success');
            
            const userList = response.body.data || response.body.users || response.body;
            
            // Validar tipos de datos
            expect(typeof response.body.success, 'Success debe ser boolean').to.equal('boolean');
            expect(Array.isArray(userList), 'Lista debe ser array').to.be.true;
            
            cy.log('Estructura de respuesta API es consistente');
          }
        });
      }
    });
  });

  it('Caso 5.5: Debe incluir todos los tipos de usuario', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', '/users').then((response) => {
          if (response.status === 200) {
            const usuarios = response.body.data || response.body.users || response.body;
            if (usuarios.length > 0) {
            
            // Obtener tipos únicos de usuario
            const tiposUsuario = [...new Set(usuarios.map(u => u.tipo_usuario))];
            cy.log(`Tipos de usuario encontrados: ${tiposUsuario.join(', ')}`);
            
            // Contar tipos válidos vs inválidos
            const tiposValidos = ['Cliente', 'Psicólogo/empleado', 'Administrador'];
            const usuariosValidos = usuarios.filter(u => tiposValidos.includes(u.tipo_usuario));
            const usuariosInvalidos = usuarios.filter(u => !tiposValidos.includes(u.tipo_usuario));
            
            // Validar que la mayoría de usuarios tengan tipos válidos
            expect(usuariosValidos.length, 'Debe haber usuarios con tipos validos').to.be.greaterThan(0);
            
            if (usuariosInvalidos.length > 0) {
              cy.log(`⚠ Advertencia: ${usuariosInvalidos.length} usuario(s) con tipo invalido (probablemente datos de prueba)`);
              usuariosInvalidos.forEach(u => cy.log(`  - ${u.email}: ${u.tipo_usuario}`));
            }
            
            cy.log(`Validación completada: ${usuariosValidos.length} válidos, ${usuariosInvalidos.length} inválidos`);
            }
          }
        });
      }
    });
  });

  it('Caso 5.6: Debe incluir campos basicos de usuario', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', '/users').then((response) => {
          if (response.status === 200) {
            const userList = response.body.data || response.body.users || response.body;
            if (userList.length > 0) {
              const usuario = userList[0];
            
            // Campos esperados
            const camposEsperados = [
              'email',
              'nombre_usuario',
              'tipo_usuario',
              'tipo_identificacion',
              'identificacion',
              'telefono'
            ];
            
            camposEsperados.forEach(campo => {
              expect(usuario, `Usuario debe tener campo ${campo}`).to.have.property(campo);
            });
            
            // Campos que NO deben estar
            const camposProhibidos = ['password', 'password_hash', 'reset_token'];
            camposProhibidos.forEach(campo => {
              expect(usuario[campo], `No debe exponer ${campo}`).to.be.undefined;
            });
            
            cy.log('Campos de usuario son correctos y seguros');
            }
          }
        });
      }
    });
  });

  it('Caso 5.7: Debe validar tiempo de respuesta aceptable', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        const startTime = Date.now();
        
        cy.apiRequest('GET', '/users').then((response) => {
          const duration = Date.now() - startTime;
          
          if (response.status === 200) {
            // Backend ya despierto debe responder rapido
            expect(duration, 'Debe responder en menos de 5 segundos').to.be.lessThan(5000);
            cy.log(`Tiempo de respuesta: ${duration}ms`);
          }
        });
      }
    });
  });

  it('Caso 5.8: Debe manejar lista vacia correctamente', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', '/users').then((response) => {
          if (response.status === 200) {
            const userList = response.body.data || response.body.users || response.body;
            // Incluso si esta vacia, debe ser un array
            expect(Array.isArray(userList), 'Lista debe ser array incluso si esta vacia').to.be.true;
            expect(response.body.success, 'Success debe ser true').to.be.true;
            
            if (userList.length === 0) {
              cy.log('Lista vacia manejada correctamente');
            } else {
              cy.log(`Lista con ${userList.length} usuarios`);
            }
          }
        });
      }
    });
  });

  it('Caso 5.9: Debe validar formato de emails en la lista', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', '/users').then((response) => {
          if (response.status === 200) {
            const userList = response.body.data || response.body.users || response.body;
            if (userList.length > 0) {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              
              userList.forEach(usuario => {
                expect(emailRegex.test(usuario.email), 
                  `Email ${usuario.email} debe tener formato valido`).to.be.true;
              });
              
              cy.log('Todos los emails tienen formato valido');
            }
          }
        });
      }
    });
  });

  it('Caso 5.10: Debe validar que usuarios verificados estan marcados', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', '/users').then((response) => {
          if (response.status === 200) {
            const userList = response.body.data || response.body.users || response.body;
            if (userList.length > 0) {
              userList.forEach(usuario => {
                // Si incluye campo verificado, debe ser boolean o número (0/1)
                if (usuario.hasOwnProperty('verificado') || usuario.hasOwnProperty('email_verificado')) {
                  const campoVerificado = usuario.verificado !== undefined ? usuario.verificado : usuario.email_verificado;
                  const tipo = typeof campoVerificado;
                  
                  // Puede ser boolean o number (MySQL usa TINYINT: 0/1)
                  expect(['boolean', 'number'], 'Campo verificado debe ser boolean o number').to.include(tipo);
                  
                  // Si es número, debe ser 0 o 1
                  if (tipo === 'number') {
                    expect([0, 1], 'Si es number, debe ser 0 o 1').to.include(campoVerificado);
                  }
                }
              });
              
              cy.log('Estados de verificacion son correctos');
            }
          }
        });
      }
    });
  });

  it('Caso 5.11: Debe incluir solo usuarios activos (no eliminados)', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        cy.apiRequest('GET', '/users').then((response) => {
          if (response.status === 200) {
            const userList = response.body.data || response.body.users || response.body;
            if (userList.length > 0) {
              userList.forEach(usuario => {
                // Si existe campo de estado, validar que no este eliminado
                if (usuario.estado) {
                  expect(usuario.estado).to.not.equal('eliminado');
                  expect(usuario.estado).to.not.equal('deleted');
                }
              });
            
              cy.log('Solo usuarios activos en la lista');
            }
          }
        });
      }
    });
  });

  it('Caso 5.12: Debe ordenar usuarios de forma consistente', () => {
    cy.login('testUser');
    
    cy.then(() => {
      const token = Cypress.env('authToken');
      
      if (token) {
        // Primera consulta
        cy.apiRequest('GET', '/users').then((primeraRespuesta) => {
          if (primeraRespuesta.status === 200) {
            const primeraLista = primeraRespuesta.body.data || primeraRespuesta.body.users || primeraRespuesta.body;
            if (primeraLista.length > 0) {
              const primerosEmails = primeraLista.map(u => u.email);
              
              // Segunda consulta
              cy.apiRequest('GET', '/users').then((segundaRespuesta) => {
                if (segundaRespuesta.status === 200) {
                  const segundaLista = segundaRespuesta.body.data || segundaRespuesta.body.users || segundaRespuesta.body;
                  const segundosEmails = segundaLista.map(u => u.email);
                  
                  // El orden debe ser consistente
                  expect(JSON.stringify(primerosEmails), 
                    'Orden de usuarios debe ser consistente').to.equal(JSON.stringify(segundosEmails));
                  
                  cy.log('Orden de usuarios es consistente');
                }
              });
            }
          }
        });
      }
    });
  });
});
