import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/v1/boilers/models
 * Get boiler models, optionally filtered by manufacturer
 */
router.get('/models', async (req, res) => {
  try {
    const { manufacturerId, search } = req.query;
    
    const where: any = { isActive: true };
    
    if (manufacturerId) {
      where.manufacturerId = manufacturerId;
    }
    
    if (search) {
      where.name = { contains: String(search) };
    }

    const models = await prisma.boilerModel.findMany({
      where,
      include: {
        manufacturer: {
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Error fetching boiler models:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch boiler models'
    });
  }
});

/**
 * GET /api/v1/boilers/models/:id/parts
 * Get compatible parts for a specific boiler model
 */
router.get('/models/:id/parts', async (req, res) => {
  try {
    const { id } = req.params;
    
    const compatibility = await prisma.productCompatibility.findMany({
      where: { boilerModelId: id },
      include: {
        product: {
          include: {
            category: true,
            manufacturer: true,
            images: { take: 1 }
          }
        }
      }
    });
    
    // Transform to return product list
    const parts = compatibility.map(item => ({
      ...item.product,
      compatibilityNotes: item.notes
    }));

    res.json({
      success: true,
      data: parts
    });
  } catch (error) {
    console.error('Error fetching compatible parts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compatible parts'
    });
  }
});

export default router;

