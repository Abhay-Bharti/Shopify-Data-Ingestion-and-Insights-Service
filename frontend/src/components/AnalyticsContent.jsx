import React from 'react';

const AnalyticsContent = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Advanced Analytics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Revenue Analytics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Revenue Analytics</h3>
            <div className="text-gray-600">
              <p>• Monthly revenue trends</p>
              <p>• Year-over-year comparison</p>
              <p>• Revenue by product category</p>
            </div>
          </div>

          {/* Customer Analytics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Customer Analytics</h3>
            <div className="text-gray-600">
              <p>• Customer lifetime value</p>
              <p>• Acquisition channels</p>
              <p>• Retention rates</p>
            </div>
          </div>

          {/* Product Analytics */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Product Analytics</h3>
            <div className="text-gray-600">
              <p>• Best performing products</p>
              <p>• Inventory turnover</p>
              <p>• Seasonal trends</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Shopify Store Ready</h3>
          <p className="text-blue-700">
            Your Shopify store (xeno-test-assignment.myshopify.com) is configured. Advanced analytics features will be available once you sync your store data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;