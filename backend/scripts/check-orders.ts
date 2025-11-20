import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log('\n🔍 Vérification des commandes dans la base de données...\n');

    // Count total orders
    const totalOrders = await prisma.order.count();
    console.log(`📊 Nombre total de commandes: ${totalOrders}\n`);

    if (totalOrders === 0) {
      console.log('⚠️ Aucune commande trouvée dans la base de données.\n');
      console.log('💡 Pour tester:');
      console.log('   1. Ajoutez des produits au panier');
      console.log('   2. Allez sur la page checkout');
      console.log('   3. Remplissez le formulaire et confirmez la commande\n');
      return;
    }

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
    });

    console.log(`📦 ${recentOrders.length} dernières commandes:\n`);

    recentOrders.forEach((order, index) => {
      console.log(`${index + 1}. Commande #${order.orderNumber}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Statut: ${order.status}`);
      console.log(`   Date: ${order.createdAt.toLocaleString('fr-FR')}`);
      console.log(`   Total: ${Number(order.totalAmount).toLocaleString('fr-FR')} DZD`);
      
      // Customer info
      if (order.customer) {
        if (order.customer.user) {
          console.log(`   Client: ${order.customer.user.firstName} ${order.customer.user.lastName} (${order.customer.user.email})`);
        } else if (order.customer.phone) {
          console.log(`   Client: Guest - ${order.customer.phone}`);
        }
      }

      // Items
      if (order.items && order.items.length > 0) {
        console.log(`   Articles: ${order.items.length}`);
        order.items.forEach((item) => {
          console.log(`     - ${item.product?.name || 'Produit'} x${item.quantity} = ${Number(item.totalPrice).toLocaleString('fr-FR')} DZD`);
        });
      }

      // Shipping address
      if (order.shippingAddress) {
        console.log(`   Adresse: ${order.shippingAddress.street}, ${order.shippingAddress.city}${order.shippingAddress.region ? `, ${order.shippingAddress.region}` : ''}`);
      }

      console.log('');
    });

    // Statistics
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    console.log('📈 Statistiques par statut:');
    statusCounts.forEach((stat) => {
      console.log(`   ${stat.status}: ${stat._count.status}`);
    });

    console.log('\n✅ Vérification terminée!\n');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();

