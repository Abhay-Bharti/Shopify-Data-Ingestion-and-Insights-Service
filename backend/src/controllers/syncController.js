import { PrismaClient } from '@prisma/client';
import { ShopifyService } from '../services/shopifyService.js';

const prisma = new PrismaClient();

export const syncShopifyData = async (req, res) => {
  try {
    const user = req.user;
    
    // Get Shopify configuration from environment
    const shopifyStore = process.env.SHOPIFY_STORE_URL;
    const shopifyApiKey = process.env.SHOPIFY_API_KEY;
    const shopifyApiSecret = process.env.SHOPIFY_API_SECRET;
    
    if (!shopifyStore || !shopifyApiKey || !shopifyApiSecret) {
      return res.status(500).json({
        error: 'Shopify configuration missing in environment variables'
      });
    }

    // For now, create a tenant for the user if they don't have one
    let tenant = user.tenant;
    
    if (!tenant) {
      // Create a tenant for this user using the environment Shopify configuration
      tenant = await prisma.tenant.create({
        data: {
          name: `${user.name}'s Store`,
          shopifyStoreUrl: shopifyStore,
          apiKey: shopifyApiKey,
          apiSecret: shopifyApiSecret,
          isActive: true,
        },
      });

      // Associate the user with this tenant
      await prisma.user.update({
        where: { id: user.id },
        data: { tenantId: tenant.id },
      });
    }

    // Initialize Shopify service
    const shopifyService = new ShopifyService({
      shopUrl: shopifyStore,
      apiKey: shopifyApiKey,
      apiSecret: shopifyApiSecret,
    });

    // Test connection first
    const connectionTest = await shopifyService.testConnection();
    if (!connectionTest.success) {
      return res.status(500).json({
        error: 'Failed to connect to Shopify store',
        details: connectionTest.error
      });
    }

    console.log('Shopify connection successful, starting data sync...');

    // Fetch real customers from Shopify
    const shopifyCustomers = await shopifyService.getCustomers();
    console.log(`Fetched ${shopifyCustomers.length} customers from Shopify`);

    // Fetch real orders from Shopify  
    const shopifyOrders = await shopifyService.getOrders();
    console.log(`Fetched ${shopifyOrders.length} orders from Shopify`);

    // Fetch real products from Shopify
    const shopifyProducts = await shopifyService.getProducts();
    console.log(`Fetched ${shopifyProducts.length} products from Shopify`);

    // Create customers in database
    const createdCustomers = [];
    for (const shopifyCustomer of shopifyCustomers) {
      const customer = await prisma.customer.upsert({
        where: { 
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: shopifyCustomer.id.toString()
          }
        },
        update: {
          name: `${shopifyCustomer.first_name || ''} ${shopifyCustomer.last_name || ''}`.trim() || 'Unknown Customer',
          email: shopifyCustomer.email || '',
          totalSpent: parseFloat(shopifyCustomer.total_spent) || 0,
        },
        create: {
          tenantId: tenant.id,
          shopifyId: shopifyCustomer.id.toString(),
          name: `${shopifyCustomer.first_name || ''} ${shopifyCustomer.last_name || ''}`.trim() || 'Unknown Customer',
          email: shopifyCustomer.email || '',
          totalSpent: parseFloat(shopifyCustomer.total_spent) || 0,
        },
      });
      createdCustomers.push(customer);
    }

    // Create products in database
    const createdProducts = [];
    for (const shopifyProduct of shopifyProducts) {
      const product = await prisma.product.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: shopifyProduct.id.toString()
          }
        },
        update: {
          name: shopifyProduct.title || 'Unknown Product',
          sku: shopifyProduct.variants?.[0]?.sku || null,
          price: parseFloat(shopifyProduct.variants?.[0]?.price) || 0,
        },
        create: {
          tenantId: tenant.id,
          shopifyId: shopifyProduct.id.toString(),
          name: shopifyProduct.title || 'Unknown Product',
          sku: shopifyProduct.variants?.[0]?.sku || null,
          price: parseFloat(shopifyProduct.variants?.[0]?.price) || 0,
        },
      });
      createdProducts.push(product);
    }

    // Create orders in database
    let ordersCreated = 0;
    for (const shopifyOrder of shopifyOrders) {
      // Find the customer for this order
      let customerId = null;
      if (shopifyOrder.customer && shopifyOrder.customer.id) {
        const customer = createdCustomers.find(c => c.shopifyId === shopifyOrder.customer.id.toString());
        if (customer) {
          customerId = customer.id;
        }
      }

      // Skip orders without valid customers for now
      if (!customerId) {
        console.log(`Skipping order ${shopifyOrder.id} - no customer found`);
        continue;
      }

      await prisma.order.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: shopifyOrder.id.toString()
          }
        },
        update: {
          totalPrice: parseFloat(shopifyOrder.total_price) || 0,
          orderDate: new Date(shopifyOrder.created_at),
        },
        create: {
          tenantId: tenant.id,
          shopifyId: shopifyOrder.id.toString(),
          customerId: customerId,
          totalPrice: parseFloat(shopifyOrder.total_price) || 0,
          orderDate: new Date(shopifyOrder.created_at),
        },
      });
      ordersCreated++;
    }

    res.json({
      success: true,
      message: `Successfully synced data from ${shopifyStore}`,
      synced: {
        customers: shopifyCustomers.length,
        products: shopifyProducts.length,
        orders: ordersCreated,
      },
      store: shopifyStore,
      details: {
        totalShopifyCustomers: shopifyCustomers.length,
        totalShopifyProducts: shopifyProducts.length,
        totalShopifyOrders: shopifyOrders.length,
        ordersWithCustomers: ordersCreated,
        ordersSkipped: shopifyOrders.length - ordersCreated
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ 
      error: 'Sync failed', 
      details: error.message 
    });
  }
};