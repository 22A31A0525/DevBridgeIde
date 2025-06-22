package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.controllers;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.Users;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.security.JwtUtil;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services.CreateUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus; // For HTTP status codes
import org.springframework.http.ResponseEntity; // For ResponseEntity
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
public class UserControl {

    @Autowired
    private CreateUser createUser; // Renamed variable to follow Java conventions

    @Autowired
    private JwtUtil jwt;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<Users> registerUser(@RequestBody Users user){
        try {
            // Attempt to create the user
            Users createdUser = createUser.createUser(user);

            if (createdUser != null) {
                // IMPORTANT: Do not return password in the response for security
                createdUser.setPassword(null);
                return new ResponseEntity<>(createdUser, HttpStatus.CREATED); // 201 Created status
            } else {
                // If createUser returns null, it means username already exists (as per CreateUser logic)
                return new ResponseEntity<>(null, HttpStatus.CONFLICT); // 409 Conflict
            }
        } catch (Exception e) {
            // Log the exception for debugging
            System.err.println("Error during user registration: " + e.getMessage());
            // Return an appropriate error response
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR); // 500 Internal Server Error
        }
    }

    @PostMapping("/login")

    public ResponseEntity<String> authenticateUser(@RequestBody Users user) {
        try {
            System.out.println("Authenticating user: " + user.getUsername());

            // Authenticate user credentials
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );

            // Set the authentication in the security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Generate JWT token
            String token = jwt.getToken(user.getUsername());

            // Return token
            return ResponseEntity.ok(token);

        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Authentication failed: Invalid username or password.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }


}