const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // URL base del frontend en Vercel
    baseUrl: 'https://segura-mente-app-frontend.vercel.app',
    
    // Patrón de archivos de prueba
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    
    // Configuración para producción en la nube
    video: true,
    videoCompression: 32,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    trashAssetsBeforeRuns: true,
    
    // Timeouts ajustados para Render (cold start)
    defaultCommandTimeout: 15000,    // 15 segundos
    requestTimeout: 60000,           // 60 segundos (cold start)
    responseTimeout: 60000,          // 60 segundos
    pageLoadTimeout: 60000,          // 60 segundos
    
    // Configuración de viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Reintentos para manejar inestabilidad de red
    retries: {
      runMode: 2,      // 2 reintentos en modo headless
      openMode: 0      // 0 reintentos en modo interactivo
    },
    
    // Configuración del reporter
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
      charts: true,
      reportPageTitle: 'Reporte de Pruebas - Segura-Mente',
      embeddedScreenshots: true,
      inlineAssets: true
    },
    
    // Variables de entorno
    env: {
      // URLs de producción
      apiUrl: 'https://segura-mente-app-ga8-220501096-aa1-ev02.onrender.com/api',
      frontendUrl: 'https://segura-mente-app-frontend.vercel.app',
      
      // Configuración de Render
      renderColdStartTimeout: 60000,
      renderWarmTimeout: 5000,
      
      // Credenciales de prueba (usuarios ya existentes en Railway)
      testUser: {
        email: 'testuser@example.com',
        password: 'TestUser123!'
      },
      
      adminUser: {
        email: 'admin@example.com',
        password: 'AdminPass123!'
      }
    },
    
    setupNodeEvents(on, config) {
      // Plugin de reporter
      require('cypress-mochawesome-reporter/plugin')(on);
      
      // Eventos personalizados
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
      
      return config;
    },
  },
});