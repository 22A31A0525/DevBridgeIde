// src/main/java/com/Real_Time.Collaborative.Editor.RealTime_CodeSync/config/AppConfig.java
package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule; // NEW IMPORT
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper objectMapper() {
        // --- NEW: Register JavaTimeModule ---
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        return objectMapper;
        // --- END NEW ---
    }
}