// src/components/MainContentArea.jsx
import React from 'react';
import CreateSessionForm from './CreateSessionForm'; // Make sure these paths are correct
import ExistingSessionsList from './ExistingSessionsList';
import JoinSessionForm from './JoinSessionForm';

const MainContentArea = ({
  activeSection, // New prop to determine which content to show
  user,
  sessions,
  loadingSessions,
  handleApiError,
  addSessionToList,
  handleJoinSession,
  handleDeleteSession,
}) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'create_session':
        return (
          <CreateSessionForm
            handleApiError={handleApiError}
            addSessionToList={addSessionToList}
          />
        );
      case 'your_sessions':
        return (
          <ExistingSessionsList
            sessions={sessions}
            loadingSessions={loadingSessions}
            onJoin={handleJoinSession}
            onDelete={handleDeleteSession}
          />
        );
      case 'join_session':
        return (
          <JoinSessionForm
            onJoin={handleJoinSession}
            handleApiError={handleApiError}
          />
        );
      default:
        return (
          <div className=" p-8 rounded-xl shadow-lg border border-gray-700 text-center text-gray-400 text-xl">
            <p className="mb-4">Select an option from the sidebar to get started!</p>
            <p>📚 **Your Sessions** to view existing ones.</p>
            <p>✨ **Create New Session** to start a new collaboration.</p>
            <p>🔗 **Join by ID** to enter a specific session.</p>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 p-8 md:p-12  overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-12 pb-10">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainContentArea;