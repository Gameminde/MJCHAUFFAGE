
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function audit() {
    console.log('Starting Database Audit...');

    try {
        // Count records in key tables
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count();
        const orderCount = await prisma.order.count();
        const categoryCount = await prisma.category.count();
        const customerCount = await prisma.customer.count();

        console.log('--- Database Statistics ---');
        console.log(`Users: ${userCount}`);
        console.log(`Customers: ${customerCount}`);
        console.log(`Products: ${productCount}`);
        console.log(`Categories: ${categoryCount}`);
        console.log(`Orders: ${orderCount}`);

        // Check for critical admin user
        const adminUser = await prisma.user.findFirst({
            where: { email: 'admin@mjchauffage.com' } // Adjust email if needed based on .env
        });

        if (adminUser) {
            console.log('✅ Admin user found:', adminUser.email);
        } else {
            console.log('❌ Admin user NOT found!');
        }

        console.log('--- Audit Complete ---');

    } catch (error) {
        console.error('Audit failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

audit();
