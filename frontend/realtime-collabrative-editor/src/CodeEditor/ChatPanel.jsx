import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ChatPanel = ({
    chatMessages,
    currentChatMessage,
    setCurrentChatMessage,
    handleSendChatMessage,
    chatMessagesEndRef,
    username,
    connectionStatus
}) => {
    return (
        
        <div className="flex flex-col flex-grow min-h-0 max-h-full">
          
            {/* Chat Header */}
            <div className="bg-gray-700 px-4 py-2 font-semibold text-white border-b border-gray-600 flex items-center">
                <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-blue-400" />
                Chat
            </div>

            {/* Chat Messages Display Area */}
            {/* This is the core scrolling area for messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-3 min-h-0 custom-scrollbar">
              
               {/* Conditional rendering: If no messages, show a placeholder message */}
                {chatMessages.length === 0 ? (
                    <p className="text-gray-400 text-center">No messages yet. Say hello!</p>
                ) : (
                    // Iterate over chatMessages array to display each message
                    chatMessages.map((msg, index) => (
                        // Each message container, aligned based on sender (current user or other)
                        <div key={index} className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}>
                            {/* Message bubble styling */}
                            <div className={`rounded-lg p-2 max-w-[80%] ${msg.user === username ? 'bg-blue-600 text-white self-end' : 'bg-gray-700 text-gray-200 self-start'}`}>
                                {/* Message header with sender username and timestamp */}
                                <div className="font-semibold text-sm mb-1 flex justify-between items-center">
                                    <span className={`${msg.user === username ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {msg.user === username ? 'You' : msg.user} {/* Display 'You' for current user's messages */}
                                    </span>
                                    <span className="text-xs text-gray-400 ml-2">{msg.timestamp}</span>
                                </div>
                                {/* Message content */}
                                <p className="text-sm break-words">{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
                {/* Ref for auto-scrolling to the latest message */}
                <div ref={chatMessagesEndRef} /> 
            </div>

            {/* Chat Input Form: Contains the text input and send button */}
            <form onSubmit={handleSendChatMessage} className="border-t border-gray-700 p-3 flex">
                <input
                    type="text"
                    value={currentChatMessage}
                    onChange={(e) => setCurrentChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                    disabled={connectionStatus !== 'connected'}
                />
                <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-r-lg px-4 py-2 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!currentChatMessage.trim() || connectionStatus !== 'connected'}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;
