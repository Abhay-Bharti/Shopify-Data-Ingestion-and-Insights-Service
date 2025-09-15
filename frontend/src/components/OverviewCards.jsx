import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiRefreshCw } from 'react-icons/fi';

const OverviewCards = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      try {
        const data = await apiService.getAnalyticsSummary();
        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const handleSyncData = async () => {
    try {
      setSyncLoading(true);
      const result = await apiService.syncShopifyData();
      alert(`Sync successful! Synced ${result.synced.customers} customers and ${result.synced.orders} orders from ${result.store}`);
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      alert(`Sync failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <p className="text-red-600">Error loading overview: {error}</p>
      </div>
    );
  }

  // Check if user has no tenant (no data available)
  const hasNoData = summary?.message && summary.message.includes('No tenant associated');

  if (hasNoData) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-8 mb-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FiRefreshCw className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">Shopify Store Ready</h3>
          <p className="text-blue-700 mb-6 max-w-md mx-auto">
            Your Shopify store (xeno-test-assignment.myshopify.com) is configured. Sync your data to start seeing analytics.
          </p>
          <button 
            onClick={handleSyncData}
            disabled={syncLoading}
            className={`inline-flex items-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              syncLoading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {syncLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <FiRefreshCw className="mr-2 h-4 w-4" />
                Sync Store Data
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Customers</h3>
            <p className="text-3xl font-bold text-gray-900">{summary?.totalCustomers.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUsers className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-green-600">
          <FiTrendingUp className="h-4 w-4 mr-1" />
          <span>Active customers</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{summary?.totalOrders.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <FiShoppingBag className="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-green-600">
          <FiTrendingUp className="h-4 w-4 mr-1" />
          <span>All time orders</span>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">${summary?.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <FiDollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm text-green-600">
          <FiTrendingUp className="h-4 w-4 mr-1" />
          <span>Total earnings</span>
        </div>
      </div>
    </div>
  );
};

export default OverviewCards;