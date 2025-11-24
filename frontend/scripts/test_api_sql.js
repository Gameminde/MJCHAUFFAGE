const https = require('https');

const projectId = 'jqrwunmxblzebmvmugju';
const token = 'sbp_c0b14f74672a1ad6c3c691368c75cc5c2a6372cd';
const query = 'SELECT version();';

const data = JSON.stringify({ query });

const options = {
    hostname: 'api.supabase.com',
    path: `/v1/projects/${projectId}/sql`, // Trying undocumented endpoint used by dashboard/CLI
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
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

req.write(data);
req.end();
