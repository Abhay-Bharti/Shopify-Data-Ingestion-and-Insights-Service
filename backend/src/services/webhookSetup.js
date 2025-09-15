import { ShopifyService } from './shopifyService.js';
import dotenv from 'dotenv';

dotenv.config();

export class WebhookSetupService {
  constructor() {
    this.shopifyService = new ShopifyService({
      store: process.env.SHOPIFY_STORE_URL,
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecret: process.env.SHOPIFY_API_SECRET,
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN
    });
    
    // Auto-select webhook URL based on environment
    this.webhookBaseUrl = this.getWebhookBaseUrl();
  }

  getWebhookBaseUrl() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'production') {
      return process.env.WEBHOOK_BASE_URL_PROD || process.env.WEBHOOK_BASE_URL || 'https://your-production-domain.com/api/webhooks';
    } else {
      return process.env.WEBHOOK_BASE_URL_DEV || process.env.WEBHOOK_BASE_URL || 'https://your-ngrok-url.ngrok.io/api/webhooks';
    }
  }

  async setupAllWebhooks() {
    console.log('🔧 Setting up Shopify webhooks...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Webhook Base URL: ${this.webhookBaseUrl}`);
    
    const webhooks = [
      // Customer webhooks
      {
        topic: 'customers/create',
        address: `${this.webhookBaseUrl}/customers/create`
      },
      {
        topic: 'customers/update',
        address: `${this.webhookBaseUrl}/customers/update`
      },
      
      // Product webhooks
      {
        topic: 'products/create',
        address: `${this.webhookBaseUrl}/products/create`
      },
      {
        topic: 'products/update',
        address: `${this.webhookBaseUrl}/products/update`
      },
      
      // Order webhooks
      {
        topic: 'orders/create',
        address: `${this.webhookBaseUrl}/orders/create`
      },
      {
        topic: 'orders/updated',
        address: `${this.webhookBaseUrl}/orders/update`
      },
      {
        topic: 'orders/paid',
        address: `${this.webhookBaseUrl}/orders/update`
      },
      
      // Optional: Checkout events (bonus)
      {
        topic: 'checkouts/create',
        address: `${this.webhookBaseUrl}/checkouts/create`
      }
    ];

    const results = [];
    
    for (const webhook of webhooks) {
      try {
        const result = await this.createWebhook(webhook.topic, webhook.address);
        results.push({
          topic: webhook.topic,
          success: true,
          id: result.id,
          address: webhook.address
        });
        console.log(`✅ Created webhook: ${webhook.topic} -> ${webhook.address}`);
      } catch (error) {
        results.push({
          topic: webhook.topic,
          success: false,
          error: error.message,
          address: webhook.address
        });
        console.error(`❌ Failed to create webhook ${webhook.topic}:`, error.message);
      }
    }
    
    return results;
  }

  async createWebhook(topic, address) {
    try {
      const session = this.shopifyService.createShopifySession(this.shopifyService.shop);
      const client = new this.shopifyService.shopify.clients.Rest({ session });

      const response = await client.post({
        path: 'webhooks',
        data: {
          webhook: {
            topic: topic,
            address: address,
            format: 'json'
          }
        }
      });

      return response.body.webhook;
    } catch (error) {
      throw new Error(`Failed to create webhook for ${topic}: ${error.message}`);
    }
  }

  async listWebhooks() {
    try {
      const session = this.shopifyService.createShopifySession(this.shopifyService.shop);
      const client = new this.shopifyService.shopify.clients.Rest({ session });

      const response = await client.get({
        path: 'webhooks'
      });

      return response.body.webhooks;
    } catch (error) {
      throw new Error(`Failed to list webhooks: ${error.message}`);
    }
  }

  async deleteWebhook(webhookId) {
    try {
      const session = this.shopifyService.createShopifySession(this.shopifyService.shop);
      const client = new this.shopifyService.shopify.clients.Rest({ session });

      await client.delete({
        path: `webhooks/${webhookId}`
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to delete webhook ${webhookId}: ${error.message}`);
    }
  }

  async deleteAllWebhooks() {
    try {
      const webhooks = await this.listWebhooks();
      const results = [];

      for (const webhook of webhooks) {
        try {
          await this.deleteWebhook(webhook.id);
          results.push({
            id: webhook.id,
            topic: webhook.topic,
            success: true
          });
          console.log(`✅ Deleted webhook: ${webhook.topic} (ID: ${webhook.id})`);
        } catch (error) {
          results.push({
            id: webhook.id,
            topic: webhook.topic,
            success: false,
            error: error.message
          });
          console.error(`❌ Failed to delete webhook ${webhook.id}:`, error.message);
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to delete webhooks: ${error.message}`);
    }
  }
}

// CLI usage for setup
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new WebhookSetupService();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'setup':
      console.log('Setting up all webhooks...');
      service.setupAllWebhooks().then(results => {
        console.log('\n📊 Setup Results:');
        results.forEach(result => {
          if (result.success) {
            console.log(`✅ ${result.topic}: ${result.address}`);
          } else {
            console.log(`❌ ${result.topic}: ${result.error}`);
          }
        });
      }).catch(console.error);
      break;
      
    case 'list':
      console.log('Listing existing webhooks...');
      service.listWebhooks().then(webhooks => {
        console.log('\n📋 Existing Webhooks:');
        webhooks.forEach(webhook => {
          console.log(`- ${webhook.topic}: ${webhook.address} (ID: ${webhook.id})`);
        });
      }).catch(console.error);
      break;
      
    case 'delete-all':
      console.log('Deleting all webhooks...');
      service.deleteAllWebhooks().then(results => {
        console.log('\n🗑️ Deletion Results:');
        results.forEach(result => {
          if (result.success) {
            console.log(`✅ Deleted: ${result.topic}`);
          } else {
            console.log(`❌ Failed: ${result.topic} - ${result.error}`);
          }
        });
      }).catch(console.error);
      break;
      
    default:
      console.log(`
🔧 Shopify Webhook Setup Tool

Usage:
  node src/services/webhookSetup.js <command>

Commands:
  setup       - Create all webhooks
  list        - List existing webhooks  
  delete-all  - Delete all webhooks

Example:
  node src/services/webhookSetup.js setup
      `);
  }
}