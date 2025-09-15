import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  constructor() {
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiry
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          // Only redirect if we're not already on login or register pages
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    if (token) {
      this.axios.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      delete this.axios.defaults.headers.Authorization;
    }
  }

  clearAuthToken() {
    delete this.axios.defaults.headers.Authorization;
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.axios.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(name, email, password) {
    const response = await this.axios.post('/api/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  }

  async getProfile() {
    const response = await this.axios.get('/api/auth/profile');
    return response.data;
  }

  async updateProfile(name, email) {
    const response = await this.axios.put('/api/auth/profile', {
      name,
      email,
    });
    return response.data;
  }

  // Analytics endpoints
  async getAnalyticsSummary() {
    const response = await this.axios.get('/api/analytics/summary');
    return response.data;
  }

  // Data fetch endpoints
  async getCustomers() {
    const response = await this.axios.get('/api/analytics/customers');
    return response.data;
  }

  async getProducts() {
    const response = await this.axios.get('/api/analytics/products');
    return response.data;
  }

  async getOrders() {
    const response = await this.axios.get('/api/analytics/orders');
    return response.data;
  }

  // Sync endpoints
  async syncShopifyData() {
    const response = await this.axios.post('/api/sync/shopify');
    return response.data;
  }

  async getOrdersByDate(from, to) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await this.axios.get(`/api/analytics/orders-by-date?${params}`);
    return response.data;
  }

  async getTopCustomers(limit = 5) {
    const response = await this.axios.get(`/api/analytics/top-customers?limit=${limit}`);
    return response.data;
  }

  async getTopProducts(limit = 5) {
    const response = await this.axios.get(`/api/analytics/top-products?limit=${limit}`);
    return response.data;
  }

  // Ingestion endpoints
  async ingestCustomers() {
    const response = await this.axios.post('/api/ingest/customers');
    return response.data;
  }

  async ingestProducts() {
    const response = await this.axios.post('/api/ingest/products');
    return response.data;
  }

  async ingestOrders() {
    const response = await this.axios.post('/api/ingest/orders');
    return response.data;
  }
}

export const apiService = new ApiService();