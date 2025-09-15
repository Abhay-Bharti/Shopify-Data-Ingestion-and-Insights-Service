import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getAnalyticsSummary, 
  getOrdersByDate, 
  getTopCustomers, 
  getTopProducts,
  getCustomers,
  getProducts,
  getOrders,
  getCustomEvents
} from '../controllers/analyticsController.js';

const router = Router();

// Apply JWT authentication to all routes
router.use(authenticateToken);

// Analytics routes
router.get('/summary', getAnalyticsSummary);
router.get('/orders-by-date', getOrdersByDate);
router.get('/top-customers', getTopCustomers);
router.get('/top-products', getTopProducts);
router.get('/customers', getCustomers);
router.get('/products', getProducts);
router.get('/orders', getOrders);
router.get('/custom-events', getCustomEvents);

export default router;