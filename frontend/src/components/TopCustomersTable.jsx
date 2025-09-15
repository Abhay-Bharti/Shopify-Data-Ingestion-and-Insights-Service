import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const TopCustomersTable = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('totalRevenue');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    async function fetchTopCustomers() {
      try {
        setLoading(true);
        const data = await apiService.getTopCustomers();
        setCustomers(data.customers || []);
        
        // Check if there's a no data message
        if (data.message && data.message.includes('No tenant associated')) {
          setError('no-tenant');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTopCustomers();
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedCustomers = [...customers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error === 'no-tenant') {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Customer Data Available</h4>
          <p className="text-gray-600">
            Sync data from your Shopify store (xeno-test-assignment.myshopify.com) to see your top customers and their analytics.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error loading customers: {error}</p>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h4>
          <p className="text-gray-600">
            No customer data available yet. Data will appear here after syncing with your Shopify store.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200">
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Customer Name</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>Email</span>
                  {getSortIcon('email')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('orderCount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Orders</span>
                  {getSortIcon('orderCount')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('totalRevenue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Revenue</span>
                  {getSortIcon('totalRevenue')}
                </div>
              </th>
              <th 
                className="text-left py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('lastOrderDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Order</span>
                  {getSortIcon('lastOrderDate')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              sortedCustomers.map((customer, index) => (
                <tr key={customer.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600">{customer.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {customer.orderCount}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(customer.totalRevenue)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-gray-600">
                      {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : 'N/A'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {sortedCustomers.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {sortedCustomers.length} customers
        </div>
      )}
    </div>
  );
};

export default TopCustomersTable;