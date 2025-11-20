
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAdmin() {
    const email = 'admin@mjchauffage.com';
    const password = 'Admin123!';

    try {
        console.log(`Checking user: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('❌ User not found in database.');
            return;
        }

        console.log('✅ User found:', {
            id: user.id,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            isVerified: user.isVerified
        });

        if (!user.password) {
            console.log('❌ User has NO password set.');
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            console.log('✅ Password is CORRECT.');
        } else {
            console.log('❌ Password is INCORRECT.');
        }

    } catch (error) {
        console.error('Error checking admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();
