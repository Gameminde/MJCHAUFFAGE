#!/usr/bin/env node

/**
 * Script de test automatique des endpoints - MJ Chauffage
 * À exécuter avec le serveur en cours d'exécution
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

class EndpointTester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async testEndpoint(name, url, expectedStatus = 200, method = 'GET', data = null) {
    try {
      console.log(`🔍 Test: ${name}`);
      
      const config = {
        method,
        url: `${BASE_URL}${url}`,
        timeout: 5000,
        validateStatus: () => true // Accept all status codes
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axios(config);
      
      const success = response.status === expectedStatus;
      
      if (success) {
        console.log(`✅ ${name} - Status: ${response.status}`);
        this.passed++;
      } else {
        console.log(`❌ ${name} - Expected: ${expectedStatus}, Got: ${response.status}`);
        this.failed++;
      }
      
      this.results.push({
        name,
        url,
        expected: expectedStatus,
        actual: response.status,
        success,
        data: response.data
      });
      
      return response;
      
    } catch (error) {
      console.log(`❌ ${name} - Error: ${error.message}`);
      this.failed++;
      this.results.push({
        name,
        url,
        expected: expectedStatus,
        actual: 'ERROR',
        success: false,
        error: error.message
      });
    }
  }

  async runAllTests() {
    console.log('🚀 TESTS DES ENDPOINTS - MJ CHAUFFAGE');
    console.log('=' .repeat(50));
    
    // Tests des endpoints publics
    console.log('\n📊 ENDPOINTS PUBLICS');
    await this.testEndpoint('Health Check', '/health', 200);
    await this.testEndpoint('API Version', '/api/version', 200);
    await this.testEndpoint('Catalogue Produits', '/api/products', 200);
    await this.testEndpoint('Catégories', '/api/categories', 200);
    await this.testEndpoint('Fabricants', '/api/manufacturers', 200);
    
    // Tests des endpoints protégés (doivent retourner 401)
    console.log('\n🛡️  ENDPOINTS PROTÉGÉS (doivent retourner 401)');
    await this.testEndpoint('Dashboard Admin', '/api/admin/dashboard/stats', 401);
    await this.testEndpoint('Commandes Admin', '/api/admin/orders', 401);
    await this.testEndpoint('Clients Admin', '/api/admin/customers', 401);
    await this.testEndpoint('Profil Utilisateur', '/api/auth/profile', 401);
    
    // Tests des endpoints inexistants (doivent retourner 404)
    console.log('\n🔍 ENDPOINTS INEXISTANTS (doivent retourner 404)');
    await this.testEndpoint('Route Inexistante', '/api/nonexistent', 404);
    
    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 RÉSUMÉ DES TESTS');
    console.log('='.repeat(50));
    
    console.log(`✅ Tests réussis: ${this.passed}`);
    console.log(`❌ Tests échoués: ${this.failed}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    const successRate = ((this.passed / this.results.length) * 100).toFixed(1);
    console.log(`📈 Taux de réussite: ${successRate}%`);
    
    if (this.failed > 0) {
      console.log('\n❌ ÉCHECS DÉTAILLÉS:');
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   - ${result.name}: Expected ${result.expected}, Got ${result.actual}`);
        });
    }
    
    console.log('\n🎯 RECOMMANDATIONS:');
    if (successRate >= 90) {
      console.log('✅ Excellent ! Les endpoints fonctionnent correctement.');
    } else if (successRate >= 70) {
      console.log('⚠️  Bon mais des améliorations sont possibles.');
    } else {
      console.log('❌ Problèmes détectés. Vérification nécessaire.');
    }
    
    console.log('\n📋 PROCHAINES ÉTAPES:');
    console.log('1. Vérifier les endpoints échoués');
    console.log('2. Tester l\'authentification');
    console.log('3. Valider la sécurité');
    console.log('4. Tests de charge basiques');
  }
}

// Exécution du script
if (require.main === module) {
  const tester = new EndpointTester();
  
  console.log('🚀 Démarrage des tests d\'endpoints...\n');
  
  tester.runAllTests()
    .then(() => {
      console.log('\n✨ Tests d\'endpoints terminés !');
      process.exit(tester.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('\n💥 Erreur fatale:', error);
      process.exit(1);
    });
}
