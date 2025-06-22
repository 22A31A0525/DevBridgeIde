// src/components/JoinSessionForm.jsx
import React, { useState } from 'react';
import Loading from '../background/Loading';

const JoinSessionForm = ({ onJoin, handleApiError }) => {
  const [joinSessionId, setJoinSessionId] = useState('');
  const [joiningSession, setJoiningSession] = useState(false);

  const handleJoinSessionDirectly = async (e) => {
    e.preventDefault();
    if (!joinSessionId.trim()) {
      alert("Session ID cannot be empty.");
      return;
    }
    setJoiningSession(true);
    try {
      console.log(`Attempting to join session: ${joinSessionId}`);
      onJoin(joinSessionId);
    } catch (error) {
      handleApiError(error, "Error joining session directly");
    } finally {
      setJoiningSession(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 animate-slide-in-up delay-300">
      <h2 className="text-3xl font-bold text-white mb-6">Join an Existing Session</h2>
      <form onSubmit={handleJoinSessionDirectly} className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Enter a session ID"
          value={joinSessionId}
          onChange={(e) => setJoinSessionId(e.target.value)}
          className="flex-1 p-4 rounded-lg bg-gray-900 text-gray-50 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-lg"
          disabled={joiningSession}
        />
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
          disabled={joiningSession}
        >
      Join
        </button>
        {
          joiningSession?(<Loading/>):("")}
      </form>
    </div>
  );
};

export default JoinSessionForm;