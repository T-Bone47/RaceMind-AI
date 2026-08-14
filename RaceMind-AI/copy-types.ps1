Copy-Item -Path "frontend magic patterns\src\types" -Destination "apps\desktop\src\types" -Recurse -Force
if (!(Test-Path "apps\desktop\src\hooks")) { New-Item -ItemType Directory -Force -Path "apps\desktop\src\hooks" }
Copy-Item -Path "frontend magic patterns\src\hooks\useLiveTick.ts" -Destination "apps\desktop\src\hooks\" -Force
