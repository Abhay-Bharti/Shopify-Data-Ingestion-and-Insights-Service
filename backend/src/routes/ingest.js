import { Router } from 'express';
import { tenantAuth } from '../middleware/auth.js';
import { ingestCustomers, ingestProducts, ingestOrders } from '../controllers/ingestController.js';

const router = Router();

// Apply tenant authentication to all routes
router.use(tenantAuth);

// Data ingestion routes
router.post('/customers', ingestCustomers);
router.post('/products', ingestProducts);
router.post('/orders', ingestOrders);

export default router;