import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import CustomersPage from '../components/CustomersPage';
import OrdersPage from '../components/OrdersPage';
import ProductsPage from '../components/ProductsPage';
import { FiUser, FiMail } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'customers':
        return <CustomersPage />;
      case 'orders':
        return <OrdersPage />;
      case 'products':
        return <ProductsPage />;
      default:
        return <DashboardContent />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'customers':
        return 'Customer Analytics';
      case 'orders':
        return 'Order Analytics';
      case 'products':
        return 'Product Analytics';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {getPageTitle()}
                </h1>
                <p className="text-gray-600 mt-1 flex items-center">
                  <FiUser className="h-4 w-4 mr-1" />
                  Welcome back, <span className="font-medium ml-1">{user.name}</span>
                </p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-sm text-gray-600 flex items-center">
                  <FiMail className="h-4 w-4 mr-2" />
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-sm text-gray-600">
            <p>© 2025 Shopify Analytics Dashboard. All rights reserved.</p>
            <div className="flex space-x-4">
              <span className="font-medium">Version 1.0.0</span>
              <span>•</span>
              <span>Last sync: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;