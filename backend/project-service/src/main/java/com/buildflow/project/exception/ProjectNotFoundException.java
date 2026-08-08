package com.buildflow.project.exception;

public class ProjectNotFoundException extends RuntimeException {
    public ProjectNotFoundException(String message) {
        super(message);
    }
    
    public ProjectNotFoundException() {
        super("Project not found");
    }
}
