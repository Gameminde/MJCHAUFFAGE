#!/usr/bin/env node

/**
 * Script de test de sécurité pour valider les améliorations
 * À exécuter après l'implémentation des corrections
 */

const axios = require('axios');
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

class SecurityTester {
  constructor(baseUrl = 'http://localhost:3001') {
    this.baseUrl = baseUrl;
    this.testResults = [];
  }

  async runAllTests() {
    log('🔒 TESTS DE SÉCURITÉ - MJ CHAUFFAGE', 'blue');
    log('=' .repeat(50), 'blue');

    await this.testServerHealth();
    await this.testRateLimiting();
    await this.testSecurityHeaders();
    await this.testAuthenticationSecurity();
    await this.testInputValidation();
    await this.testUnauthorizedAccess();

    this.printSummary();
  }

  async testServerHealth() {
    log('\n📊 Test de santé du serveur...', 'yellow');
    
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      
      if (response.status === 200 && response.data.status === 'OK') {
        log('✅ Serveur opérationnel', 'green');
        this.testResults.push({ test: 'Server Health', status: 'PASS' });
      } else {
        log('❌ Serveur non opérationnel', 'red');
        this.testResults.push({ test: 'Server Health', status: 'FAIL' });
      }
    } catch (error) {
      log(`❌ Erreur de connexion: ${error.message}`, 'red');
      this.testResults.push({ test: 'Server Health', status: 'FAIL', error: error.message });
    }
  }

  async testRateLimiting() {
    log('\n🚦 Test du rate limiting...', 'yellow');
    
    try {
      const requests = [];
      
      // Envoyer 10 requêtes rapidement
      for (let i = 0; i < 10; i++) {
        requests.push(
          axios.get(`${this.baseUrl}/api/products`).catch(err => err.response)
        );
      }
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.some(res => res && res.status === 429);
      
      if (rateLimited) {
        log('✅ Rate limiting fonctionnel', 'green');
        this.testResults.push({ test: 'Rate Limiting', status: 'PASS' });
      } else {
        log('⚠️  Rate limiting non détecté (peut être normal)', 'yellow');
        this.testResults.push({ test: 'Rate Limiting', status: 'WARNING' });
      }
    } catch (error) {
      log(`❌ Erreur test rate limiting: ${error.message}`, 'red');
      this.testResults.push({ test: 'Rate Limiting', status: 'FAIL', error: error.message });
    }
  }

  async testSecurityHeaders() {
    log('\n🛡️  Test des headers de sécurité...', 'yellow');
    
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      const headers = response.headers;
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];
      
      let headerCount = 0;
      securityHeaders.forEach(header => {
        if (headers[header]) {
          log(`  ✅ ${header}: ${headers[header]}`, 'green');
          headerCount++;
        } else {
          log(`  ❌ ${header}: manquant`, 'red');
        }
      });
      
      if (headerCount >= 3) {
        log('✅ Headers de sécurité présents', 'green');
        this.testResults.push({ test: 'Security Headers', status: 'PASS' });
      } else {
        log('❌ Headers de sécurité insuffisants', 'red');
        this.testResults.push({ test: 'Security Headers', status: 'FAIL' });
      }
    } catch (error) {
      log(`❌ Erreur test headers: ${error.message}`, 'red');
      this.testResults.push({ test: 'Security Headers', status: 'FAIL', error: error.message });
    }
  }

  async testAuthenticationSecurity() {
    log('\n🔐 Test de sécurité d\'authentification...', 'yellow');
    
    try {
      // Test 1: Accès sans token
      try {
        await axios.get(`${this.baseUrl}/api/admin/dashboard/stats`);
        log('❌ Accès admin sans authentification possible', 'red');
        this.testResults.push({ test: 'Auth Protection', status: 'FAIL' });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          log('✅ Accès admin protégé', 'green');
          this.testResults.push({ test: 'Auth Protection', status: 'PASS' });
        } else {
          throw error;
        }
      }

      // Test 2: Token invalide
      try {
        await axios.get(`${this.baseUrl}/api/admin/dashboard/stats`, {
          headers: { 'Authorization': 'Bearer invalid-token' }
        });
        log('❌ Token invalide accepté', 'red');
        this.testResults.push({ test: 'Invalid Token', status: 'FAIL' });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          log('✅ Token invalide rejeté', 'green');
          this.testResults.push({ test: 'Invalid Token', status: 'PASS' });
        } else {
          throw error;
        }
      }

      // Test 3: Tentative de connexion avec credentials invalides
      try {
        await axios.post(`${this.baseUrl}/api/auth/login`, {
          email: 'invalid@test.com',
          password: 'wrongpassword'
        });
        log('❌ Credentials invalides acceptés', 'red');
        this.testResults.push({ test: 'Invalid Credentials', status: 'FAIL' });
      } catch (error) {
        if (error.response && error.response.status === 401) {
          log('✅ Credentials invalides rejetés', 'green');
          this.testResults.push({ test: 'Invalid Credentials', status: 'PASS' });
        } else {
          throw error;
        }
      }

    } catch (error) {
      log(`❌ Erreur test authentification: ${error.message}`, 'red');
      this.testResults.push({ test: 'Authentication Security', status: 'FAIL', error: error.message });
    }
  }

  async testInputValidation() {
    log('\n✅ Test de validation des entrées...', 'yellow');
    
    try {
      // Test avec données malformées
      const maliciousInputs = [
        { email: '<script>alert("xss")</script>', password: 'test' },
        { email: 'test@test.com', password: '' },
        { email: '', password: 'password' },
        { email: 'not-an-email', password: 'password' }
      ];

      let validationWorks = true;

      for (const input of maliciousInputs) {
        try {
          await axios.post(`${this.baseUrl}/api/auth/login`, input);
          validationWorks = false;
          log(`❌ Entrée malformée acceptée: ${JSON.stringify(input)}`, 'red');
        } catch (error) {
          if (error.response && error.response.status === 400) {
            log(`✅ Entrée malformée rejetée: ${input.email}`, 'green');
          }
        }
      }

      if (validationWorks) {
        this.testResults.push({ test: 'Input Validation', status: 'PASS' });
      } else {
        this.testResults.push({ test: 'Input Validation', status: 'FAIL' });
      }

    } catch (error) {
      log(`❌ Erreur test validation: ${error.message}`, 'red');
      this.testResults.push({ test: 'Input Validation', status: 'FAIL', error: error.message });
    }
  }

  async testUnauthorizedAccess() {
    log('\n🚫 Test d\'accès non autorisé...', 'yellow');
    
    const protectedRoutes = [
      '/api/admin/dashboard/stats',
      '/api/admin/orders',
      '/api/admin/customers',
      '/api/admin/technicians',
      '/api/admin/settings'
    ];

    let protectionWorks = true;

    for (const route of protectedRoutes) {
      try {
        await axios.get(`${this.baseUrl}${route}`);
        log(`❌ Route non protégée: ${route}`, 'red');
        protectionWorks = false;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          log(`✅ Route protégée: ${route}`, 'green');
        } else {
          log(`⚠️  Erreur inattendue sur ${route}: ${error.response?.status}`, 'yellow');
        }
      }
    }

    if (protectionWorks) {
      this.testResults.push({ test: 'Route Protection', status: 'PASS' });
    } else {
      this.testResults.push({ test: 'Route Protection', status: 'FAIL' });
    }
  }

  printSummary() {
    log('\n' + '='.repeat(50), 'blue');
    log('📊 RÉSUMÉ DES TESTS DE SÉCURITÉ', 'blue');
    log('='.repeat(50), 'blue');

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const warnings = this.testResults.filter(r => r.status === 'WARNING').length;
    const total = this.testResults.length;

    log(`\nRésultats: ${passed}/${total} tests réussis`, passed === total ? 'green' : 'yellow');
    
    if (failed > 0) {
      log(`❌ Échecs: ${failed}`, 'red');
    }
    
    if (warnings > 0) {
      log(`⚠️  Avertissements: ${warnings}`, 'yellow');
    }

    log('\nDétails:', 'blue');
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
      const color = result.status === 'PASS' ? 'green' : result.status === 'FAIL' ? 'red' : 'yellow';
      log(`${icon} ${result.test}: ${result.status}`, color);
      if (result.error) {
        log(`   Erreur: ${result.error}`, 'red');
      }
    });

    // Recommandations
    log('\n🎯 RECOMMANDATIONS:', 'blue');
    
    if (failed === 0 && warnings <= 1) {
      log('✅ Sécurité excellente ! Le site est prêt pour la production.', 'green');
    } else if (failed <= 2) {
      log('⚠️  Sécurité correcte mais des améliorations sont possibles.', 'yellow');
    } else {
      log('❌ Problèmes de sécurité détectés. Corrections nécessaires avant production.', 'red');
    }

    log('\n📋 Prochaines étapes:', 'blue');
    log('1. Corriger les tests échoués', 'blue');
    log('2. Configurer les variables d\'environnement de production', 'blue');
    log('3. Activer HTTPS en production', 'blue');
    log('4. Configurer un système de monitoring', 'blue');
  }
}

// Exécution du script
if (require.main === module) {
  const tester = new SecurityTester();
  
  console.log('🚀 Démarrage des tests de sécurité...\n');
  
  tester.runAllTests()
    .then(() => {
      console.log('\n✨ Tests de sécurité terminés !');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Erreur fatale:', error);
      process.exit(1);
    });
}
