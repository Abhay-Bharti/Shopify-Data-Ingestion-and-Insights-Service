import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAnalyticsSummary = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;

    // If user has no tenant, return empty data
    if (!tenant) {
      return res.status(200).json({
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        message: 'No tenant associated. Shopify store configured - sync data to see analytics.'
      });
    }

    const [totalCustomers, totalOrders, totalRevenue] = await Promise.all([
      prisma.customer.count({
        where: { tenantId: tenant.id },
      }),
      prisma.order.count({
        where: { tenantId: tenant.id },
      }),
      prisma.order.aggregate({
        where: { tenantId: tenant.id },
        _sum: { totalPrice: true },
      }),
    ]);

    res.status(200).json({
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics summary',
      details: error.message,
    });
  }
};

export const getOrdersByDate = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;
    const { from, to } = req.query;

    // If user has no tenant, return empty data
    if (!tenant) {
      return res.status(200).json({
        orders: [],
        message: 'No tenant associated. Shopify store configured - sync data to see analytics.'
      });
    }

    let whereClause = { tenantId: tenant.id };

    if (from || to) {
      whereClause.orderDate = {};
      if (from) {
        whereClause.orderDate.gte = new Date(from);
      }
      if (to) {
        whereClause.orderDate.lte = new Date(to);
      }
    }

    const orders = await prisma.order.groupBy({
      by: ['orderDate'],
      where: whereClause,
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { orderDate: 'asc' },
    });

    const formattedOrders = orders.map(order => ({
      date: order.orderDate.toISOString().split('T')[0],
      orderCount: order._count.id,
      totalRevenue: order._sum.totalPrice || 0,
    }));

    res.status(200).json({
      orders: formattedOrders,
    });
  } catch (error) {
    console.error('Orders by date error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders by date',
      details: error.message,
    });
  }
};

export const getTopCustomers = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;
    const limit = parseInt(req.query.limit) || 5;

    // If user has no tenant, return empty data
    if (!tenant) {
      return res.status(200).json({
        customers: [],
        message: 'No tenant associated. Shopify store configured - sync data to see analytics.'
      });
    }

    const topCustomers = await prisma.customer.findMany({
      where: { tenantId: tenant.id },
      orderBy: { totalSpent: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    const formattedCustomers = topCustomers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      totalSpent: customer.totalSpent,
      orderCount: customer._count.orders,
    }));

    res.status(200).json({
      customers: formattedCustomers,
    });
  } catch (error) {
    console.error('Top customers error:', error);
    res.status(500).json({
      error: 'Failed to fetch top customers',
      details: error.message,
    });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;
    const limit = parseInt(req.query.limit) || 5;

    // If user has no tenant, return empty data
    if (!tenant) {
      return res.status(200).json({
        products: [],
        message: 'No tenant associated. Shopify store configured - sync data to see analytics.'
      });
    }

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          tenantId: tenant.id,
        },
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        tenantId: tenant.id,
      },
    });

    const formattedProducts = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: item.productId,
        name: product?.name || 'Unknown Product',
        sku: product?.sku,
        price: product?.price || 0,
        totalQuantitySold: item._sum.quantity || 0,
        totalOrderCount: item._count.id,
      };
    });

    res.status(200).json({
      products: formattedProducts,
    });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      error: 'Failed to fetch top products',
      details: error.message,
    });
  }
};

// Get all customers for analytics
export const getCustomers = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;

    if (!tenant) {
      return res.status(200).json({
        data: [],
        message: 'No tenant associated. Sync data to see customers.'
      });
    }

    const customers = await prisma.customer.findMany({
      where: { tenantId: tenant.id },
      orderBy: { totalSpent: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            totalPrice: true,
          }
        }
      }
    });

    res.status(200).json({
      data: customers,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      error: 'Failed to fetch customers',
      details: error.message,
    });
  }
};

// Get all products for analytics
export const getProducts = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;

    if (!tenant) {
      return res.status(200).json({
        data: [],
        message: 'No tenant associated. Sync data to see products.'
      });
    }

    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id },
      orderBy: { price: 'desc' },
    });

    res.status(200).json({
      data: products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      details: error.message,
    });
  }
};

// Get all orders for analytics
export const getOrders = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;

    if (!tenant) {
      return res.status(200).json({
        data: [],
        message: 'No tenant associated. Sync data to see orders.'
      });
    }

    const orders = await prisma.order.findMany({
      where: { tenantId: tenant.id },
      orderBy: { orderDate: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    res.status(200).json({
      data: orders,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      details: error.message,
    });
  }
};

// Get custom events analytics (cart abandonment, checkout events)
export const getCustomEvents = async (req, res) => {
  try {
    const user = req.user;
    const tenant = user.tenant;
    const { eventType, from, to } = req.query;

    if (!tenant) {
      return res.status(200).json({
        data: [],
        summary: {},
        message: 'No tenant associated. Sync data to see custom events.'
      });
    }

    let whereClause = { tenantId: tenant.id };

    // Filter by event type if specified
    if (eventType) {
      whereClause.eventType = eventType;
    }

    // Filter by date range if specified
    if (from || to) {
      whereClause.createdAt = {};
      if (from) {
        whereClause.createdAt.gte = new Date(from);
      }
      if (to) {
        whereClause.createdAt.lte = new Date(to);
      }
    }

    // Get events data
    const events = await prisma.customEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to recent 100 events
    });

    // Get summary statistics
    const summary = await prisma.customEvent.groupBy({
      by: ['eventType'],
      where: { tenantId: tenant.id },
      _count: { id: true },
      _sum: { totalValue: true },
      _avg: { totalValue: true }
    });

    // Format summary data
    const formattedSummary = summary.reduce((acc, item) => {
      acc[item.eventType] = {
        count: item._count.id,
        totalValue: item._sum.totalValue || 0,
        averageValue: item._avg.totalValue || 0
      };
      return acc;
    }, {});

    // Get events by day for charting
    const eventsByDay = await prisma.customEvent.groupBy({
      by: ['eventType'],
      where: whereClause,
      _count: { id: true },
      orderBy: { eventType: 'asc' }
    });

    res.status(200).json({
      data: events,
      summary: formattedSummary,
      eventsByDay: eventsByDay,
      totalEvents: events.length
    });
  } catch (error) {
    console.error('Get custom events error:', error);
    res.status(500).json({
      error: 'Failed to fetch custom events',
      details: error.message,
    });
  }
};