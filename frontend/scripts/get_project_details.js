const https = require('https');

const projectId = 'jqrwunmxblzebmvmugju';
const token = 'sbp_c0b14f74672a1ad6c3c691368c75cc5c2a6372cd';

const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectId}`,
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
};

console.log(`Connecting to ${options.hostname}${options.path}...`);

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

req.end();
