package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.config;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.security.JwtFilter;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // CORRECT IMPORT FOR MVC
// import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource; // REMOVE THIS - THIS IS FOR WEBSFLUX

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService; // Assuming this is used elsewhere (e.g., in AuthenticationProvider)

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Enable CORS for Spring Security and link it to your corsConfigurationSource() bean
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // 2. Disable CSRF for stateless APIs (common for REST APIs, but understand implications)
                .csrf(csrf -> csrf.disable())
                // 3. Configure authorization rules
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/ws/editor/**").permitAll()// Allow unauthenticated access to /auth/** endpoints
                        .anyRequest().authenticated() // All other requests require authentication
                )
                // 4. Configure session management to be stateless (important for JWTs)
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // 5. Add your custom JWT filter before the UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // This bean is for your controller to use to kick off the authentication process.
        // Spring Boot automatically configures it if you have a UserDetailsService and PasswordEncoder.
        return config.getAuthenticationManager();
    }

    // This bean defines the CORS policy
    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow sending credentials (cookies, HTTP authentication headers like Authorization)
        config.setAllowCredentials(true);

        // List all origins your frontend will be served from.
        // IMPORTANT: For production, replace localhost with your actual frontend domain(s).
        config.addAllowedOrigin("http://localhost:5173"); // Your Vite development server
        config.addAllowedOrigin("http://127.0.0.1:5173");
        config.addAllowedOrigin("http://192.168.29.179:5173/");// Another common localhost variant

        // Allow all common HTTP methods
        config.addAllowedMethod("GET");
        config.addAllowedMethod("POST");
        config.addAllowedMethod("PUT");
        config.addAllowedMethod("DELETE");
        config.addAllowedMethod("OPTIONS"); // Crucial for pre-flight requests

        // Allow all headers (e.g., Content-Type, Authorization, Custom-Header)
        config.addAllowedHeader("*");

        // How long the pre-flight request's result can be cached by the browser (in seconds)
        config.setMaxAge(3600L); // 1 hour

        // Apply this CORS configuration to all paths (/**)
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}