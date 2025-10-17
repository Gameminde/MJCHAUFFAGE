(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mjchauffage.com', password: 'Admin@123' }),
      redirect: 'manual'
    });
    console.log('Status:', res.status);
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      console.log('JSON:', JSON.stringify(json, null, 2));
    } catch {
      console.log('Text:', text);
    }
    console.log('Set-Cookie:', res.headers.get('set-cookie'));
  } catch (err) {
    console.error('Login request error:', err);
  }
})();