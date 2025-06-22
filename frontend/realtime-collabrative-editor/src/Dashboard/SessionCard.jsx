import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faPlay, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Added faTrash and faSpinner
import api from "../services/axios"
import toast from 'react-hot-toast';
// --- SessionCard Component ---
const SessionCard = ({ session, onJoin, onDelete }) => {
    // State to manage loading during deletion
    const [isDeleting, setIsDeleting] = useState(false);

    // Format the creation date for display
    console.log(session.createdAt)
    

    // Handle Join button click
    const handleJoinClick = () => {
        // This calls the 'onJoin' function received from the parent component
        onJoin(session.sessionId);
    };

    // Handle Delete button click with confirmation and loading state
    const handleDeleteClick = async () => {
        // Show a confirmation dialog before proceeding with deletion
        if (window.confirm(`Are you sure you want to delete session "${session.sessionId || session.sessionId}"? This action cannot be undone.`)) {
            setIsDeleting(true); // Set loading state to true (shows spinner, disables button)
            
            try {
                // This calls the 'onDelete' function received from the parent component
                await onDelete(session.sessionId); 
               

            } catch (error) {
                console.error("Error during session deletion in SessionCard:", error);
                // The parent component's onDelete function should handle user-facing toasts for success/failure
            } finally {
                setIsDeleting(false); // Reset loading state regardless of outcome (always hides spinner, re-enables button)
            }
        }
    };

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Session Name */}
            <h3 className="text-2xl font-bold text-blue-400 mb-2 truncate" title={session.sessionName}>
                {session.sessionName}
            </h3>

            {/* Session ID */}
            <div className="text-sm text-gray-400 mb-4 flex items-center">
                <span className="font-semibold mr-2">ID:</span>
                <span className="font-mono text-blue-300 text-sm break-all">{session.sessionId}</span>
            </div>

            {/* Creation Date */}
            <div className="text-xs text-gray-500 flex items-center mb-6">
                <span className="font-semibold mr-2">Created:</span>
                {session.createdAt[0]+"-"+session.createdAt[1]+"-"+session.createdAt[2]}
            </div>

            {/* Buttons Container */}
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-700">
                {/* Join Button */}
                <button
                    onClick={handleJoinClick}
                    className="flex-1 mr-2 py-2 px-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center text-sm"
                >
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Join
                </button>

                {/* Delete Button */}
                <button
                    onClick={handleDeleteClick}
                    disabled={isDeleting} // Disable button while deleting
                    className="flex-1 ml-2 py-2 px-2 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg hover:from-red-700 hover:to-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? (
                        <FontAwesomeIcon icon={faSpinner} spin className="mr-2" /> // Show spinner during deletion
                    ) : (
                        <FontAwesomeIcon icon={faTrash} className="mr-2" /> // Show trash icon
                    )}
                    Delete
                </button>
            </div>
        </div>
    );
};

// --- SessionCardSkeleton Component (unchanged) ---
export const SessionCardSkeleton = () => {
    return (
        <div className="bg-gray-700 p-6 rounded-xl shadow-lg animate-pulse border border-gray-600">
            <div className="h-6 bg-gray-600 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-600 rounded w-1/3 mb-6"></div>
            <div className="h-12 bg-gray-600 rounded w-full"></div>
        </div>
    );
};

export default SessionCard;