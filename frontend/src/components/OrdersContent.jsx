import React from 'react';

const OrdersContent = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Orders Management</h2>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option>All Orders</option>
                  <option>Pending</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-4">
                Order data will appear here once you sync data from your Shopify store (xeno-test-assignment.myshopify.com).
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-700">
                  <strong>Order features include:</strong><br/>
                  • Real-time order tracking<br/>
                  • Order status management<br/>
                  • Revenue analytics<br/>
                  • Performance insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersContent;