package com.buildflow.finance.exception;

public class ExpenseNotFoundException extends RuntimeException {
    public ExpenseNotFoundException(String message) {
        super(message);
    }
}
