package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.controllers;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.CodeSession; // Import CodeSession
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services.SessionManagment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // Import HttpStatus
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils; // For checking if string is null or empty

import java.util.List; // For returning a list
import java.util.Map;
import java.util.Optional; // For handling Optional return types from service

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private SessionManagment sessionManger;

    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, String> request) {
        String sessionName = request.get("sessionName");

        // Edge Case 1: Validate incoming request body for sessionName
        if (!StringUtils.hasText(sessionName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Session name is required.");
        }

        CodeSession createdSession = sessionManger.sessionCreate(sessionName);

        // Edge Case 2: Handle service returning null (e.g., due to unauthenticated user or internal error)
        if (createdSession == null) {
            // The service already logs the specific reason (unauthenticated, DB error, etc.)
            // Here, we provide a generic failure message to the client.
            // A more detailed error message could be passed from the service.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create session. Please check logs for details or ensure you are authenticated.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(createdSession); // Return 201 Created on success
    }

    @GetMapping
    public ResponseEntity<?> getUserSessions() {
        return sessionManger.getUserSessions();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSession(@PathVariable String id) {
        // Edge Case 1: Validate path variable 'id'
        if (!StringUtils.hasText(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Session ID path variable cannot be empty.");
        }

        // Use the new method name from SessionManagement
        return sessionManger.getSessionById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSession(@PathVariable String id){
        if (!StringUtils.hasText(id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Session ID path variable cannot be empty.");
        }
        return sessionManger.deleteSessionById(id);
    }
}