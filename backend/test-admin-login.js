const https = require('https');
const http = require('http');

const data = JSON.stringify({
  email: 'admin@mjchauffage.com',
  password: 'Admin123!'
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/admin/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      console.log('Response:', JSON.stringify(response, null, 2));
    } catch (error) {
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();