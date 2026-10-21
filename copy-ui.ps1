Copy-Item -Path "frontend magic patterns\src\data" -Destination "apps\desktop\src\data" -Recurse -Force
Copy-Item -Path "frontend magic patterns\src\utils\series.ts" -Destination "apps\desktop\src\utils\" -Force
$files = @("TimingTower.tsx", "CircuitMap.tsx", "TyreThermal.tsx", "PowerUnit.tsx", "WeatherRadar.tsx", "CommsFeed.tsx", "RaceIntel.tsx")
foreach ($file in $files) {
    Copy-Item -Path "frontend magic patterns\src\components\dashboard\$file" -Destination "apps\desktop\src\components\dashboard\" -Force
}
