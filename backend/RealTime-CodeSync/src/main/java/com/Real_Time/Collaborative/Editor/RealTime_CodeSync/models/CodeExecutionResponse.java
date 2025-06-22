package com.Real_Time.Collaborative.Editor.RealTime_CodeSync.models;

public  class CodeExecutionResponse {
    public String stdout;
    public String stderr;
    public Integer runCode; // Exit code for run
    public String compileStdout;
    public String compileStderr;
    public Integer compileCode; // Exit code for compile
    public String error; // For general errors/messages from our proxy

    // Getters and setters (omitted for brevity)
    public String getStdout() { return stdout; }
    public void setStdout(String stdout) { this.stdout = stdout; }
    public String getStderr() { return stderr; }
    public void setStderr(String stderr) { this.stderr = stderr; }
    public Integer getRunCode() { return runCode; }
    public void setRunCode(Integer runCode) { this.runCode = runCode; }
    public String getCompileStdout() { return compileStdout; }
    public void setCompileStdout(String compileStdout) { this.compileStdout = compileStdout; }
    public String getCompileStderr() { return compileStderr; }
    public void setCompileStderr(String compileStderr) { this.compileStderr = compileStderr; }
    public Integer getCompileCode() { return compileCode; }
    public void setCompileCode(Integer compileCode) { this.compileCode = compileCode; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}