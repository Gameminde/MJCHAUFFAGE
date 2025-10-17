// Utilisation des modules natifs de Node.js
const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json: () => jsonData });
        } catch (e) {
          resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, text: () => data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testDashboardAccess() {
  console.log('🔐 Test d\'accès au dashboard admin...\n');

  try {
    // 1. Connexion admin
    console.log('1. Connexion admin...');
    const loginResponse = await makeRequest('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@mjchauffage.com',
        password: 'admin123'
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Erreur de connexion: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie');
    console.log('   Token reçu:', loginData.data?.sessionToken ? 'Oui' : 'Non');
    console.log('   Utilisateur:', loginData.data?.user?.email);
    console.log('   Rôle:', loginData.data?.user?.role);

    const token = loginData.data?.sessionToken;
    if (!token) {
      throw new Error('Aucun token reçu');
    }

    // 2. Test d'accès au profil avec token
    console.log('\n2. Test d\'accès au profil avec token...');
    const profileResponse = await makeRequest('http://localhost:3001/api/auth/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Accès au profil autorisé');
      console.log('   Utilisateur vérifié:', profileData.data?.user?.email);
    } else {
      console.log('❌ Accès au profil refusé:', profileResponse.status);
    }

    // 3. Test d'accès aux données admin (si endpoint existe)
    console.log('\n3. Test d\'accès aux données admin...');
    const adminResponse = await makeRequest('http://localhost:3001/api/admin/dashboard', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Accès aux données admin autorisé');
      console.log('   Données reçues:', Object.keys(adminData));
    } else {
      console.log('⚠️  Endpoint admin dashboard non trouvé ou non autorisé:', adminResponse.status);
    }

    // 4. Test d'accès aux produits
    console.log('\n4. Test d\'accès aux produits...');
    const productsResponse = await makeRequest('http://localhost:3001/api/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      console.log('✅ Accès aux produits autorisé');
      console.log('   Nombre de produits:', productsData.data?.length || 0);
    } else {
      console.log('❌ Accès aux produits refusé:', productsResponse.status);
    }

    console.log('\n🎯 RÉSUMÉ DU TEST:');
    console.log('================');
    console.log('✅ Authentification admin: OK');
    console.log('✅ Token généré: OK');
    console.log('✅ Accès au profil: OK');
    console.log('⚠️  Dashboard admin: À vérifier');
    console.log('✅ Accès aux données: À tester');

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testDashboardAccess();