import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/wilayas
 * Get all wilayas with shipping costs
 */
router.get('/', async (_req, res) => {
  try {
    const wilayas = await prisma.wilaya.findMany({
      where: { active: true },
      orderBy: { code: 'asc' }
    });
    
    console.log(`📋 Wilayas endpoint: ${wilayas.length} wilayas trouvées`);
    
    if (wilayas.length === 0) {
      console.warn('⚠️ Aucune wilaya active trouvée dans la base de données!');
      console.warn('💡 Exécutez: npx ts-node prisma/seed-wilayas.ts');
    }
    
    res.json({
      success: true,
      data: wilayas,
      count: wilayas.length
    });
  } catch (error) {
    console.error('❌ Error fetching wilayas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wilayas',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/v1/wilayas/:code/shipping-cost
 * Get shipping cost for specific wilaya
 */
router.get('/:code/shipping-cost', async (req, res) => {
  try {
    const { code } = req.params;
    const wilaya = await prisma.wilaya.findUnique({
      where: { code }
    });

    if (!wilaya) {
      res.status(404).json({
        success: false,
        message: 'Wilaya not found'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        shippingCost: Number(wilaya.shippingCost),
        freeShippingThreshold: 50000 // Example threshold
      }
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping'
    });
  }
});

export default router;

