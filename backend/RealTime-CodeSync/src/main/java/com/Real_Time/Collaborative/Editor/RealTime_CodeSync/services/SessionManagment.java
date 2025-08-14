package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.CodeSession;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.repository.CodeSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionManagment {

    @Autowired
    private CodeSessionRepository sessionrepo;

    /**
     * Creates a new code session for the authenticated user.
     * Handles cases where session name is invalid or user is not authenticated.
     *
     * @param sessionName The name of the session to create.
     * @return The created CodeSession or null if creation failed due to invalid input/authentication.
     */
    public CodeSession sessionCreate(String sessionName) {


        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            System.err.println("Session creation failed: User not authenticated.");
            return null;
        }

        String username = authentication.getName();

        // Use the constructor that sets ownerUsername and sessionName,
        // letting @PrePersist handle sessionId and createdAt.
        // The default values for code and language are handled by the CodeSession model itself now.
        CodeSession session = new CodeSession(sessionName.trim(), username);
        System.out.println(session);
        // No need to set sessionId, createdAt, code, language manually here if handled in model and @PrePersist

        try {
            sessionrepo.save(session);
            System.out.println("Session '" + sessionName + "' created by " + username + " with ID: " + session.getSessionId());
            return session;
        } catch (Exception e) {
            System.err.println("Error saving session to database: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Retrieves all code sessions owned by the authenticated user.
     * Handles cases where user is not authenticated or no sessions are found.
     *
     * @return ResponseEntity with a list of sessions or appropriate error status.
     */
    public ResponseEntity<?> getUserSessions() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        String username = authentication.getName();
        try {
            List<CodeSession> sessions = sessionrepo.findByOwnerUsername(username);
            // It's generally good practice to return 200 OK with an empty list for "no results found" for collections.
            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            System.err.println("Error retrieving sessions for user " + username + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve sessions.");
        }
    }

    /**
     * Retrieves a specific code session by ID, ensuring it belongs to the authenticated user.
     * Handles cases where user is not authenticated, session not found, or session doesn't belong to user.
     *
     * @param id The ID of the session to retrieve.
     * @return ResponseEntity with the session or appropriate error status.
     */
    public ResponseEntity<?> getSessionById(String id) {
        if (!StringUtils.hasText(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Session ID cannot be empty or null.");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        String username = authentication.getName();

        try {
            Optional<CodeSession> sessionOptional = sessionrepo.findById(id);

            if (sessionOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Session with ID " + id + " not found.");
            }

            CodeSession session = sessionOptional.get();

            if (!session.getOwnerUsername().equals(username)) {
                System.err.println("Unauthorized access attempt: User '" + username + "' tried to access session '" + id + "' owned by '" + session.getOwnerUsername() + "'.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not own this session.");
            }

            return ResponseEntity.ok(session);
        } catch (Exception e) {
            System.err.println("Error retrieving session " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to retrieve session.");
        }
    }

    /**
     * Deletes a specific code session by ID, ensuring it belongs to the authenticated user.
     * Handles cases where user is not authenticated, session not found, or session doesn't belong to user.
     *
     * @param id The ID of the session to delete.
     * @return ResponseEntity indicating success or appropriate error status.
     */
    public ResponseEntity<?> deleteSessionById(String id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
        }

        String username = authentication.getName();

        try {
            Optional<CodeSession> sessionOptional = sessionrepo.findById(id);

            if (sessionOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Session with ID " + id + " not found.");
            }

            CodeSession session = sessionOptional.get();

            if (!session.getOwnerUsername().equals(username)) {
                System.err.println("Unauthorized deletion attempt: User '" + username + "' tried to delete session '" + id + "' owned by '" + session.getOwnerUsername() + "'.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You do not own this session.");
            }

            sessionrepo.deleteById(id);
            System.out.println("Session '" + id + "' successfully deleted by user '" + username + "'.");
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            System.err.println("Error deleting session " + id + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete session.");
        }
    }
}