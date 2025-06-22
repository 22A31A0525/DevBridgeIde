package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.security;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services.CustomUserDetailsService; // Assuming your UserDetailsService is here
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component; // Mark as a Spring component
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component // Important: Mark this class as a Spring component so it can be autowired
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil; // To validate and extract info from JWT

    @Autowired
    private CustomUserDetailsService userDetailsService; // To load user details from DB/service

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization"); // Get the Authorization header

        String username = null;
        String jwt = null;

        // 1. Check if the header exists and starts with "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7); // Extract the token (remove "Bearer ")
            try {
                username = jwtUtil.extractUsername(jwt); // Extract username from token
            } catch (Exception e) {
                // Log and handle JWT parsing/validation errors (e.g., expired, malformed)
                System.err.println("Error extracting username from JWT: " + e.getMessage());
                // You might want to send a 401 Unauthorized response here directly
            }
        }

        // 2. If username is found and no authentication is currently set in SecurityContext
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 3. Validate the token against the UserDetails
            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                // If token is valid, create an Authentication object and set it in SecurityContext
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("Authenticated user: " + username); // For debugging
            } else {
                System.out.println("JWT is invalid for user: " + username); // For debugging
            }
        }

        // Continue the filter chain
        filterChain.doFilter(request, response);
    }
}