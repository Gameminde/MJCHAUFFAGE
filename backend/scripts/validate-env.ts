import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET',
  'FRONTEND_URL',
  'EMAIL_HOST',
  'EMAIL_USER',
  'EMAIL_PASSWORD',
];

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'REDIS_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

console.log('🔍 Validating environment variables...\n');

const missingVars: string[] = [];
const presentVars: string[] = [];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    presentVars.push(varName);
  }
});

// Check optional variables
const optionalPresent: string[] = [];
const optionalMissing: string[] = [];

optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    optionalPresent.push(varName);
  } else {
    optionalMissing.push(varName);
  }
});

// Display results
if (presentVars.length > 0) {
  console.log('✅ Required variables present:');
  presentVars.forEach(varName => {
    const value = process.env[varName]!;
    const displayValue = value.length > 20 ? `${value.substring(0, 20)}...` : value;
    console.log(`   ✓ ${varName}: ${displayValue}`);
  });
  console.log('');
}

if (optionalPresent.length > 0) {
  console.log('ℹ️  Optional variables present:');
  optionalPresent.forEach(varName => {
    console.log(`   ✓ ${varName}`);
  });
  console.log('');
}

if (optionalMissing.length > 0) {
  console.log('⚠️  Optional variables missing (using defaults):');
  optionalMissing.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('');
}

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   ✗ ${varName}`);
  });
  console.log('');
  console.error('Please set these variables in your .env file');
  process.exit(1);
}

console.log('✅ All required environment variables are set!');
console.log('');
console.log('🚀 You can now start the server');
