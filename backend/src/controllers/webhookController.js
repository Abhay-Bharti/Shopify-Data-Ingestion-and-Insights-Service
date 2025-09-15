import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { ShopifyService } from '../services/shopifyService.js';

const prisma = new PrismaClient();

export class WebhookController {
  // Verify webhook authenticity
  static verifyWebhook(req, res, next) {
    const hmacHeader = req.get('X-Shopify-Hmac-Sha256');
    const body = req.body;
    const webhook_secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!hmacHeader || !webhook_secret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hash = crypto
      .createHmac('sha256', webhook_secret)
      .update(JSON.stringify(body))
      .digest('base64');

    if (hash !== hmacHeader) {
      return res.status(401).json({ error: 'Webhook verification failed' });
    }

    next();
  }

  // Customer webhooks
  static async customerCreated(req, res) {
    try {
      const customer = req.body;
      const tenantId = req.headers['x-shopify-shop-domain']?.replace('.myshopify.com', '') || 'default';

      await prisma.customer.upsert({
        where: { 
          shopifyId_tenantId: {
            shopifyId: customer.id.toString(),
            tenantId
          }
        },
        update: {
          firstName: customer.first_name || '',
          lastName: customer.last_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          totalSpent: parseFloat(customer.total_spent || 0),
          ordersCount: customer.orders_count || 0,
          createdAt: new Date(customer.created_at),
          updatedAt: new Date()
        },
        create: {
          shopifyId: customer.id.toString(),
          tenantId,
          firstName: customer.first_name || '',
          lastName: customer.last_name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          totalSpent: parseFloat(customer.total_spent || 0),
          ordersCount: customer.orders_count || 0,
          createdAt: new Date(customer.created_at),
          updatedAt: new Date()
        }
      });

      console.log(`Customer ${customer.id} created/updated for tenant ${tenantId}`);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing customer webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async customerUpdated(req, res) {
    // Same logic as customerCreated for upsert
    await WebhookController.customerCreated(req, res);
  }

  // Product webhooks
  static async productCreated(req, res) {
    try {
      const product = req.body;
      const tenantId = req.headers['x-shopify-shop-domain']?.replace('.myshopify.com', '') || 'default';

      await prisma.product.upsert({
        where: {
          shopifyId_tenantId: {
            shopifyId: product.id.toString(),
            tenantId
          }
        },
        update: {
          title: product.title || '',
          vendor: product.vendor || '',
          productType: product.product_type || '',
          handle: product.handle || '',
          status: product.status || 'active',
          price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
          compareAtPrice: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
          inventory: product.variants?.[0]?.inventory_quantity || 0,
          createdAt: new Date(product.created_at),
          updatedAt: new Date()
        },
        create: {
          shopifyId: product.id.toString(),
          tenantId,
          title: product.title || '',
          vendor: product.vendor || '',
          productType: product.product_type || '',
          handle: product.handle || '',
          status: product.status || 'active',
          price: product.variants?.[0]?.price ? parseFloat(product.variants[0].price) : 0,
          compareAtPrice: product.variants?.[0]?.compare_at_price ? parseFloat(product.variants[0].compare_at_price) : null,
          inventory: product.variants?.[0]?.inventory_quantity || 0,
          createdAt: new Date(product.created_at),
          updatedAt: new Date()
        }
      });

      console.log(`Product ${product.id} created/updated for tenant ${tenantId}`);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing product webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async productUpdated(req, res) {
    await WebhookController.productCreated(req, res);
  }

  // Order webhooks
  static async orderCreated(req, res) {
    try {
      const order = req.body;
      const tenantId = req.headers['x-shopify-shop-domain']?.replace('.myshopify.com', '') || 'default';

      await prisma.order.upsert({
        where: {
          shopifyId_tenantId: {
            shopifyId: order.id.toString(),
            tenantId
          }
        },
        update: {
          customerShopifyId: order.customer?.id?.toString() || null,
          orderNumber: order.order_number || order.name || '',
          totalPrice: parseFloat(order.total_price || 0),
          subtotalPrice: parseFloat(order.subtotal_price || 0),
          totalTax: parseFloat(order.total_tax || 0),
          currency: order.currency || 'USD',
          financialStatus: order.financial_status || 'pending',
          fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
          email: order.email || '',
          createdAt: new Date(order.created_at),
          updatedAt: new Date()
        },
        create: {
          shopifyId: order.id.toString(),
          tenantId,
          customerShopifyId: order.customer?.id?.toString() || null,
          orderNumber: order.order_number || order.name || '',
          totalPrice: parseFloat(order.total_price || 0),
          subtotalPrice: parseFloat(order.subtotal_price || 0),
          totalTax: parseFloat(order.total_tax || 0),
          currency: order.currency || 'USD',
          financialStatus: order.financial_status || 'pending',
          fulfillmentStatus: order.fulfillment_status || 'unfulfilled',
          email: order.email || '',
          createdAt: new Date(order.created_at),
          updatedAt: new Date()
        }
      });

      console.log(`Order ${order.id} created/updated for tenant ${tenantId}`);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing order webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async orderUpdated(req, res) {
    await WebhookController.orderCreated(req, res);
  }

  // Custom events (bonus features)
  static async cartAbandoned(req, res) {
    try {
      const cart = req.body;
      const tenantId = req.headers['x-shopify-shop-domain']?.replace('.myshopify.com', '') || 'default';

      // Store cart abandonment event in database
      await prisma.customEvent.create({
        data: {
          tenantId,
          eventType: 'cart_abandoned',
          customerEmail: cart.email || null,
          cartToken: cart.token || null,
          totalValue: cart.total_price ? parseFloat(cart.total_price) : null,
          itemsCount: cart.line_items?.length || 0,
          eventData: cart // Store full cart data as JSON
        }
      });

      console.log(`Cart abandoned event stored for tenant ${tenantId}:`, {
        cartToken: cart.token,
        customerEmail: cart.email,
        totalValue: cart.total_price,
        items: cart.line_items?.length || 0,
        abandonedAt: new Date()
      });

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing cart abandonment webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async checkoutStarted(req, res) {
    try {
      const checkout = req.body;
      const tenantId = req.headers['x-shopify-shop-domain']?.replace('.myshopify.com', '') || 'default';

      // Store checkout started event in database
      await prisma.customEvent.create({
        data: {
          tenantId,
          eventType: 'checkout_started',
          customerEmail: checkout.email || null,
          checkoutToken: checkout.token || null,
          totalValue: checkout.total_price ? parseFloat(checkout.total_price) : null,
          itemsCount: checkout.line_items?.length || 0,
          eventData: checkout // Store full checkout data as JSON
        }
      });

      console.log(`Checkout started event stored for tenant ${tenantId}:`, {
        checkoutToken: checkout.token,
        customerEmail: checkout.email,
        totalValue: checkout.total_price,
        items: checkout.line_items?.length || 0,
        startedAt: new Date()
      });

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing checkout started webhook:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Health check for webhook endpoint
  static async health(req, res) {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      webhooks: 'active'
    });
  }
}