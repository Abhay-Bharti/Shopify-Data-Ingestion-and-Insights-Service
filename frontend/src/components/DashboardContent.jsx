import React, { useState } from 'react';
import { apiService } from '../services/api';
import { FiRefreshCw, FiUsers, FiShoppingBag, FiPackage } from 'react-icons/fi';

const DashboardContent = () => {
  const [syncLoading, setSyncLoading] = useState(false);

  const handleSyncData = async () => {
    try {
      setSyncLoading(true);
      const result = await apiService.syncShopifyData();
      alert(`Sync successful! Synced ${result.synced.customers} customers, ${result.synced.products} products, and ${result.synced.orders} orders from ${result.store}`);
      // Refresh the page to show new data
      window.location.reload();
    } catch (error) {
      console.error('Sync failed:', error);
      alert(`Sync failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl shadow-sm border border-blue-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Xeno Analytics</h2>
        <p className="text-gray-600 text-lg">
          Monitor your Shopify store performance with detailed analytics on customers, products, and orders.
          Use the navigation menu to explore different sections.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-center">Quick Actions</h3>
        <div className="flex justify-center">
          <button 
            onClick={handleSyncData}
            disabled={syncLoading}
            className={`inline-flex items-center px-8 py-4 rounded-lg text-base font-medium transition-all duration-200 ${
              syncLoading 
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {syncLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <FiRefreshCw className="mr-3 h-5 w-5" />
                Sync Store Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Guide */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 text-center">Analytics Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FiUsers className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Customers</h4>
            </div>
            <p className="text-sm text-gray-600">View customer analytics, spending patterns, and detailed customer insights.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <FiPackage className="h-5 w-5 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Products</h4>
            </div>
            <p className="text-sm text-gray-600">Analyze product performance, pricing trends, and inventory insights.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <FiShoppingBag className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900">Orders</h4>
            </div>
            <p className="text-sm text-gray-600">Track order trends, revenue analytics, and sales performance metrics.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;