// src/components/Sidebar.jsx
import React from 'react';
import { motion } from 'framer-motion'; // Import motion for animations
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBookOpen, // For Your Sessions
  faPlusCircle, // For Create New Session
  faLink, // For Join by ID
  faUserCircle, // For user avatar/icon
  faSignOutAlt // For Logout button
} from '@fortawesome/free-solid-svg-icons';

import LogoutButton from './LogoutButton'; // Make sure this path is correct

// Animation variants for the sidebar and its children
const sidebarVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1, // Stagger items inside the sidebar
    },
  },
};

const navItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const logoVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
};


const Sidebar = ({ user, onLogout, activeSection, setActiveSection }) => {
  const NavButton = ({ sectionName, icon, label }) => (
    <motion.button
      onClick={() => setActiveSection(sectionName)}
      className={`flex items-center w-full px-5 py-3 rounded-xl text-lg font-medium transition-all duration-300 gap-3
                  ${activeSection === sectionName
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-100'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transform hover:scale-[1.02]'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800`}
      variants={navItemVariants} // Apply animation variants
      whileHover={{ scale: 1.05, boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.3)" }} // Hover effect
      whileTap={{ scale: 0.95 }} // Click effect
    >
      <FontAwesomeIcon icon={icon} className="text-xl" /> {/* Font Awesome icon */}
      {label}
    </motion.button>
  );

  return (
    <motion.aside
      className="w-full md:w-80 flex flex-col p-6 md:p-8 bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl relative z-10 border-r border-gray-700 rounded-r-2xl"
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Brand Logo/Title */}
      <motion.div className="text-center md:text-left mb-10" variants={logoVariants}>
        <h1 className="text-4xl font-extrabold text-blue-400 mb-2 tracking-tight">
          Dev<span className="text-purple-400">Bridge</span>
        </h1>
        <p className="text-xl font-semibold text-gray-300">IDE</p>
      </motion.div>

      {/* User Information */}
      <motion.div className="mb-10 p-4 bg-gray-700 rounded-lg flex items-center gap-4 border border-gray-600" variants={navItemVariants}>
        <FontAwesomeIcon icon={faUserCircle} className="text-3xl text-green-400" />
        <div>
          <p className="text-md text-gray-400">Welcome,</p>
          <p className="text-xl font-semibold text-white">{user ? user.username : 'Guest'}</p>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <nav className="flex flex-col gap-4 mb-auto">
        <NavButton
          sectionName="your_sessions"
          icon={faBookOpen} // Using Font Awesome icon
          label="Your Sessions"
        />
        <NavButton
          sectionName="create_session"
          icon={faPlusCircle} // Using Font Awesome icon
          label="Create New Session"
        />
        <NavButton
          sectionName="join_session"
          icon={faLink} // Using Font Awesome icon
          label="Join by ID"
        />
      </nav>

      {/* Logout Button (at the bottom) */}
      <div className="mt-8">
        <LogoutButton onLogout={onLogout} icon={faSignOutAlt} /> {/* Pass Font Awesome icon */}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
