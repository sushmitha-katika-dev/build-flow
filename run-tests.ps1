$services = Get-ChildItem -Path "backend" -Directory

foreach ($service in $services) {
    Write-Host "--- Testing $($service.Name) ---"
    Push-Location $service.FullName
    mvn test
    Pop-Location
}
