const axios = require('axios');

const API_URL = 'http://localhost:3001/api/auth';

const testUser = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'password123',
  firstName: 'Test',
  lastName: 'User'
};

let accessToken = '';
let refreshToken = '';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true // Important pour envoyer les cookies
});

async function runAuthTest() {
  try {
    console.log('--- 1. Testing Registration ---');
    const registerResponse = await api.post('/register', testUser);
    console.log('Registration successful:', registerResponse.data);

    console.log('\n--- 2. Testing Login ---');
    const loginResponse = await api.post('/login', {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login successful:', loginResponse.data);
    
    // Les cookies sont gérés automatiquement par axios avec withCredentials: true
    // On ne peut pas accéder aux cookies HttpOnly depuis le code client, c'est le but.

    console.log('\n--- 3. Testing Profile Access (Protected Route) ---');
    // Il faut attacher le header Authorization manuellement pour ce test
    // car nous ne sommes pas dans un navigateur
    const profileResponse = await api.get('/profile', {
        headers: {
            'Cookie': loginResponse.headers['set-cookie'].join('; ')
        }
    });
    console.log('Profile access successful:', profileResponse.data);


    console.log('\n--- 4. Testing Token Refresh ---');
    const refreshResponse = await api.post('/refresh');
    console.log('Token refresh successful:', refreshResponse.data);

    console.log('\n--- 5. Testing Logout ---');
    const logoutResponse = await api.post('/logout');
    console.log('Logout successful:', logoutResponse.data);

    console.log('\n--- 6. Testing Profile Access After Logout ---');
    try {
      await api.get('/profile');
    } catch (error) {
      console.log('Profile access correctly denied after logout:', error.response.status, error.response.data.message);
    }

    console.log('\n--- AUTHENTICATION TEST SUITE PASSED ---');

  } catch (error) {
    console.error('\n--- AUTHENTICATION TEST FAILED ---');
    console.error('Full error object:', error);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
        console.error('Request was made but no response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    process.exit(1);
  }
}

runAuthTest();