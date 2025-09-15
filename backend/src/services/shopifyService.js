import { shopifyApi, ApiVersion } from '@shopify/shopify-api';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-10';
import '@shopify/shopify-api/adapters/node';

// Debug environment variables
console.log('Shopify API Key:', process.env.SHOPIFY_API_KEY ? 'Set' : 'Not set');
console.log('Shopify API Secret:', process.env.SHOPIFY_API_SECRET ? 'Set' : 'Not set');
console.log('Shopify Access Token:', process.env.SHOPIFY_ACCESS_TOKEN ? 'Set' : 'Not set');

// Initialize Shopify API
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_orders', 'read_customers', 'read_products'],
  hostName: process.env.SHOPIFY_APP_URL || 'localhost:3001',
  apiVersion: ApiVersion.October24,
  isEmbeddedApp: false,
  restResources,
});

// Create a session for API calls
const createShopifySession = (shop) => {
  return {
    id: `offline_${shop}`,
    shop: shop,
    state: 'offline',
    isOnline: false,
    accessToken: process.env.SHOPIFY_ACCESS_TOKEN, // For private apps or after OAuth
  };
};

export class ShopifyService {
  constructor(config) {
    this.config = config;
    // Keep the full shop URL with .myshopify.com domain
    let shopUrl = config.shopUrl.replace('https://', '').replace('http://', '');
    
    // Ensure it has .myshopify.com if not already present
    if (!shopUrl.includes('.myshopify.com')) {
      shopUrl = `${shopUrl}.myshopify.com`;
    }
    
    this.shop = shopUrl;
    this.shopify = shopify;
  }

  createShopifySession(shop) {
    return createShopifySession(shop);
  }

  async getCustomers(limit = 250, sinceId) {
    try {
      const session = createShopifySession(this.shop);
      const client = new shopify.clients.Rest({ session });

      const params = { limit };
      if (sinceId) params.since_id = sinceId;

      console.log(`Fetching customers from ${this.shop}...`);
      const response = await client.get({ 
        path: 'customers',
        query: params
      });

      return response.body.customers || [];
    } catch (error) {
      console.error('Error fetching Shopify customers:', error);
      throw new Error(`Failed to fetch customers from Shopify: ${error.response?.data?.errors || error.message}`);
    }
  }

  async getOrders(limit = 250, sinceId) {
    try {
      const session = createShopifySession(this.shop);
      const client = new shopify.clients.Rest({ session });

      const params = { 
        limit,
        status: 'any',
        financial_status: 'any',
      };
      if (sinceId) params.since_id = sinceId;

      console.log(`Fetching orders from ${this.shop}...`);
      const response = await client.get({ 
        path: 'orders',
        query: params
      });

      return response.body.orders || [];
    } catch (error) {
      console.error('Error fetching Shopify orders:', error);
      throw new Error(`Failed to fetch orders from Shopify: ${error.response?.data?.errors || error.message}`);
    }
  }

  async getProducts(limit = 250, sinceId) {
    try {
      const session = createShopifySession(this.shop);
      const client = new shopify.clients.Rest({ session });

      const params = { limit };
      if (sinceId) params.since_id = sinceId;

      console.log(`Fetching products from ${this.shop}...`);
      const response = await client.get({ 
        path: 'products',
        query: params
      });

      return response.body.products || [];
    } catch (error) {
      console.error('Error fetching Shopify products:', error);
      throw new Error(`Failed to fetch products from Shopify: ${error.response?.data?.errors || error.message}`);
    }
  }

  async testConnection() {
    try {
      const session = createShopifySession(this.shop);
      const client = new shopify.clients.Rest({ session });

      console.log(`Testing connection to ${this.shop}...`);
      const response = await client.get({ path: 'shop' });

      return {
        success: true,
        shop: response.body.shop,
        message: 'Connection successful'
      };
    } catch (error) {
      console.error('Error testing Shopify connection:', error);
      return {
        success: false,
        error: error.message,
        message: 'Connection failed'
      };
    }
  }
}