package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.config;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services.CodeEditorWebSocketHandler;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.security.JwtHandshakeInterceptor; // Import your interceptor

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private  JwtHandshakeInterceptor jwtHandshakeInterceptor;
    @Autowired
    private CodeEditorWebSocketHandler codeEditorWebSocketHandler;

    // Spring will now inject JwtHandshakeInterceptor

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {

        System.out.println("Registering CodeEditorWebSocketHandler for path '/ws/editor'.");

        registry.addHandler(codeEditorWebSocketHandler, "/ws/editor")
                .addInterceptors(jwtHandshakeInterceptor) // <--- RE-ADD THIS LINE
                .setAllowedOrigins("*"); // Restrict this in production!

        System.out.println("WebSocket endpoint '/ws/editor' registered WITH JwtHandshakeInterceptor.\n");
    }
}