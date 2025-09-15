import express from 'express';
import { WebhookController } from '../controllers/webhookController.js';

const router = express.Router();

// Middleware to parse raw body for webhook verification
router.use(express.raw({ type: 'application/json' }));

// Convert raw body back to JSON after verification
router.use((req, res, next) => {
  if (req.body && Buffer.isBuffer(req.body)) {
    req.body = JSON.parse(req.body.toString());
  }
  next();
});

// Health check
router.get('/health', WebhookController.health);

// Customer webhooks
router.post('/customers/create', WebhookController.verifyWebhook, WebhookController.customerCreated);
router.post('/customers/update', WebhookController.verifyWebhook, WebhookController.customerUpdated);

// Product webhooks  
router.post('/products/create', WebhookController.verifyWebhook, WebhookController.productCreated);
router.post('/products/update', WebhookController.verifyWebhook, WebhookController.productUpdated);

// Order webhooks
router.post('/orders/create', WebhookController.verifyWebhook, WebhookController.orderCreated);
router.post('/orders/update', WebhookController.verifyWebhook, WebhookController.orderUpdated);

// Optional: Checkout event webhook (bonus feature)
router.post('/checkouts/create', WebhookController.verifyWebhook, WebhookController.checkoutStarted);

export default router;