# Local dev: Cloud SQL proxy + API + Course Load Planner UI
# Prerequisites:
#   1. Application Default Credentials for the proxy: run once
#        gcloud auth application-default login
#      (Install Google Cloud SDK if gcloud is missing: winget install Google.CloudSDK)
#   2. Proxy: either on PATH as "cloud-sql-proxy", or the bundled exe at tools\cloud-sql-proxy.exe
#      (Download v2 x64: https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.21.2/cloud-sql-proxy.x64.exe
#       save as tools\cloud-sql-proxy.exe)
#   3. team110-api\.env with real DB_USER / DB_PASSWORD (not "your-password")

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Instance = "root-matrix-441506-r9:us-central1:db-sp26-team110"
$ProxyPort = 3307

$bundledProxy = Join-Path $Root "tools\cloud-sql-proxy.exe"
$proxyExe = $null
if (Test-Path -LiteralPath $bundledProxy) {
  $proxyExe = $bundledProxy
} else {
  $proxyCmd = Get-Command cloud-sql-proxy -ErrorAction SilentlyContinue
  if ($proxyCmd) { $proxyExe = $proxyCmd.Source }
}

if (-not $proxyExe) {
  Write-Host "cloud-sql-proxy not found (PATH or $bundledProxy)." -ForegroundColor Yellow
  Write-Host "Install from: https://cloud.google.com/sql/docs/mysql/sql-proxy#install" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Opening API + UI only (database calls will fail until proxy runs and .env is correct)." -ForegroundColor Yellow
} else {
  Write-Host "Starting Cloud SQL Auth Proxy on port $ProxyPort ($proxyExe)..." -ForegroundColor Green
  $proxyArgList = @(
    "-NoExit", "-Command",
    "Write-Host 'Cloud SQL Proxy (close this window to stop)'; & '$proxyExe' '$Instance' --port $ProxyPort"
  )
  Start-Process powershell -ArgumentList $proxyArgList
  Start-Sleep -Seconds 4
}

Write-Host "Starting team110-api on http://127.0.0.1:8080 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Root\team110-api'; npm run dev"
)

Start-Sleep -Seconds 2

Write-Host "Starting Course Load Planner UI (Vite) ..." -ForegroundColor Green
Start-Process powershell -ArgumentList @(
  "-NoExit", "-Command",
  "Set-Location '$Root\Courseloadplannerui'; npm run dev"
)

Write-Host ""
Write-Host "Done. Use the Vite URL (usually http://localhost:3000)." -ForegroundColor Cyan
Write-Host "Edit $Root\team110-api\.env if you see database errors." -ForegroundColor Cyan
