$services = @(
    "auth-service",
    "project-service",
    "workforce-service",
    "inventory-service",
    "equipment-service",
    "finance-service",
    "reporting-service",
    "api-gateway"
)

Write-Host "Starting BuildFlow Backend Services..." -ForegroundColor Green

foreach ($service in $services) {
    Write-Host "Starting $service..." -ForegroundColor Cyan
    Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "Get-Content ..\..\.env | Where-Object { `$_.Trim() -ne '' -and -not `$_.StartsWith('#') } | ForEach-Object { `$name, `$value = `$_.Split('=', 2); Set-Item -Path env:`$name -Value `$value }; cd backend\$service; mvn spring-boot:run" -WindowStyle Normal
    Start-Sleep -Seconds 5 # Wait a few seconds between starts to reduce CPU spike
}

Write-Host "All services are starting up in separate windows." -ForegroundColor Green
Write-Host "Wait about 30-60 seconds for them to fully initialize." -ForegroundColor Yellow
Write-Host "API Gateway will be accessible at: http://localhost:8080" -ForegroundColor Cyan
