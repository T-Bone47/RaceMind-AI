const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/olive/Downloads/RaceMind-AI-v1-handoff/RaceMind-AI/apps/desktop/src/components/setup';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix React import
  content = content.replace(/import React(, \{([^}]*)\})? from 'react';/, (match, p1, p2) => {
    if (p2) return `import {${p2}} from 'react';`;
    return '';
  });
  content = content.replace(/import React from 'react';\n?/, '');

  // Specific fixes
  if (file === 'AIAssistantPanel.tsx') {
    content = content.replace(/doc\./g, 'doc?.');
  }
  if (file === 'CircuitIntelligence.tsx') {
    content = content.replace(/z\./g, 'z?.');
  }
  if (file === 'DocumentLibrary.tsx') {
    content = content.replace(/style=\{\{ color: doc\.color \}\}/, '');
  }

  fs.writeFileSync(filePath, content);
}
console.log('Fixed TS errors in ' + files.length + ' files');
