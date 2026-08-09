package com.buildflow.reporting.constants;

public class ReportingConstants {

    // Kafka Topics
    public static final String PROJECT_CREATED_TOPIC = "project-created";
    public static final String WORKFORCE_ATTENDANCE_TOPIC = "workforce-attendance";
    public static final String INVENTORY_USED_TOPIC = "inventory-used";
    public static final String FINANCE_PAYMENT_TOPIC = "finance-payment-received";
    public static final String FINANCE_EXPENSE_TOPIC = "finance-expense-recorded";

    // Cache Names
    public static final String DASHBOARD_CACHE = "dashboard";
    public static final String PROJECT_REPORT_CACHE = "project_report";
    public static final String FINANCE_REPORT_CACHE = "finance_report";
    
    private ReportingConstants() {}
}
