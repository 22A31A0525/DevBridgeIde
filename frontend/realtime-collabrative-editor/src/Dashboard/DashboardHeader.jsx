// src/components/DashboardHeader.jsx
import React from 'react';

const DashboardHeader = ({ user }) => {
  return (
    <div className="text-center mb-8 animate-fade-in">
      <h1 className="text-5xl font-extrabold text-white mb-2 tracking-wide capitalize">
        Welcome, <span className="text-teal-300 capitalize">{user ? user.username : 'Guest'}!</span>
      </h1>
    </div>
  );
};

export default DashboardHeader;