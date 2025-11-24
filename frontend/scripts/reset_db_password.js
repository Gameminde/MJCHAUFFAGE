const https = require('https');

const projectId = 'jqrwunmxblzebmvmugju';
const token = 'sbp_c0b14f74672a1ad6c3c691368c75cc5c2a6372cd';
const newPassword = 'NewStrongPassword123!';

const data = JSON.stringify({ password: newPassword });

const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectId}/database/password`,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
    }
};

console.log(`Resetting password for ${projectId}...`);

const req = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`);
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        console.log('Response:', body);
    });
});

req.on('error', error => {
    console.error('Error:', error);
});

req.write(data);
req.end();
