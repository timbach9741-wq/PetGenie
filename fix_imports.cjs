/**
 * Fix App.tsx import ordering
 */
const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

// Find all sections
const importLines = [];
const typeLines = [];
const mockPetLines = [];
const appFunctionLines = [];

let section = 'header';
let inMockPet = false;
let braces = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.replace(/\r$/, '');
  
  // Skip header comment
  if (i < 5 && (trimmed.startsWith('/**') || trimmed.startsWith(' *') || trimmed.startsWith(' */'))) {
    continue;
  }
  
  // App function starts
  if (trimmed.startsWith('export default function App()')) {
    appFunctionLines.push(line);
    for (let j = i + 1; j < lines.length; j++) {
      appFunctionLines.push(lines[j]);
    }
    break;
  }
  
  // MOCK_PET
  if (trimmed.startsWith('const MOCK_PET')) {
    inMockPet = true;
    braces = 0;
  }
  
  if (inMockPet) {
    mockPetLines.push(line);
    for (const ch of line) {
      if (ch === '{') braces++;
      if (ch === '}') braces--;
    }
    if (braces === 0 && mockPetLines.length > 1) {
      // Check next line for };
      if (i + 1 < lines.length && lines[i+1].trim().startsWith('};')) {
        mockPetLines.push(lines[i+1]);
        i++;
      }
      inMockPet = false;
    }
    continue;
  }
  
  // Import lines
  if (trimmed.startsWith('import ') || trimmed.startsWith('import{')) {
    importLines.push(line);
    continue;
  }
  
  // Type/interface declarations
  if (trimmed.startsWith('type ') || trimmed.startsWith('interface ')) {
    typeLines.push(line);
    // For multi-line interfaces, grab until closing brace
    if (trimmed.includes('{') && !trimmed.includes('}')) {
      for (let j = i + 1; j < lines.length; j++) {
        typeLines.push(lines[j]);
        if (lines[j].trim().startsWith('}')) {
          i = j;
          break;
        }
      }
    }
    continue;
  }
  
  // GEMINI_API_KEY constant
  if (trimmed.startsWith('const GEMINI_API_KEY')) {
    // Already handle
    importLines.push(line);
    continue;
  }
  
  // Comment lines that are section headers
  if (trimmed.startsWith('// ---') || trimmed === '') {
    continue;
  }
}

// Deduplicate imports
const seenImports = new Set();
const uniqueImports = [];
for (const imp of importLines) {
  const normalized = imp.replace(/\r$/, '').trim();
  if (!seenImports.has(normalized) && normalized !== '') {
    seenImports.add(normalized);
    uniqueImports.push(imp);
  }
}

// Fix Navigation import conflict - rename common/Navigation to NavigationBar
const fixedImports = uniqueImports.map(imp => {
  const trimmed = imp.replace(/\r$/, '');
  if (trimmed.includes("import Navigation from './components/common/Navigation'")) {
    return "import NavigationBar from './components/common/Navigation';";
  }
  return imp;
});

// Build new file
const newContent = [
  '/**',
  ' * @license', 
  ' * SPDX-License-Identifier: Apache-2.0',
  ' */',
  '',
  ...fixedImports,
  '',
  '// --- Types ---',
  ...typeLines,
  '',
  '// --- Mock Data ---',
  ...mockPetLines,
  '',
  ...appFunctionLines
].join('\n');

// Fix NavigationBar usage in the App function
const finalContent = newContent.replace(
  /<Navigation current=/g,
  '<NavigationBar current='
);

fs.writeFileSync('src/App.tsx', finalContent, 'utf8');
console.log('Lines before:', lines.length);
console.log('Lines after:', finalContent.split('\n').length);
console.log('Unique imports:', fixedImports.length);
console.log('Done!');
