// src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Remember to install this: npm install jwt-decode
import api from '../services/axios'; // Make sure this path is correct relative to App.jsx

// Import the new layout and content components
import AnimatedBackground from '../background/AnimatedBackground'
import Sidebar from './Sidebar';
import MainContentArea from './MainContentArea';
import toast from 'react-hot-toast';


function Dashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  // New state to manage active section
  const [activeSection, setActiveSection] = useState('your_sessions'); // Default to showing existing sessions

  const handleApiError = useCallback((error, contextMessage) => {
    console.error(`${contextMessage}:`, error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      alert("Session expired. Please log in again.");
      logout();
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    navigate('/auth'); // Ensure this matches your login route
  }, [navigate]);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ username: decodedToken.sub || 'N/A', email: decodedToken.email || 'N/A' });
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    } else {
      setUser(null);
      navigate('/auth');
    }
  }, [token, logout, navigate]);

  const fetchUserSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const response = await api.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      handleApiError(error, "Error fetching sessions");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [handleApiError]);

  useEffect(() => {
    if (user && token) {
      fetchUserSessions();
    }
  }, [user, token, fetchUserSessions]);

const handleDeleteSession=useCallback(async (sessionId)=>{
  try{
   const res=await api.delete(`api/sessions/${sessionId}`)
 window.location.reload();
  }
  catch{
    toast.error("While deleting the session got error!")
  }

})

  const handleJoinSession = useCallback((sessionId) => {
    
    navigate(`/editor/${sessionId}`); 
  }, [navigate]);

  const addSessionToList = useCallback((newSession) => {
    setSessions((prevSessions) => [...prevSessions, newSession]);
    // Optionally, switch to 'your_sessions' after creating a new one
    setActiveSection('your_sessions');
  }, []);

  return (
    <div className="flex flex-col md:flex-row   text-white font-inter ">
      <AnimatedBackground></AnimatedBackground>
      {/* Sidebar - Pass activeSection and setActiveSection */}
      <Sidebar
        user={user}
        onLogout={logout}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Area - Pass activeSection and all necessary data/handlers */}
      <MainContentArea
        activeSection={activeSection}
        user={user}
        sessions={sessions}
        loadingSessions={loadingSessions}
        handleApiError={handleApiError}
        addSessionToList={addSessionToList}
        handleJoinSession={handleJoinSession}
        handleDeleteSession={handleDeleteSession}
      />
    </div>
  );
}

export default Dashboard;