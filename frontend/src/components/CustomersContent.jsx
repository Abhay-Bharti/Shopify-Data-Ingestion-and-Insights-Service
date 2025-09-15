import React from 'react';

const CustomersContent = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Management</h2>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Customer List</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Add Customer
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Yet</h3>
              <p className="text-gray-600 mb-4">
                Customer data will appear here once you sync data from your Shopify store (xeno-test-assignment.myshopify.com).
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-700">
                  <strong>Next Steps:</strong><br/>
                  1. Click "Sync Store Data" in Dashboard<br/>
                  2. Wait for data synchronization<br/>
                  3. View customer analytics here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersContent;