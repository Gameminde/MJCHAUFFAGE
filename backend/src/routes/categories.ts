import { Router } from 'express';
import { prisma } from '@/lib/database';

const router = Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const { main } = req.query;

        const categories = await prisma.category.findMany({
            where: {
                isActive: true,
                ...(main === 'true' && { parentId: null }) // Only main categories if requested
            },
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch category'
        });
    }
});

export default router;
