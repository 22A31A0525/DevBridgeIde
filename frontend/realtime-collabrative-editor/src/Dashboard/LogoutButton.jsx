// src/components/LogoutButton.jsx
import React from 'react';

const LogoutButton = ({ onLogout }) => {
  return (
    <button
      onClick={onLogout}
      className="w-full px-8 py-4 bg-gradient-to-r from-red-500 to-rose-800 text-white font-bold text-xl rounded-lg hover:from-red-700 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
    >
      Logout
    </button>
  );
};

export default LogoutButton;