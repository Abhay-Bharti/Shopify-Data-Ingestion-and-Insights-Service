import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiService {
  constructor(apiKey = 'demo_api_key_1') {
    this.apiKey = apiKey;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async getAnalyticsSummary() {
    const response = await axios.get(`${API_BASE_URL}/api/analytics/summary`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getOrdersByDate(from, to) {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await axios.get(`${API_BASE_URL}/api/analytics/orders-by-date?${params}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getTopCustomers(limit = 5) {
    const response = await axios.get(`${API_BASE_URL}/api/analytics/top-customers?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getTopProducts(limit = 5) {
    const response = await axios.get(`${API_BASE_URL}/api/analytics/top-products?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async ingestCustomers() {
    const response = await axios.post(`${API_BASE_URL}/api/ingest/customers`, {}, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async ingestProducts() {
    const response = await axios.post(`${API_BASE_URL}/api/ingest/products`, {}, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async ingestOrders() {
    const response = await axios.post(`${API_BASE_URL}/api/ingest/orders`, {}, {
      headers: this.getHeaders(),
    });
    return response.data;
  }
}

export const apiService = new ApiService();