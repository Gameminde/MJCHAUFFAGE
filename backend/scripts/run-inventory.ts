import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { InventoryService } from '../../4.5/stock_management';

async function main() {
  const prisma = new PrismaClient();
  const svc = new InventoryService();

  const product = await prisma.product.findFirst({
    where: { isActive: true, stockQuantity: { gt: 0 } },
    select: { id: true, name: true, stockQuantity: true },
  });

  if (!product) {
    console.log('Aucun produit actif avec stock.');
    return;
  }

  const availability = await svc.checkAvailability(product.id, 1);
  console.log(
    JSON.stringify(
      { product, availability },
      null,
      2
    )
  );
}

main()
  .catch((err) => {
    console.error('Error executing inventory:', err);
    process.exit(1);
  })
  .then(() => process.exit(0));