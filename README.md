# Shopify Data Ingestion & Insights Service

A comprehensive multi-tenant Shopify analytics platform that ingests data from Shopify stores and provides rich insights through an interactive dashboard.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │◄──►│   Express API    │◄──►│   PostgreSQL    │
│   (Frontend)    │    │   (Backend)      │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Shopify API    │
                       │   (Data Source)  │
                       └──────────────────┘
```

### Key Components

- **Frontend**: React with Vite, Tailwind CSS, Chart.js
- **Backend**: Node.js with Express, Prisma ORM
- **Database**: PostgreSQL with multi-tenant architecture
- **Integration**: Official Shopify SDK with webhook support
- **Authentication**: JWT-based with tenant isolation

## ✨ Features

### Core Features
- ✅ **Data Ingestion**: Sync customers, orders, and products from Shopify
- ✅ **Real-time Updates**: Webhook endpoints for instant data sync
- ✅ **Multi-tenant Architecture**: Complete tenant isolation with API keys
- ✅ **Authentication**: JWT-based user authentication
- ✅ **Analytics Dashboard**: Interactive charts and insights

### Bonus Features  
- ✅ **Custom Events**: Cart abandonment & checkout tracking
- ✅ **Date Range Filtering**: Analyze data for specific periods
- ✅ **Top Performance Metrics**: Top customers, products by sales
- ✅ **Individual Analytics Pages**: Separate views for customers, products, orders

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account and PostgreSQL database
- Shopify store with private app credentials

### 1. Clone and Install

```bash
git clone <repository-url>
cd xeno

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install
```

### 2. Database Setup (Supabase PostgreSQL)

```bash
cd backend

# 1. Create a Supabase project at https://supabase.com
# 2. Get your connection string from Settings > Database
# 3. Update DATABASE_URL in .env file
# 4. Run database migrations
npx prisma migrate deploy

# 5. Generate Prisma client
npx prisma generate
```

> 📋 **Detailed Supabase Setup**: See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for complete instructions

### 3. Environment Configuration

Create `backend/.env`:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Server
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173

# Shopify Configuration
SHOPIFY_STORE_URL=your-store.myshopify.com
SHOPIFY_API_KEY=your_api_key_here
SHOPIFY_API_SECRET=your_api_secret_here
SHOPIFY_ACCESS_TOKEN=your_access_token_here
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret_here

# Webhook URLs - Environment Specific
# Development (using ngrok or localtunnel for local testing)
WEBHOOK_BASE_URL_DEV=https://your-ngrok-url.ngrok.io/api/webhooks
# Production (your deployed domain)
WEBHOOK_BASE_URL_PROD=https://your-production-domain.com/api/webhooks

# Current webhook URL (automatically set based on NODE_ENV)
WEBHOOK_BASE_URL=https://your-ngrok-url.ngrok.io/api/webhooks
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Shopify App Setup

Follow the detailed guide in `SHOPIFY_SETUP.md` to:

1. Create a private app in your Shopify admin
2. Configure the required API scopes:
   - `read_customers`, `read_products`, `read_orders`
   - `write_customers`, `write_products`, `write_orders`
3. Get your API credentials and update `.env`

### 5. Start the Application

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend  
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Analytics  
- `GET /api/analytics/summary` - Dashboard summary
- `GET /api/analytics/customers` - Customer analytics
- `GET /api/analytics/products` - Product analytics  
- `GET /api/analytics/orders` - Order analytics
- `GET /api/analytics/custom-events` - Custom events data
- `GET /api/analytics/orders-by-date` - Orders by date range
- `GET /api/analytics/top-customers` - Top customers by spend
- `GET /api/analytics/top-products` - Top products by sales

### Data Sync
- `POST /api/sync/shopify` - Manual Shopify data sync

### Webhooks (Real-time sync)
- `POST /api/webhooks/customers/create` - Customer created
- `POST /api/webhooks/customers/update` - Customer updated
- `POST /api/webhooks/products/create` - Product created
- `POST /api/webhooks/products/update` - Product updated
- `POST /api/webhooks/orders/create` - Order created
- `POST /api/webhooks/orders/update` - Order updated
- `POST /api/webhooks/carts/abandoned` - Cart abandonment
- `POST /api/webhooks/checkouts/create` - Checkout started

## 🗄️ Database Schema

```sql
-- Core Tables
users           # User accounts with JWT authentication
tenants         # Shopify stores (multi-tenant isolation)
customers       # Shopify customers per tenant
products        # Shopify products per tenant  
orders          # Shopify orders per tenant
order_items     # Order line items
custom_events   # Cart abandonment, checkout events

-- Key Relationships
User ──► Tenant (1:1)
Tenant ──► Customers (1:N)
Tenant ──► Products (1:N)  
Tenant ──► Orders (1:N)
Tenant ──► Custom Events (1:N)
Order ──► Order Items (1:N)
```

### Multi-Tenant Isolation

- All data tables include `tenantId` for complete isolation
- Users are associated with specific tenants
- API responses filtered by user's tenant automatically
- Webhook endpoints identify tenant from Shopify headers

## 🔧 Webhook Setup

### 1. Configure Webhook URLs in Shopify

In your Shopify admin → Settings → Notifications → Webhooks:

```
Customer creation: https://your-domain.com/api/webhooks/customers/create
Customer updates: https://your-domain.com/api/webhooks/customers/update
Product creation: https://your-domain.com/api/webhooks/products/create
Product updates: https://your-domain.com/api/webhooks/products/update
Order creation: https://your-domain.com/api/webhooks/orders/create
Order updates: https://your-domain.com/api/webhooks/orders/update
```

### 2. Automated Setup (Optional)

Use the webhook setup tool:

```bash
cd backend
node src/services/webhookSetup.js setup
```

## 🚀 Deployment

### Environment Setup

1. **Database**: Set up PostgreSQL on your hosting platform
2. **Environment Variables**: Configure all required variables
3. **Shopify Webhooks**: Update webhook URLs to production domain

### Supported Platforms

- **Heroku**: Node.js + PostgreSQL addon
- **Railway**: Automatic deployment from GitHub
- **Render**: Web service + PostgreSQL  
- **Vercel**: Frontend + Serverless functions
- **AWS/GCP/Azure**: Full control deployment

## 🎯 Usage Examples

### Register New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "securepassword"
  }'
```

### Sync Shopify Data

```bash
curl -X POST http://localhost:3001/api/sync/shopify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Analytics Summary

```bash
curl -X GET http://localhost:3001/api/analytics/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📈 Features Demo

### Dashboard Analytics
- **Total customers, orders, revenue**
- **Orders by date with filtering**  
- **Top 5 customers by spending**
- **Product performance metrics**

### Individual Pages
- **Customers Page**: List, search, customer details
- **Products Page**: Inventory, pricing, performance
- **Orders Page**: Order history, status, customer info

### Custom Events  
- **Cart Abandonment**: Track incomplete purchases
- **Checkout Events**: Monitor conversion funnel

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Webhook Verification**: HMAC signature validation
- **Tenant Isolation**: Complete data separation
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Prisma schema validation

## 🛠️ Development

### Project Structure

```
xeno/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── server.js       # App entry point
│   ├── prisma/             # Database schema
│   └── package.json
├── frontend/               # React application  
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API clients
│   │   └── main.jsx       # App entry point
│   └── package.json
└── README.md
```

### Available Scripts

```bash
# Backend
npm run dev          # Development with nodemon
npm start           # Production start
npm run build       # Build for production

# Frontend  
npm run dev         # Development server
npm run build       # Production build
npm run preview     # Preview production build
```

## 📝 Known Limitations

- **Shopify API Rate Limits**: 40 requests/second per app
- **Database Performance**: Large datasets may need optimization
- **Webhook Reliability**: Depends on network connectivity
- **Real-time Updates**: Limited by Shopify webhook availability

## 🔮 Future Enhancements

- **Email Campaigns**: Cart abandonment email automation
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: React Native companion app
- **Multi-store Support**: Multiple Shopify stores per tenant
- **Data Export**: CSV/PDF report generation

## 📞 Support

For questions and support:

- **Documentation**: Check this README and code comments
- **Issues**: Create GitHub issues for bugs/features
- **Email**: Contact the development team

---

**Built with ❤️ using React, Node.js, and Shopify APIs**