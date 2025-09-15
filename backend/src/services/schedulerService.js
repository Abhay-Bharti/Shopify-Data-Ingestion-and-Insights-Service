import cron from 'node-cron';
import { ShopifyService } from './shopifyService.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  // Start all scheduled jobs
  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting Shopify data sync scheduler...');

    // Sync data every 15 minutes
    const syncJob = cron.schedule('*/15 * * * *', async () => {
      console.log('Running scheduled Shopify data sync...');
      await this.syncAllTenants();
    }, {
      scheduled: false
    });

    // Health check job every hour
    const healthJob = cron.schedule('0 * * * *', async () => {
      console.log('Running health check...');
      await this.performHealthCheck();
    }, {
      scheduled: false
    });

    // Cleanup old logs daily at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      console.log('Running daily cleanup...');
      await this.performCleanup();
    }, {
      scheduled: false
    });

    this.jobs.set('sync', syncJob);
    this.jobs.set('health', healthJob);
    this.jobs.set('cleanup', cleanupJob);

    // Start all jobs
    syncJob.start();
    healthJob.start();
    cleanupJob.start();

    this.isRunning = true;
    console.log('✅ Scheduler started successfully');
  }

  // Stop all scheduled jobs
  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping scheduler...');
    
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped ${name} job`);
    });

    this.jobs.clear();
    this.isRunning = false;
    console.log('✅ Scheduler stopped successfully');
  }

  // Sync data for all tenants
  async syncAllTenants() {
    try {
      // Get all unique tenant IDs from database
      const tenants = await prisma.customer.groupBy({
        by: ['tenantId'],
        _count: {
          tenantId: true
        }
      });

      console.log(`Found ${tenants.length} tenants to sync`);

      for (const tenant of tenants) {
        await this.syncTenantData(tenant.tenantId);
      }

      console.log('✅ Completed sync for all tenants');
    } catch (error) {
      console.error('❌ Error syncing all tenants:', error);
    }
  }

  // Sync data for a specific tenant
  async syncTenantData(tenantId) {
    try {
      console.log(`Syncing data for tenant: ${tenantId}`);

      // Get tenant's Shopify configuration
      const shopifyService = new ShopifyService({
        store: `${tenantId}.myshopify.com`,
        apiKey: process.env.SHOPIFY_API_KEY,
        apiSecret: process.env.SHOPIFY_API_SECRET,
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN // In real app, this would be per-tenant
      });

      // Test connection first
      const connectionTest = await shopifyService.testConnection();
      if (!connectionTest.success) {
        console.error(`❌ Connection failed for tenant ${tenantId}:`, connectionTest.error);
        return;
      }

      // Sync customers
      await this.syncCustomers(shopifyService, tenantId);
      
      // Sync products  
      await this.syncProducts(shopifyService, tenantId);
      
      // Sync orders
      await this.syncOrders(shopifyService, tenantId);

      console.log(`✅ Completed sync for tenant: ${tenantId}`);
    } catch (error) {
      console.error(`❌ Error syncing tenant ${tenantId}:`, error);
    }
  }

  // Sync customers for a tenant
  async syncCustomers(shopifyService, tenantId) {
    try {
      const customers = await shopifyService.getCustomers();
      console.log(`Syncing ${customers.length} customers for tenant ${tenantId}`);

      for (const customer of customers) {
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
      }
    } catch (error) {
      console.error(`Error syncing customers for tenant ${tenantId}:`, error);
    }
  }

  // Sync products for a tenant
  async syncProducts(shopifyService, tenantId) {
    try {
      const products = await shopifyService.getProducts();
      console.log(`Syncing ${products.length} products for tenant ${tenantId}`);

      for (const product of products) {
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
      }
    } catch (error) {
      console.error(`Error syncing products for tenant ${tenantId}:`, error);
    }
  }

  // Sync orders for a tenant
  async syncOrders(shopifyService, tenantId) {
    try {
      const orders = await shopifyService.getOrders();
      console.log(`Syncing ${orders.length} orders for tenant ${tenantId}`);

      for (const order of orders) {
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
      }
    } catch (error) {
      console.error(`Error syncing orders for tenant ${tenantId}:`, error);
    }
  }

  // Perform health check
  async performHealthCheck() {
    try {
      // Check database connectivity
      await prisma.$queryRaw`SELECT 1`;
      
      // Check if we have recent data
      const recentOrders = await prisma.order.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      console.log(`Health check: Database OK, ${recentOrders} orders updated in last 24h`);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  // Cleanup old data and logs
  async performCleanup() {
    try {
      // Clean up old sync logs (if you implement logging)
      console.log('Performing daily cleanup...');
      
      // Example: Delete orders older than 1 year for inactive tenants
      // This is just an example - adjust based on your needs
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

      console.log('Cleanup completed');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeJobs: Array.from(this.jobs.keys()),
      uptime: this.isRunning ? process.uptime() : 0
    };
  }
}