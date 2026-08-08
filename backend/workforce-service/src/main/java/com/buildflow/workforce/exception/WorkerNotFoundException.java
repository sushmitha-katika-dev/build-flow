package com.buildflow.workforce.exception;

public class WorkerNotFoundException extends RuntimeException {
    public WorkerNotFoundException(String message) {
        super(message);
    }
}
