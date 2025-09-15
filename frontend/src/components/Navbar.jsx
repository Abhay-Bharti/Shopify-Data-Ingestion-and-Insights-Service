import React from 'react';
import { Link } from 'react-router-dom';
import { FiBarChart2, FiUser, FiLogIn } from 'react-icons/fi';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <FiBarChart2 className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">Shopify Analytics</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <FiLogIn className="h-4 w-4" />
              <span>Login</span>
            </Link>
            <Link
              to="/signup"
              className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <FiUser className="h-4 w-4" />
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;