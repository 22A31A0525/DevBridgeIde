import React, { useEffect, useRef, useState, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios'; // Import the custom axios instance for authenticated calls
// Standard axios import, potentially for unauthenticated calls if needed

// Import the new subcomponents from the 'components' directory
// Corrected path to ensure consistency based on typical React project structure
import EditorHeader from './EditorHeader';
import MonacoCodeEditor from './MonacoCodeEditor';
import OutputConsole from './OutputConsole';
import ChatPanel from './ChatPanel';

const CodeEditor = ({ sessionId, username, initialLanguage = "javascript", initialTheme = "vs-dark" }) => {
    // Core states for managing the editor's functionality and collaboration
    const [code, setCode] = useState("// Start coding...\n// Welcome to the collaborative editor!");
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [isCopied, setIsCopied] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
    const [selectedTheme, setSelectedTheme] = useState(initialTheme);
    const [activeUsers, setActiveUsers] = useState([]);
    const [myPriority, setMyPriority] = useState(0);
    const [allUserPriorities, setAllUserPriorities] = useState({});
    const [executionOutput, setExecutionOutput] = useState("");
    const [isExecuting, setIsExecuting] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentChatMessage, setCurrentChatMessage] = useState("");

    // State for tracking newly joined user and last code updater
    const [current_added_user, set_current_addded_user] = useState("");
    const [lastUpdatedUser, setLastUpdatedUser] = useState(""); // New state for last updated user

    // Refs for WebSocket connection, auto-scrolling chat, and tracking previous active users
    const socketRef = useRef(null);
    const preventEcho = useRef(false); // Flag to prevent echoing own WebSocket messages
    const chatMessagesEndRef = useRef(null); // Ref for auto-scrolling chat messages
    const lastSentChatMessageId = useRef(null); // Ref for chat message deduplication
    const prevActiveUsersRef = useRef([]); // Ref to store the previously received active users list for comparison

    // React Router hook for navigation
    const navigate = useNavigate();

    // Configuration data for supported programming languages and editor themes
    const availableLanguages = [
        { name: "JavaScript", value: "javascript", version: "18.15.0" },
        { name: "Java", value: "java", version: "15.0.2" },
        { name: "Python", value: "python", version: "3.10.0" },
        { name: "C++", value: "cpp", version: "10.2.0" },
        { name: "C", value: "c", version: "10.2.0" },
        { name: "SQL", value: "sql", version: "latest" }, // "latest" indicates it might need special handling for execution
    ];

    const availableThemes = [
        { name: "VS Dark", value: "vs-dark" },
        { name: "VS Light", value: "vs-light" },
        { name: "High Contrast Dark", value: "hc-black" },
        { name: "High Contrast Light", value: "hc-light" }
    ];

    // --- useEffect for WebSocket Connection and Message Handling ---
    useEffect(() => {
        const token = localStorage.getItem("token");
        // Ensure sessionId is present before attempting WebSocket connection
        if (!sessionId) {
            console.error("Session ID is missing, cannot establish WebSocket connection.");
            setConnectionStatus('disconnected');
            toast.error("Session ID is missing! Cannot connect.");
            return; // Exit if sessionId is not available
        }

        const backendHost = window.location.hostname;
        // Accessing environment variable for backend port, with a fallback
        const backendPort = import.meta.env.VITE_APP_BACKEND_PORT || 8080; 
        const rawSocketUrl = `ws://${backendHost}:${backendPort}/ws/editor?token=${token}&sessionId=${sessionId}&username=${username}`; // Pass username to WebSocket URL
        
        // Initialize WebSocket connection
        socketRef.current = new WebSocket(rawSocketUrl);

        // Event handler for successful WebSocket connection
        socketRef.current.onopen = () => {
            console.log("WebSocket connected");
            setConnectionStatus('connected');
            toast.success("Connected to editor session!");
        };

        // Event handler for incoming WebSocket messages
        socketRef.current.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            
            // Handle different types of messages received from the WebSocket server
            switch (msg.type) {
                case "INITIAL_CODE_STATE":
                    // This is the first message upon connection from the backend, setting initial editor state
                    preventEcho.current = true; // Set flag to prevent local editor change from being sent back
                    setCode(msg.content || ""); // Update editor code with initial state from server
                    setSelectedLanguage(msg.selectedLanguage || initialLanguage); // Set initial language
                    console.log(`Initial state loaded: Code and Language (${msg.selectedLanguage || initialLanguage})`);
                    break;

                case "CODE_CHANGE":
                    // A real-time code update from another user or server
                    // Only update if the message is not from self (user check)
                    if (msg.user !== username) {
                        preventEcho.current = true; // Mark to prevent echoing
                        setCode(msg.content || "");
                        // Also update language if provided in a CODE_CHANGE from another user
                        if (msg.selectedLanguage && msg.selectedLanguage !== selectedLanguage) {
                            setSelectedLanguage(msg.selectedLanguage);
                        }
                        setLastUpdatedUser(msg.user); // Set the user who made the code change
                    } else {
                        // If it's your own update, set yourself as the last updated user
                        setLastUpdatedUser(username);
                    }
                    break;

                case "LANGUAGE_CHANGE":
                    // A dedicated language update from another user
                    if (msg.user !== username) {
                        setSelectedLanguage(msg.selectedLanguage || initialLanguage);
                        setLastUpdatedUser(msg.user); // Set the user who changed the language
                    } else {
                         setLastUpdatedUser(username); // If it's your own update, set yourself as last updated
                    }
                    break;

                case "USER_LIST_UPDATE":
                    const receivedUsers = msg.users || [];
                    const receivedPriorities = msg.priorities || {};

                    // Identify newly joined users to show a toast and set current_added_user
                    const newUsersJoined = receivedUsers.filter(
                        user => !prevActiveUsersRef.current.includes(user)
                    );
                    if (newUsersJoined.length > 0) {
                        newUsersJoined.forEach(user => {
                            if (user !== username) { // Don't toast for yourself joining initially
                                toast.success(`${user} joined the session!`);
                            }
                        });
                        // Set the first newly joined user. If multiple join simultaneously, this picks one.
                        set_current_addded_user(newUsersJoined[0]);
                    }

                    // Identify users who left to show a toast
                    const usersWhoLeft = prevActiveUsersRef.current.filter(
                        user => !receivedUsers.includes(user)
                    );
                    if (usersWhoLeft.length > 0) {
                        usersWhoLeft.forEach(user => {
                            if (user !== username) { // Don't toast for yourself leaving
                                toast.error(`${user} left the session.`);
                            }
                        });
                    }

                    // Update the ref to store the current list for the next update cycle
                    prevActiveUsersRef.current = receivedUsers;

                    // Update component state for active users and priorities
                    setActiveUsers(receivedUsers);
                    setAllUserPriorities(receivedPriorities);
                    setMyPriority(receivedPriorities[username] || 0);
                    break;

                case "CHAT_MESSAGE":
                    // *** Crucial Deduplication Logic ***
                    // Check if this incoming message is an echo of a message we just sent.
                    // This relies on the 'clientMessageId' that was added in handleSendChatMessage.
                    if (msg.clientMessageId && lastSentChatMessageId.current === msg.clientMessageId) {
                        // This is our own message echoed back by the server. Ignore it to prevent duplicates.
                        console.log("Deduplicating: Ignoring echoed chat message with ID:", msg.clientMessageId);
                        lastSentChatMessageId.current = null; // Reset the ID after a successful match
                        return; // CRUCIAL: Exit here, do NOT add this echoed message to state
                    }
                    // Only add to chat messages if it's not a deduplicated message
                    console.log("Adding chat message:", msg); // Log only for genuinely new or non-deduplicated messages
                    setChatMessages(prevMessages => [...prevMessages, msg]);
                    break;

                default:
                    console.warn("Unknown message type received:", msg.type, msg);
            }
        };

        // Event handler for WebSocket connection closing
        socketRef.current.onclose = (event) => {
            console.log("WebSocket disconnected", event.code, event.reason);
            setConnectionStatus('disconnected');
            if (event.code !== 1000) { // 1000 is normal closure
                toast.error(`Disconnected from editor session (${event.code}). Attempting to reconnect...`);
                // Implement a reconnection strategy here if desired (e.g., setTimeout)
            } else {
                toast.success("You have left the session.");
            }
        };

        // Event handler for WebSocket errors
        socketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
            setConnectionStatus('disconnected');
            toast.error("WebSocket error. Check console for details.");
        };

        // Cleanup function: close WebSocket connection when component unmounts or dependencies change
        return () => {
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.close(1000, "Component unmounted or re-rendered");
                console.log("WebSocket connection closed by cleanup.");
            }
        };
    }, [sessionId, username, initialLanguage, navigate]); // Dependencies for useEffect

    // --- useEffect for Auto-Scrolling Chat Messages ---
    useEffect(() => {
        // Scroll to the bottom of the chat messages whenever new messages arrive
        chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]); // Dependency: re-run whenever the chatMessages array changes

    // --- Handlers Passed to Subcomponents via Props ---

    // Callback for handling changes in the Monaco Editor
    const handleEditorChange = useCallback((value, event) => {
        if (preventEcho.current) {
            preventEcho.current = false; // Reset the echo prevention flag
            return;
        }
        setCode(value); // Update the local code state
        // If WebSocket is open, send the code change to the server
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
                JSON.stringify({
                    type: "CODE_CHANGE",
                    content: value,
                    user: username,
                    sessionId: sessionId,
                    selectedlang: selectedLanguage, // Send current language
                    priority: myPriority // Include the sender's current priority
                })
            );
        }
    }, [username, sessionId, selectedLanguage, myPriority]); // Dependencies for useCallback

    // Callback for copying the session ID to the clipboard
    const handleCopySessionId = () => {
        navigator.clipboard.writeText(sessionId).then(() => {
            setIsCopied(true); // Set state for visual feedback (e.g., checkmark icon)
            toast.success("Session ID copied!"); // Show success toast
            setTimeout(() => setIsCopied(false), 2000); // Reset visual feedback after 2 seconds
        }).catch(err => {
            console.error("Failed to copy:", err);
            toast.error("Failed to copy Session ID."); // Show error toast if copy fails
        });
    };

    // Callback for changing the selected programming language
    const handleLanguageChange = (event) => {
        const newLanguage = event.target.value;
        setSelectedLanguage(newLanguage); // Update local state with the new language
        // If WebSocket is open, send the language change to the server
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(
                JSON.stringify({
                    type: "LANGUAGE_CHANGE",
                    selectedLanguage: newLanguage, // Send the new language value
                    user: username,
                    sessionId: sessionId
                })
            );
        }
    };

    // Callback for changing the editor theme
    const handleThemeChange = (event) => {
        setSelectedTheme(event.target.value); // Update local state with the new theme
    };

    // Callback for handling the user leaving the session
    const handleLeaveSession = () => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            // Attempt to gracefully close the WebSocket connection
            socketRef.current.close(1000, "User left the session");
            toast.success("You have left the session.");
        } else {
            toast.error("Not connected to a session.");
        }
        navigate('/dashboard'); // Navigate to the dashboard after leaving/disconnecting
    };

    // Callback for running the code through the backend's compilation/execution service
    const handleRunCode = async () => {
        setIsExecuting(true); // Set loading state for the button
        setExecutionOutput("Running code..."); // Display a "running" message in the output console
        
        // Find the configuration for the currently selected language, including its version
        const currentLangConfig = availableLanguages.find(lang => lang.value === selectedLanguage);
        // Validate if the selected language is executable and has a specific version
        if (!currentLangConfig || !currentLangConfig.version || currentLangConfig.version === "latest") {
            setExecutionOutput("Error: Selected language might not be executable or lacks a specific version for the compiler. Choose a language like Python, Java, C++, etc.");
            toast.error("Unsupported language for execution or missing version.");
            setIsExecuting(false);
            return; // Exit if language is not supported for execution
        }

        try {
            const token = localStorage.getItem('token');
            const backendHost = window.location.hostname;
            const backendPort = 8080; // Assuming default backend port

            const response = await api.post(
                `http://${backendHost}:${backendPort}/api/code/execute`,
                {
                    language: currentLangConfig.value,
                    version: currentLangConfig.version,
                    code: code, // The current code from the editor
                },
               
            );

            const result = response.data;
            let output = "";

            // Consolidate and format the execution output from the backend response
            if (result.compileStdout) { output += "COMPILE OUTPUT:\n" + result.compileStdout + "\n"; }
            if (result.compileStderr) { output += "COMPILE ERROR:\n" + result.compileStderr + "\n"; }
            if (result.stdout) { output += "OUTPUT:\n" + result.stdout; }
            if (result.stderr) { output += "RUNTIME ERROR:\n" + result.stderr; }
            if (result.error) { 
                if (output) output += "\n"; // Add newline if there's existing output
                output += "SERVICE ERROR: " + result.error; 
            }

            setExecutionOutput(output || "Execution completed with no output."); // Update output console

        } catch (error) {
            console.error("Error executing code:", error);
            if (error.response) {
                // Display specific error message from backend response if available
                setExecutionOutput(`ERROR: ${error.response.status} - ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
                toast.error(`Code execution failed: ${error.response.status}`);
            } else {
                setExecutionOutput("Network error or server unreachable.");
                toast.error("Failed to connect to execution server.");
            }
        } finally {
            setIsExecuting(false); // Reset loading state
        }
    };

    // Callback for sending chat messages
    const handleSendChatMessage = (event) => {
        event.preventDefault(); // Prevent default form submission
        // Only send if message is not empty and WebSocket is open
        if (currentChatMessage.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
            // Generate a unique client-side ID for this message for deduplication
            const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
            lastSentChatMessageId.current = messageId; // Store this ID in the ref

            const messageToSend = {
                type: "CHAT_MESSAGE",
                content: currentChatMessage.trim(),
                user: username,
                sessionId: sessionId,
                timestamp: new Date().toLocaleTimeString(), // Add timestamp for display
                clientMessageId: messageId // Include client-side unique ID in the message
            };

            socketRef.current.send(JSON.stringify(messageToSend));
            
            // Immediately add the message to local state for better responsiveness
            // The echo from the server will be ignored due to the deduplication logic in onmessage
            setChatMessages(prevMessages => [...prevMessages, messageToSend]);
            setCurrentChatMessage(""); // Clear the chat input field after sending
        }
    };

    // Memoized utility function to determine connection status color for UI
    const getStatusColor = useCallback((status) => {
        switch (status) {
            case 'connected': return 'bg-green-500';
            case 'disconnected': return 'bg-red-500';
            case 'connecting': return 'bg-yellow-500';
            default: return 'bg-gray-500';
        }
    }, []); // No dependencies as it's a pure function

    return (
        <div className="flex flex-col h-screen text-gray-200 p-4 rounded-xl shadow-2xl border border-gray-700 ">
            <Toaster position="top-right" reverseOrder={false} />

            {/* Render the Editor Header subcomponent */}
            <EditorHeader
                sessionId={sessionId}
                username={username}
                connectionStatus={connectionStatus}
                isCopied={isCopied}
                myPriority={myPriority}
                activeUsers={activeUsers}
                allUserPriorities={allUserPriorities}
                selectedLanguage={selectedLanguage}
                selectedTheme={selectedTheme}
                availableLanguages={availableLanguages}
                availableThemes={availableThemes}
                handleCopySessionId={handleCopySessionId}
                handleLanguageChange={handleLanguageChange}
                handleThemeChange={handleThemeChange}
                handleRunCode={handleRunCode}
                handleLeaveSession={handleLeaveSession}
                isExecuting={isExecuting}
                getStatusColor={getStatusColor}
                new_users={current_added_user}
                lastUpdatedUser={lastUpdatedUser}
            />

            {/* Main content area: Editor and right-hand panels (Output/Chat) */}
            <div className="flex flex-col lg:flex-row flex-grow gap-4 min-h-0   md:max-lg:items-center md:max-lg:grow-[0] md:max-lg:h-auto">
                {/* Monaco Code Editor - takes most horizontal space */}
                <MonacoCodeEditor
                    code={code}
                    selectedLanguage={selectedLanguage}
                    selectedTheme={selectedTheme}
                    handleEditorChange={handleEditorChange}
                />
                

                <div className="lg:w-1/4 flex flex-col gap-4 min-h-0 h-full md:max-lg:w-[85%]  ">
                    
                    <div className="overflow-hidden bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 max-h-1/2 flex-grow md:max-lg:min-h-[350px] md:max-lg:max-h-[350px] ">
                        <OutputConsole executionOutput={executionOutput} />
                    </div>
                    
                    {/* Chat Panel Container */}
                    <div className="rounded-xl shadow-lg border border-gray-700 overflow-hidden bg-gray-800 max-h-1/2 text-sm flex-grow md:max-lg:min-h-[350px] md:max-lg:max-h-[350px]">
            
                        <ChatPanel
                            chatMessages={chatMessages}
                            currentChatMessage={currentChatMessage}
                            setCurrentChatMessage={setCurrentChatMessage}
                            handleSendChatMessage={handleSendChatMessage}
                            chatMessagesEndRef={chatMessagesEndRef}
                            username={username}
                            connectionStatus={connectionStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
