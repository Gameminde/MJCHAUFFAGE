import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Health check route
app.get('/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    message: 'Minimal server is running' 
  });
});

// Test database connection
app.get('/test-db', async (_req, res) => {
  try {
    await prisma.$connect();
    const userCount = await prisma.user.count();
    res.json({ 
      status: 'Database OK', 
      userCount,
      message: 'Database connection successful' 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'Database Error', 
      error: error.message 
    });
  }
});

// Simple auth test route
app.post('/test-auth', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('🔐 Testing auth for:', email);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        email 
      });
    }

    return res.json({
      message: 'User found',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hasPassword: !!user.password
      }
    });
  } catch (error: any) {
    console.error('❌ Auth test error:', error);
    return res.status(500).json({ 
      message: 'Auth test failed',
      error: error.message 
    });
  }
});

const startMinimalServer = async () => {
  try {
    console.log('🚀 Starting minimal test server...');
    
    console.log('📊 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    const port = 3001;
    app.listen(port, () => {
      console.log(`✅ Minimal server running on http://localhost:${port}`);
      console.log(`🔍 Health check: http://localhost:${port}/health`);
      console.log(`📊 Database test: http://localhost:${port}/test-db`);
      console.log(`🔐 Auth test: POST http://localhost:${port}/test-auth`);
    });
  } catch (error) {
    console.error('❌ Failed to start minimal server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startMinimalServer();