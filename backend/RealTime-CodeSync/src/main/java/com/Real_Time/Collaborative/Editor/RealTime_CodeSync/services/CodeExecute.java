package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.CodeExecutionResponse; // Assuming this DTO is defined in models package
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException; // Import for 4xx errors
import org.springframework.web.client.HttpServerErrorException; // Import for 5xx errors
import org.springframework.web.client.RestTemplate;

@Service
public class CodeExecute {
    private static final String PISTON_API_URL = "https://emkc.org/api/v2/piston/execute";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Constructor injection for RestTemplate and ObjectMapper
    public CodeExecute(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Sends client code to the EMKC Piston API for execution and returns the processed output.
     *
     * @param clientCode The code string to be executed.
     * @param clientLang The programming language (e.g., "python", "java").
     * @param clientLangVers The version of the programming language (e.g., "3.10.0", "15.0.2").
     * @return A ResponseEntity containing CodeExecutionResponse with stdout, stderr, etc., or error details.
     */
    public ResponseEntity<CodeExecutionResponse> getOutputAfterRun(String clientCode, String clientLang, String clientLangVers) {
        // --- FIX 1: Enhanced input validation to include clientLangVers ---
        if (clientLang == null || clientLang.trim().isEmpty() ||
                clientLangVers == null || clientLangVers.trim().isEmpty() ||
                clientCode == null || clientCode.trim().isEmpty()) {

            CodeExecutionResponse errorResponse = new CodeExecutionResponse();
            errorResponse.setError("Language, language version, and code cannot be empty.");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        try {
            // Build the request body for Piston API using ObjectMapper
            ObjectNode pistonRequestBody = objectMapper.createObjectNode();
            pistonRequestBody.put("language", clientLang.trim()); // Trim input to prevent issues
            pistonRequestBody.put("version", clientLangVers.trim()); // Trim input

            ArrayNode filesNode = objectMapper.createArrayNode();
            ObjectNode fileNode = objectMapper.createObjectNode();

            // Piston often expects a file name with extension
            fileNode.put("name", "main." + getFileExtension(clientLang));
            fileNode.put("content", clientCode); // Send the actual code content
            filesNode.add(fileNode);
            pistonRequestBody.set("files", filesNode);

            // Set headers for the HTTP request to Piston
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create the HttpEntity which wraps the request body and headers
            HttpEntity<String> pistonRequestEntity = new HttpEntity<>(pistonRequestBody.toString(), headers);

            System.out.println("Sending request to Piston API: " + pistonRequestBody.toString());

            // Make the POST call to Piston API
            ResponseEntity<JsonNode> pistonResponseEntity = restTemplate.exchange(
                    PISTON_API_URL,
                    HttpMethod.POST,
                    pistonRequestEntity,
                    JsonNode.class // Expect the response as a generic JsonNode
            );

            // Get the response body from Piston
            JsonNode pistonResponse = pistonResponseEntity.getBody();
            CodeExecutionResponse response = new CodeExecutionResponse();

            // Parse Piston's response into our CodeExecutionResponse DTO
            if (pistonResponse != null) {
                // Parse run output
                JsonNode runNode = pistonResponse.get("run");
                if (runNode != null) {
                    response.setStdout(runNode.has("stdout") ? runNode.get("stdout").asText() : "");
                    response.setStderr(runNode.has("stderr") ? runNode.get("stderr").asText() : "");
                    response.setRunCode(runNode.has("code") ? runNode.get("code").asInt() : null);
                }

                // Parse compile output (if applicable for the language)
                JsonNode compileNode = pistonResponse.get("compile");
                if (compileNode != null) {
                    response.setCompileStdout(compileNode.has("stdout") ? compileNode.get("stdout").asText() : "");
                    response.setCompileStderr(compileNode.has("stderr") ? compileNode.get("stderr").asText() : "");
                    response.setCompileCode(compileNode.has("code") ? compileNode.get("code").asInt() : null);
                }
            }

            System.out.println("Received response from Piston API: " + pistonResponse.toString());
            return ResponseEntity.ok(response); // Return 200 OK with the parsed response

            // --- FIX 2: Specific error handling for 4xx and 5xx HTTP errors from Piston ---
        } catch (HttpClientErrorException e) {
            // Catches HTTP 4xx errors (e.g., 400 Bad Request, 404 Not Found)
            // This happens if Piston doesn't like our request (e.g., unsupported language/version)
            System.err.println("Piston API Client Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            CodeExecutionResponse errorResponse = new CodeExecutionResponse();
            errorResponse.setError("Piston API Client Error (" + e.getStatusCode().value() + "): " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (HttpServerErrorException e) {
            // Catches HTTP 5xx errors (e.g., 500 Internal Server Error)
            // This happens if Piston itself has an issue
            System.err.println("Piston API Server Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            CodeExecutionResponse errorResponse = new CodeExecutionResponse();
            errorResponse.setError("Piston API Server Error (" + e.getStatusCode().value() + "): " + e.getResponseBodyAsString());
            return ResponseEntity.status(e.getStatusCode()).body(errorResponse);
        } catch (Exception e) {
            // Catch any other unexpected exceptions (e.g., network issues, JSON parsing problems)
            System.err.println("Error executing code via Piston API: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace for detailed debugging
            CodeExecutionResponse errorResponse = new CodeExecutionResponse();
            errorResponse.setError("Failed to execute code: An unexpected internal error occurred. " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Helper method to determine file extension based on language.
     * This list should align with the languages supported by Piston and your frontend.
     * @param clientLang The programming language name.
     * @return The corresponding file extension.
     */
    private String getFileExtension(String clientLang) {
        return switch (clientLang.toLowerCase()) {
            case "javascript" -> "js";
            case "typescript" -> "ts";
            case "java" -> "java";
            case "python" -> "py";
            case "cpp", "c++" -> "cpp"; // Covers both "cpp" and "c++"

            case "c" -> "c";

            case "sql" -> "sql";

            default -> "txt"; // Fallback for unrecognized or non-standard languages
        };
    }
}