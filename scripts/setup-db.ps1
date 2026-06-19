#Requires -Version 5.1
<#
.SYNOPSIS
  Run Prisma migrate + seed against DATABASE_URL in .env (Supabase)

.EXAMPLE
  .\scripts\setup-db.ps1
#>
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Run-Step($Label, $Command) {
  Write-Host ""
  Write-Host "==> $Label" -ForegroundColor Cyan
  Invoke-Expression $Command
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed: $Label (exit $LASTEXITCODE)" -ForegroundColor Red
    exit $LASTEXITCODE
  }
}

if (-not (Test-Path ".env")) {
  Write-Host "Missing .env - copy .env.example and add Supabase DATABASE_URL + DIRECT_URL" -ForegroundColor Red
  exit 1
}

Run-Step "Prisma generate" "npm run db:generate"
Run-Step "Migrate deploy (uses DIRECT_URL)" "npx prisma migrate deploy"
Run-Step "Seed database" "npm run db:seed"

Write-Host ""
Write-Host "Done! Run: npm run dev" -ForegroundColor Green
