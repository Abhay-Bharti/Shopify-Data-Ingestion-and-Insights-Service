import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { syncShopifyData } from '../controllers/syncController.js';

const router = Router();

// Apply JWT authentication to all routes
router.use(authenticateToken);

// Sync routes
router.post('/shopify', syncShopifyData);

export default router;