# Script to kill process using a specific port
param(
    [int]$Port = 3000
)

Write-Host "Finding process using port $Port..."

$process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Found process ID: $process"
    Stop-Process -Id $process -Force
    Write-Host "Process $process has been terminated."
} else {
    Write-Host "No process found using port $Port"
}

