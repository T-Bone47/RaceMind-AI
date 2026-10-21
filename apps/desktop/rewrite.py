import os
import re

components = [
    "WeatherRadar.tsx",
    "TyreThermal.tsx",
    "StrategyPanel.tsx",
    "RaceIntel.tsx",
    "RaceHeader.tsx",
    "PowerUnit.tsx",
    "CommsFeed.tsx",
    "AIEngineer.tsx"
]

base_dir = r"c:\Users\olive\Downloads\RaceMind-AI-v1-handoff\RaceMind-AI\apps\desktop\src\components\dashboard"

for comp in components:
    path = os.path.join(base_dir, comp)
    if not os.path.exists(path):
        continue
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract what was imported from '../../data/race'
    match = re.search(r'import\s+{([^}]+)}\s+from\s+[\'"]\.\./\.\./data/race[\'"]', content)
    if not match:
        continue
        
    vars_imported = match.group(1).strip()
    
    # Remove the import
    content = re.sub(r'import\s+{[^}]+}\s+from\s+[\'"]\.\./\.\./data/race[\'"];?\n', '', content)
    
    # Add hook import
    content = f"import {{ useRaceData }} from '../../hooks/useRaceData';\n" + content
    
    # Find the component definition
    # e.g., export function WeatherRadar() {
    comp_def = r'(export\s+function\s+' + comp.replace('.tsx', '') + r'\s*\([^)]*\)\s*{)'
    
    # Add hook call
    hook_call = f"\n  const {{ {vars_imported} }} = useRaceData();\n"
    content = re.sub(comp_def, r'\1' + hook_call, content)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    
    print(f"Rewrote {comp}")
