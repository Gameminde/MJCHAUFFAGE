const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$1JOuoe3ahYRD/trO9k.XA.hnu4YOSq0vdF4hkJS9gNi2n3McKWWim';
const passwords = ['Admin@123', 'Admin123!', 'admin123', 'Admin123', 'mjchauffage123', 'password'];

async function verifyPasswords() {
  console.log('Testing passwords against hash:', storedHash);
  console.log('');
  
  for (const password of passwords) {
    try {
      const isMatch = await bcrypt.compare(password, storedHash);
      console.log(`Password "${password}": ${isMatch ? '✅ MATCH' : '❌ No match'}`);
    } catch (error) {
      console.log(`Password "${password}": ❌ Error - ${error.message}`);
    }
  }
}

verifyPasswords();