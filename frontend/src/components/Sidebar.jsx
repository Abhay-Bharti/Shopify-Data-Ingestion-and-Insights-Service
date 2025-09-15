import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiShoppingBag, 
  FiPackage,
  FiMenu,
  FiX,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'customers', label: 'Customers', icon: FiUsers },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'products', label: 'Products', icon: FiPackage },
  ];

  return (
    <div className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col shadow-xl`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Shopify Analytics
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isCollapsed ? (
              <FiChevronRight className="h-5 w-5" />
            ) : (
              <FiChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 group ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-105'
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-colors duration-200`} />
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                  {activeTab === item.id && !isCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <FiLogOut className={`h-5 w-5 ${isCollapsed ? '' : 'mr-3'} transition-colors duration-200`} />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;