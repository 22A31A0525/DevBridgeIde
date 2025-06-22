package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.controllers;

import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.Code; // Assuming this DTO exists
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models.CodeExecutionResponse;
import com.Real_Time.Collaborative.Editor.RealTime_CodeSync.services.CodeExecute; // Your service
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/code/execute") // This base path means the POST endpoint will be /api/code/execute
public class CompileCodeControl {


    private final CodeExecute codeExecute;

    public CompileCodeControl(CodeExecute codeExecute) {
        this.codeExecute = codeExecute;
    }


    @PostMapping // This maps to /api/code/execute (because of @RequestMapping on class)
    public ResponseEntity<CodeExecutionResponse> getData(@RequestBody Code code){
        String clientCode = code.getCode();
        String clientLang = code.getLanguage(); // Correct variable name
        String clientLangVers = code.getVersion();

        // --- FIX 3: Correctly pass clientLang and clientLangVers to the service method ---
        return codeExecute.getOutputAfterRun(clientCode, clientLang, clientLangVers);
    }
}