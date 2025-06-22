package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtHandshakeInterceptor(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {

        System.out.println("\n--- JwtHandshakeInterceptor: beforeHandshake CALLED (Authenticating WebSocket) ---\n");

        if (request instanceof ServletServerHttpRequest servletRequest) {
            String token = servletRequest.getServletRequest().getParameter("token");
            String sessionId = servletRequest.getServletRequest().getParameter("sessionId"); // <-- EXTRACT sessionId



            if (token != null && !token.isEmpty()) {
                try {
                    String username = jwtUtil.extractUsername(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtUtil.isTokenValid(token, userDetails)) {
                        // Store the username AND sessionId in WebSocketSession attributes
                        attributes.put("username", username);
                        attributes.put("sessionId", sessionId); // <-- PUT sessionId into attributes
                        System.out.println(attributes);
                        return true; // Allow the WebSocket handshake
                    } else {
                        System.out.println("JWT INVALID for user: " + username + " (token validation failed).");
                    }
                } catch (Exception e) {
                    System.err.println("Error during JWT validation or extraction in handshake: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("Token parameter is missing or empty.");
            }
        } else {
            System.out.println("Request is not ServletServerHttpRequest. Cannot extract parameters.");
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        System.out.println("Handshake FAILED: UNAUTHORIZED (401) response sent.");
        return false; // Reject the WebSocket handshake
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        System.out.println("\n--- JwtHandshakeInterceptor: afterHandshake CALLED ---\n");
        if (exception != null) {
            System.err.println("Handshake completed with exception: " + exception.getMessage());
            exception.printStackTrace();
        } else {
            System.out.println("Handshake completed successfully (no exception).");
        }
    }
}