// src/components/CreateSessionForm.jsx
import React, { useState } from 'react';
 // Make sure this path is correct relative to CreateSessionForm.jsx
import api from '../services/axios'; // Make sure this path is correct relative to CreateSessionForm.jsx
import { useNavigate } from 'react-router';
import Loading from '../background/Loading';
const CreateSessionForm = ({ handleApiError, addSessionToList }) => {
  const [newSessionName, setNewSessionName] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const navigate=useNavigate()
  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!newSessionName.trim()) {
      alert("Session name cannot be empty.");
      return;
    }

    setCreatingSession(true);
    try {
      const response = await api.post('/api/sessions', { sessionName: newSessionName });
      addSessionToList(response.data);
      setNewSessionName('');
      alert("Session created successfully!");
      navigate(`/editor/${response.data.sessionId}`);
    } catch (error) {
      handleApiError(error, "Error creating session");
    } finally {
      setCreatingSession(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700 animate-slide-in-up">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
        <span className="mr-3 text-green-400 text-4xl">🚀</span> Start a New Session
      </h2>
      <form onSubmit={handleCreateSession} className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Give your session a name (e.g., 'Project Alpha')"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          className="flex-1 p-4 rounded-lg bg-gray-900 text-gray-50 placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-lg"
          disabled={creatingSession}
        />
        <button
          type="submit"
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold text-lg rounded-lg hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center"
          disabled={creatingSession}
        >
          Create
        
        </button>
        {
creatingSession?(<Loading/>):(" ")
        }
      </form>
    </div>
  );
};

export default CreateSessionForm;