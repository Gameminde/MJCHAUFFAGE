#!/usr/bin/env node

/**
 * Script de validation des corrections critiques
 * Vérifie que les principales erreurs ont été corrigées
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 VALIDATION DES CORRECTIONS CRITIQUES\n');

// Couleurs pour la console
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

// Vérifications des fichiers
const checks = [
  {
    name: 'AdminController - Filtres de date',
    file: 'backend/src/controllers/adminController.ts',
    test: (content) => {
      return content.includes('if (dateFrom)') && 
             content.includes('filters.dateFrom = new Date(dateFrom as string)');
    }
  },
  {
    name: 'OrderController - Points-virgules',
    file: 'backend/src/controllers/orderController.ts',
    test: (content) => {
      return content.includes('return;') && 
             !content.includes('return\n');
    }
  },
  {
    name: 'AuthController - Type inutilisé supprimé',
    file: 'backend/src/controllers/authController.ts',
    test: (content) => {
      return !content.includes('type UserRoleType');
    }
  },
  {
    name: 'AdminService - Gestion des specialties',
    file: 'backend/src/services/adminService.ts',
    test: (content) => {
      return content.includes('specialties.join(\', \')') && 
             content.includes(': \'\'');
    }
  }
];

let passedChecks = 0;
let totalChecks = checks.length;

console.log('📋 Vérification des corrections appliquées:\n');

checks.forEach((check, index) => {
  const filePath = path.join(__dirname, check.file);
  
  try {
    if (!fs.existsSync(filePath)) {
      log(`${index + 1}. ${check.name}`, 'red');
      log(`   ❌ Fichier non trouvé: ${check.file}`, 'red');
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const passed = check.test(content);
    
    if (passed) {
      log(`${index + 1}. ${check.name}`, 'green');
      log(`   ✅ Correction validée`, 'green');
      passedChecks++;
    } else {
      log(`${index + 1}. ${check.name}`, 'red');
      log(`   ❌ Correction non détectée`, 'red');
    }
  } catch (error) {
    log(`${index + 1}. ${check.name}`, 'red');
    log(`   ❌ Erreur lors de la vérification: ${error.message}`, 'red');
  }
  
  console.log('');
});

// Vérification TypeScript
console.log('🔧 Vérification TypeScript:\n');

try {
  const backendPath = path.join(__dirname, 'backend');
  process.chdir(backendPath);
  
  log('Compilation TypeScript en cours...', 'blue');
  const output = execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
  
  if (output.trim() === '') {
    log('✅ Aucune erreur TypeScript détectée!', 'green');
  } else {
    log('⚠️  Erreurs TypeScript restantes:', 'yellow');
    console.log(output);
  }
} catch (error) {
  log('❌ Erreurs TypeScript détectées:', 'red');
  console.log(error.stdout || error.message);
}

// Résumé
console.log('\n📊 RÉSUMÉ DE LA VALIDATION:\n');

const successRate = Math.round((passedChecks / totalChecks) * 100);

log(`Corrections validées: ${passedChecks}/${totalChecks} (${successRate}%)`, 
    successRate === 100 ? 'green' : successRate >= 75 ? 'yellow' : 'red');

if (successRate === 100) {
  log('\n🎉 Toutes les corrections critiques ont été appliquées avec succès!', 'green');
} else if (successRate >= 75) {
  log('\n⚠️  La plupart des corrections sont appliquées, mais il reste du travail.', 'yellow');
} else {
  log('\n🚨 Des corrections critiques sont manquantes. Intervention requise.', 'red');
}

// Prochaines étapes
console.log('\n📋 PROCHAINES ÉTAPES RECOMMANDÉES:\n');

if (successRate < 100) {
  log('1. Corriger les vérifications échouées ci-dessus', 'blue');
  log('2. Relancer ce script de validation', 'blue');
}

log('3. Corriger les erreurs TypeScript restantes', 'blue');
log('4. Tester les fonctionnalités critiques', 'blue');
log('5. Passer à la Phase 2 (Refactoring)', 'blue');

console.log('\n' + '='.repeat(60));
log('Script de validation terminé', 'blue');
console.log('='.repeat(60));
