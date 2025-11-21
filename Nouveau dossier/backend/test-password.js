const bcrypt = require('bcryptjs');

const hash = '$2a$10$1JOuoe3ahYRD/trO9k.XA.hnu4YOSq0vdF4hkJS9gNi2n3McKWWim';
const passwords = ['Admin@123', 'Admin123!', 'admin123', 'Admin123'];

console.log('Testing passwords against hash:');
passwords.forEach(pwd => {
  const isMatch = bcrypt.compareSync(pwd, hash);
  console.log(`${pwd}: ${isMatch}`);
});