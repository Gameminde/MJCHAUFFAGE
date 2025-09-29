import { Router } from 'express';

const router = Router();

// Customer routes will be implemented when we work on the customer portal
// For now, returning a placeholder

router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Customer routes - Coming soon',
  });
});

export default router;