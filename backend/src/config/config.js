import dotenv from 'dotenv';

dotenv.config();

export class ConfigService {
  static getWebhookBaseUrl() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'production') {
      return process.env.WEBHOOK_BASE_URL_PROD || process.env.WEBHOOK_BASE_URL || 'https://your-production-domain.com/api/webhooks';
    } else {
      return process.env.WEBHOOK_BASE_URL_DEV || process.env.WEBHOOK_BASE_URL || 'https://your-ngrok-url.ngrok.io/api/webhooks';
    }
  }

  static getFrontendUrl() {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'production') {
      return process.env.FRONTEND_URL || 'https://your-frontend-domain.com';
    } else {
      return process.env.FRONTEND_URL || 'http://localhost:5173';
    }
  }

  static getEnvironment() {
    return process.env.NODE_ENV || 'development';
  }

  static isDevelopment() {
    return this.getEnvironment() === 'development';
  }

  static isProduction() {
    return this.getEnvironment() === 'production';
  }

  static logConfig() {
    console.log('🔧 Application Configuration:');
    console.log(`📍 Environment: ${this.getEnvironment()}`);
    console.log(`🔗 Webhook Base URL: ${this.getWebhookBaseUrl()}`);
    console.log(`🌐 Frontend URL: ${this.getFrontendUrl()}`);
    console.log(`🏪 Shopify Store: ${process.env.SHOPIFY_STORE_URL}`);
  }
}

export default ConfigService;