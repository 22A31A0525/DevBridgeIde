package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.CodeSession;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.EditPayload;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.MonacoRange;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.repository.CodeSessionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;


//TextWebSocketHandler is a specialized "blueprint" class provided by the Spring Framework.
//Think of it as a pre-built toolkit specifically for handling text-based
//WebSocket messages (like the code changes and cursor positions in your editor).


@Service
public class CodeEditorWebSocketHandler extends TextWebSocketHandler {

    private final Map<String, CopyOnWriteArraySet<WebSocketSession>> sessionMap = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> usersInSession = new ConcurrentHashMap<>();
    private final Map<String, CodeSession> currentSessionStateInMemory = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final CodeSessionRepository codeSessionRepository;


    public CodeEditorWebSocketHandler(CodeSessionRepository codeSessionRepository) {
        this.codeSessionRepository = codeSessionRepository;
    }

    private String applyEditToString(String originalCode, EditPayload edit) {

        try {
            MonacoRange range = edit.getRange();
            int startLine = range.getStartLineNumber() - 1;
            int startCol = range.getStartColumn() - 1;
            int endLine = range.getEndLineNumber() - 1;
            int endCol = range.getEndColumn() - 1;

            String newText = edit.getText();
            // 2. Split the original code into an array of lines.
            String[] lines = originalCode.split("\n", -1);


            String firstLinePart = lines[startLine].substring(0, startCol);
            String lastLinePart = lines[endLine].substring(endCol);


            String combinedLine = firstLinePart + newText + lastLinePart;

            // 6. Reconstruct the entire code.
            List<String> newLines = new ArrayList<>();

            // Add all the lines from the original code that came BEFORE the edit.
            for (int i = 0; i < startLine; i++) {
                newLines.add(lines[i]);
            }

            // Add our newly constructed line that contains the change.
            newLines.add(combinedLine);

            // Add all the lines from the original code that came AFTER the edit.
            for (int i = endLine + 1; i < lines.length; i++) {
                newLines.add(lines[i]);
            }

            // 7. Join the list of lines back into a single string with newline characters.
            return String.join("\n", newLines);
        }
        catch (ArrayIndexOutOfBoundsException e){
            System.out.println("IndexBound Exception raised returning empty string");
            return "";
        }
    }
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String sessionId = (String) session.getAttributes().get("sessionId");
        String username = (String) session.getAttributes().get("username");

        if (sessionId == null || username == null) {
            session.close(CloseStatus.BAD_DATA);
            System.err.println("Connection rejected: Session ID or username missing for session " + session.getId());
            return;
        }


        // This checks if the session is currently active in memory *on this specific server instance*.
        boolean isFirstConnectionToThisInstance = (!sessionMap.containsKey(sessionId) || sessionMap.get(sessionId).isEmpty());

        // Add session to the map
        sessionMap.computeIfAbsent(sessionId, key -> new CopyOnWriteArraySet<>()).add(session);
        // Add user to the session's user list
        usersInSession.computeIfAbsent(sessionId, key -> ConcurrentHashMap.newKeySet()).add(username);

        System.out.println("\n--- WebSocket Connected ---");
        System.out.println("Session ID: " + session.getId() + ", User: " + username);
        System.out.println("Users in session " + sessionId + ": " + usersInSession.get(sessionId));

        // --- Load code and language logic ---
        CodeSession sessionState = null;
        String codeToSend = ""; // Default empty code
        String languageToSend = "JavaScript"; // Default language

        if (isFirstConnectionToThisInstance) {
            // If this is the very first connection to this session on this server instance (or server just restarted)
            // Try to load state from the database
            System.out.println("First connection to session " + sessionId + " on this instance. Checking database for code...");
            Optional<CodeSession> dbCodeSession = codeSessionRepository.findById(sessionId);

            if (dbCodeSession.isPresent()) {
                sessionState = dbCodeSession.get();
                codeToSend = sessionState.getCode();
                languageToSend = sessionState.getLanguage();
                // Store in-memory for quick access by subsequent users in this session
                currentSessionStateInMemory.put(sessionId, sessionState);
                System.out.println("Retrieved code and language for session " + sessionId + " from database for user " + username + ".");
            } else {
                // No code in DB for this sessionId, it's a truly new session or forgotten after close.
                // Initialize in-memory with defaults.
                sessionState = new CodeSession(sessionId, " ", "JavaScript");
                currentSessionStateInMemory.put(sessionId, sessionState);
                System.out.println("No existing code in database for session " + sessionId + ". User " + username + " will see frontend default.");
            }
        } else {
            // Not the first connection to this instance, get state from in-memory cache
            if (currentSessionStateInMemory.containsKey(sessionId)) {
                sessionState = currentSessionStateInMemory.get(sessionId);
                codeToSend = sessionState.getCode();
                languageToSend = sessionState.getLanguage();
                System.out.println("Retrieved code and language for session " + sessionId + " from in-memory cache for user " + username + ".");
            } else {
                // This case should ideally not happen if `isFirstConnectionToThisInstance` logic is sound,
                // but as a fallback, treat it as if no code found.
                System.err.println("Warning: Session " + sessionId + " is active but no state in memory. This indicates a potential logic issue or concurrent access anomaly.");
                sessionState = new CodeSession(sessionId, "", "plaintext"); // Initialize with defaults
                currentSessionStateInMemory.put(sessionId, sessionState);
            }
        }

        // Send the determined code and language to the newly joined user
        if (sessionState != null && session.isOpen()) {
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("type", "INITIAL_CODE_STATE"); // New message type for initial load
            messageData.put("content", codeToSend);
            messageData.put("selectedLanguage", languageToSend);
            messageData.put("user", "SERVER"); // Indicate source is server

            String jsonMessage = objectMapper.writeValueAsString(messageData);
            TextMessage textMessage = new TextMessage(jsonMessage);

            try {
            session.sendMessage(textMessage);
                System.out.println("Sent initial code state to user: " + username + " in session " + sessionId);
            } catch (Exception e) {
                System.err.println("Error sending initial code state to " + username + ": " + e.getMessage());
            }
        }
        // --- END Load code and language logic ---

        // Broadcast updated user list to all in the session
        broadcastUserList(sessionId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession senderSession, TextMessage message) throws Exception {
        String sessionId = (String) senderSession.getAttributes().get("sessionId");
        String username = (String) senderSession.getAttributes().get("username");

        System.out.println("\n--- Message Received ---");
        System.out.println("From User: " + username + " (Session ID: " + senderSession.getId() + ")");
        System.out.println("Content: " + message.getPayload());

        JsonNode jsonNode = objectMapper.readTree(message.getPayload());
        String messageType = jsonNode.has("type") ? jsonNode.get("type").asText() : "";
        String codeContent = jsonNode.has("content") ? jsonNode.get("content").asText() : null;
        String selectedLanguage = jsonNode.has("selectedLanguage") ? jsonNode.get("selectedLanguage").asText() : null;

        CodeSession currentSessionState = currentSessionStateInMemory.get(sessionId);
        if (currentSessionState == null) {
            // This indicates a problem; a message arrived for a session not in memory.
            // Could happen if server restarted and client didn't reconnect properly.
            // For robustness, consider re-fetching from DB or re-initializing here.
            System.err.println("Error: Received message for session " + sessionId + " but no state found in in-memory cache.");
            return;
        }

        boolean stateChanged = false;


        // If it's a CODE_CHANGE message, update in-memory code
        if ("CODE_CHANGE_UPDATE".equals(messageType) && codeContent != null) {
            if (!currentSessionState.getCode().equals(codeContent)) {
                ObjectMapper mapper = new ObjectMapper();
                EditPayload edit = mapper.readValue(codeContent, EditPayload.class);
                String newFullCode = applyEditToString(currentSessionState.getCode(), edit);
                currentSessionState.setCode(newFullCode);
                stateChanged = true;
                System.out.println("Code for session " + sessionId + " updated in in-memory cache.");
            }
        }

        // If it's a LANGUAGE_CHANGE message, or if a CODE_CHANGE also includes language, update in-memory language
        if ( "LANGUAGE_CHANGE".equals(messageType) && selectedLanguage != null) {
            if (!currentSessionState.getLanguage().equals(selectedLanguage)) { // Only update if language actually changed
                currentSessionState.setLanguage(selectedLanguage);
                stateChanged = true;
                System.out.println("Language for session " + sessionId + " updated in in-memory cache.");
            }
        }

        // If any state changed, ensure it's reflected in the in-memory map
        if (stateChanged) {
            currentSessionStateInMemory.put(sessionId, currentSessionState);
        }


        // Broadcast the original message received to all users in the same sessionId (room)
        // This ensures the content and language changes are propagated
        if (sessionId != null && sessionMap.containsKey(sessionId)) {
            for (WebSocketSession session : sessionMap.get(sessionId)) {
                if (session.isOpen() && session!=senderSession) {
                    try {
                        session.sendMessage(message);
                        System.out.println("Broadcasting message from " + username + " to Session ID: " + session.getId());
                    } catch (IOException e) {
                        System.err.println("Error sending message to session " + session.getId() + ": " + e.getMessage());
                    }
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String sessionId = (String) session.getAttributes().get("sessionId");
        String username = (String) session.getAttributes().get("username");

        if (sessionId != null) {
            CopyOnWriteArraySet<WebSocketSession> sessionsInRoom = sessionMap.get(sessionId);
            if (sessionsInRoom != null) {
                sessionsInRoom.remove(session);

                // Check if the user has any other active sessions in this room.
                boolean userHasOtherSessions = false;
                for (WebSocketSession s : sessionsInRoom) {
                    if (username.equals(s.getAttributes().get("username"))) {
                        userHasOtherSessions = true;
                        break;
                    }
                }

                if (!userHasOtherSessions) {
                    Set<String> users = usersInSession.get(sessionId);
                    if (users != null) {
                        users.remove(username);
                    }
                }

                // If the room is now empty of all active WebSocket sessions,
                // persist the current in-memory state to the database and clear cache
                if (sessionsInRoom.isEmpty()) {
                    sessionMap.remove(sessionId);
                    usersInSession.remove(sessionId);


                    System.out.println(currentSessionStateInMemory);
                    CodeSession finalState = currentSessionStateInMemory.remove(sessionId); // Remove from memory
                    if (finalState != null) {
                        try {
                            // Save or update the CodeSession in the database
                            codeSessionRepository.save(finalState);
                            System.out.println("Session " + sessionId + " is now empty. Final state saved to database. Code cache cleared.");
                        } catch (Exception e) {
                            System.err.println("Error saving final state for session " + sessionId + " to database: " + e.getMessage());
                            e.printStackTrace();
                        }
                    } else {
                        System.out.println("Session " + sessionId + " empty, but no state found in memory to save.");
                    }
                } else {
                    // Room is not empty, broadcast updated user list to remaining users
                    broadcastUserList(sessionId);
                }
            }
        }

        System.out.println("\n--- WebSocket Closed ---");
        System.out.println("Session ID: " + session.getId() + ", User: " + username);
        System.out.println("Status: " + status);
        System.out.println("Remaining users in session " + sessionId + ": " + usersInSession.get(sessionId));
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        if (exception instanceof IOException && exception.getMessage().contains("connection was aborted")) {
            System.out.println("Client forcibly closed the connection: " + session.getId());
        } else {
            System.err.println("--- WebSocket Transport Error ---");
            exception.printStackTrace();
        }
    }

    private void broadcastUserList(String sessionId) {
        if (sessionId == null) {
            return;
        }

        Set<String> currentUsers = usersInSession.get(sessionId);
        if (currentUsers == null) {
            currentUsers = Collections.emptySet();
        }

        try {
            Map<String, Object> messageData = new HashMap<>();
            messageData.put("type", "USER_LIST_UPDATE");
            messageData.put("users", currentUsers);

            String jsonMessage = objectMapper.writeValueAsString(messageData);
            TextMessage textMessage = new TextMessage(jsonMessage);

            CopyOnWriteArraySet<WebSocketSession> sessionsInRoom = sessionMap.get(sessionId);
            if (sessionsInRoom != null) {
                for (WebSocketSession session : new ArrayList<>(sessionsInRoom)) {
                    synchronized (session) {
                        if (session.isOpen()) {
                            try {
                                session.sendMessage(textMessage);
                            } catch (IllegalStateException e) {
                                System.err.println("Attempted to send user list update to already closed session " + session.getId() + " (IllegalState): " + e.getMessage());
                            } catch (IOException e) {
                                System.err.println("Error sending user list update to session " + session.getId() + " (IOException): " + e.getMessage());
                            }
                        } else {
                            System.out.println("Skipping session " + session.getId() + " which is not open during user list broadcast.");
                        }
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("Error broadcasting user list for session " + sessionId + ": " + e.getMessage());
        }
    }
}