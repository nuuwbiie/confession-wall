$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
node node_modules/next/dist/bin/next.js lint 2>&1
