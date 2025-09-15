import React from 'react';

const ProductsContent = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Management</h2>
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Product Catalog</h3>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Add Product
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏷️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Yet</h3>
              <p className="text-gray-600 mb-4">
                Product data will be imported from your Shopify store (xeno-test-assignment.myshopify.com) once synced.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-gray-700">
                  <strong>Product features include:</strong><br/>
                  • Inventory management<br/>
                  • Performance analytics<br/>
                  • Price optimization<br/>
                  • Category management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsContent;