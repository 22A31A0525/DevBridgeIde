// src/components/ExistingSessionsList.jsx
import React from 'react';
import SessionCard, { SessionCardSkeleton } from './SessionCard'; // Make sure this path is correct

const ExistingSessionsList = ({ sessions, loadingSessions, onJoin,onDelete }) => {
  return (
    <div className=" p-8 rounded-xl shadow-lg border border-gray-700 animate-slide-in-up delay-200 bg-gray-800">
      <h2 className="text-3xl font-bold text-white mb-8">Your Active Sessions</h2>
      {loadingSessions ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-gray-400 text-center text-xl p-4">
          No sessions found. Create a new one to get started!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard key={session.sessionId} session={session} onJoin={onJoin} onDelete={onDelete}/>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExistingSessionsList;