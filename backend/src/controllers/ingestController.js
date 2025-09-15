import { PrismaClient } from '@prisma/client';
import { ShopifyService } from '../services/shopifyService.js';

const prisma = new PrismaClient();

export const ingestCustomers = async (req, res) => {
  try {
    const tenant = req.tenant;
    
    const shopifyService = new ShopifyService({
      shopUrl: tenant.shopifyStoreUrl,
      apiKey: tenant.apiKey,
      apiSecret: tenant.apiSecret,
    });

    const customers = await shopifyService.getCustomers();
    let syncedCount = 0;

    for (const shopifyCustomer of customers) {
      const customerData = {
        tenantId: tenant.id,
        shopifyId: shopifyCustomer.id.toString(),
        name: `${shopifyCustomer.first_name || ''} ${shopifyCustomer.last_name || ''}`.trim(),
        email: shopifyCustomer.email || '',
        totalSpent: parseFloat(shopifyCustomer.total_spent || '0'),
      };

      await prisma.customer.upsert({
        where: {
          tenantId_shopifyId: {
            tenantId: tenant.id,
            shopifyId: shopifyCustomer.id.toString(),
          },
        },
        update: customerData,
        create: customerData,
      });

      syncedCount++;
    }

    res.status(200).json({
      message: 'Customers synced successfully',
      syncedCount,
      totalCustomers: customers.length,
    });
  } catch (error) {
    console.error('Customer ingestion error:', error);
    res.status(500).json({
      error: 'Failed to ingest customers',
      details: error.message,
    });
  }
};

export const ingestProducts = async (req, res) => {
  try {
    const tenant = req.tenant;
    
    const shopifyService = new ShopifyService({
      shopUrl: tenant.shopifyStoreUrl,
      apiKey: tenant.apiKey,
      apiSecret: tenant.apiSecret,
    });

    const products = await shopifyService.getProducts();
    let syncedCount = 0;

    for (const shopifyProduct of products) {
      for (const variant of shopifyProduct.variants || []) {
        const productData = {
          tenantId: tenant.id,
          shopifyId: variant.id.toString(),
          name: shopifyProduct.title,
          sku: variant.sku || null,
          price: parseFloat(variant.price || '0'),
        };

        await prisma.product.upsert({
          where: {
            tenantId_shopifyId: {
              tenantId: tenant.id,
              shopifyId: variant.id.toString(),
            },
          },
          update: productData,
          create: productData,
        });

        syncedCount++;
      }
    }

    res.status(200).json({
      message: 'Products synced successfully',
      syncedCount,
      totalProducts: products.length,
    });
  } catch (error) {
    console.error('Product ingestion error:', error);
    res.status(500).json({
      error: 'Failed to ingest products',
      details: error.message,
    });
  }
};

export const ingestOrders = async (req, res) => {
  try {
    const tenant = req.tenant;
    
    const shopifyService = new ShopifyService({
      shopUrl: tenant.shopifyStoreUrl,
      apiKey: tenant.apiKey,
      apiSecret: tenant.apiSecret,
    });

    const orders = await shopifyService.getOrders();
    let syncedCount = 0;

    for (const shopifyOrder of orders) {
      // Find or create customer
      let customer = await prisma.customer.findFirst({
        where: {
          tenantId: tenant.id,
          shopifyId: shopifyOrder.customer?.id?.toString() || '',
        },
      });

      if (!customer && shopifyOrder.customer) {
        customer = await prisma.customer.create({
          data: {
            tenantId: tenant.id,
            shopifyId: shopifyOrder.customer.id.toString(),
            name: `${shopifyOrder.customer.first_name || ''} ${shopifyOrder.customer.last_name || ''}`.trim(),
            email: shopifyOrder.customer.email || shopifyOrder.email || '',
            totalSpent: parseFloat(shopifyOrder.customer.total_spent || '0'),
          },
        });
      }

      if (customer) {
        const orderData = {
          tenantId: tenant.id,
          customerId: customer.id,
          shopifyId: shopifyOrder.id.toString(),
          totalPrice: parseFloat(shopifyOrder.total_price || '0'),
          orderDate: new Date(shopifyOrder.created_at),
        };

        const order = await prisma.order.upsert({
          where: {
            tenantId_shopifyId: {
              tenantId: tenant.id,
              shopifyId: shopifyOrder.id.toString(),
            },
          },
          update: orderData,
          create: orderData,
        });

        // Handle order items
        for (const lineItem of shopifyOrder.line_items || []) {
          let product = await prisma.product.findFirst({
            where: {
              tenantId: tenant.id,
              shopifyId: lineItem.variant_id?.toString() || '',
            },
          });

          if (!product) {
            product = await prisma.product.create({
              data: {
                tenantId: tenant.id,
                shopifyId: lineItem.variant_id?.toString() || lineItem.product_id.toString(),
                name: lineItem.title,
                sku: lineItem.sku || null,
                price: parseFloat(lineItem.price || '0'),
              },
            });
          }

          await prisma.orderItem.upsert({
            where: {
              orderId: order.id,
              productId: product.id,
            },
            update: {
              quantity: lineItem.quantity,
              price: parseFloat(lineItem.price || '0'),
            },
            create: {
              orderId: order.id,
              productId: product.id,
              quantity: lineItem.quantity,
              price: parseFloat(lineItem.price || '0'),
            },
          });
        }

        syncedCount++;
      }
    }

    res.status(200).json({
      message: 'Orders synced successfully',
      syncedCount,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error('Order ingestion error:', error);
    res.status(500).json({
      error: 'Failed to ingest orders',
      details: error.message,
    });
  }
};