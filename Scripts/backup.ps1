# Requires: MongoDB Database Tools installed and in PATH (mongodump)
param(
  [string]$MongoUri = $env:MONGODB_URI,
  [string]$BackupRoot = "./backups",
  [int]$RetentionDays = 7
)

if (-not $MongoUri) {
  Write-Error "MONGODB_URI not set. Set in .env or pass -MongoUri."
  exit 1
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$target = Join-Path $BackupRoot $timestamp
New-Item -ItemType Directory -Path $target -Force | Out-Null

Write-Host "Backing up MongoDB to $target"
# Dump all databases referenced by connection string
mongodump --uri="$MongoUri" --out="$target"

# Cleanup old backups
Get-ChildItem -Path $BackupRoot -Directory | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } | Remove-Item -Recurse -Force

Write-Host "Backup completed."