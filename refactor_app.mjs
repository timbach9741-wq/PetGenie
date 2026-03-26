/**
 * App.tsx Refactoring Script
 * Extracts inline components from App.tsx into individual files
 * and rewrites App.tsx with proper imports.
 */

import fs from 'fs';
import path from 'path';

const APP_PATH = 'src/App.tsx';
const SCREENS_DIR = 'src/components/screens';
const COMMON_DIR = 'src/components/common';

const appContent = fs.readFileSync(APP_PATH, 'utf8');
const lines = appContent.split('\n');

console.log(`📄 App.tsx: ${lines.length} lines`);

// ============================================================
// Step 1: Find component boundaries
// ============================================================

// Helper: find the end of a component (matching braces)
function findComponentEnd(startLine) {
  let braceCount = 0;
  let started = false;
  for (let i = startLine; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') { braceCount++; started = true; }
      if (ch === '}') { braceCount--; }
    }
    // Component ends when we return to 0 braces after having started
    if (started && braceCount === 0) {
      // Check if next line is `};` 
      if (i + 1 < lines.length && lines[i + 1].trim() === '};') {
        return i + 1;
      }
      return i;
    }
  }
  return lines.length - 1;
}

// Find component start lines
function findComponentStart(name) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(`const ${name} `) || lines[i].startsWith(`const ${name}=`)) {
      return i;
    }
  }
  return -1;
}

// Components to extract with their target directories
const components = [
  // Common components
  { name: 'CircularProgress', dir: COMMON_DIR, isDefault: true },
  { name: 'LanguageSwitcher', dir: COMMON_DIR, isDefault: true, extraBefore: ['LANGUAGES'] },
  { name: 'AdBanner', dir: COMMON_DIR, isDefault: true },
  { name: 'StatusBar', dir: COMMON_DIR, isDefault: true },
  { name: 'Navigation', dir: COMMON_DIR, isDefault: true },
  // Screen components
  { name: 'OnboardingScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'PrivacyPolicyScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'CameraScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'HealthReport', dir: SCREENS_DIR, isDefault: true },
  { name: 'DietGuideScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'ExercisePlanScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'CareGuideScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'HistoryScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'MembershipScreen', dir: SCREENS_DIR, isDefault: true },
  { name: 'AnalysisLoadingOverlay', dir: COMMON_DIR, isDefault: true },
  { name: 'ProfileScreen', dir: SCREENS_DIR, isDefault: true },
];

// Find all component boundaries
const boundaries = [];
for (const comp of components) {
  const start = findComponentStart(comp.name);
  if (start === -1) {
    console.log(`⚠️  ${comp.name} not found in App.tsx`);
    continue;
  }
  const end = findComponentEnd(start);
  
  // Check for extra constants before the component (like LANGUAGES for LanguageSwitcher)
  let actualStart = start;
  if (comp.extraBefore) {
    for (const extra of comp.extraBefore) {
      const extraStart = findComponentStart(extra);
      if (extraStart !== -1 && extraStart < start) {
        actualStart = Math.min(actualStart, extraStart);
      }
    }
  }

  // Also include any comment block right before
  let commentStart = actualStart;
  while (commentStart > 0 && (lines[commentStart - 1].trim().startsWith('//') || lines[commentStart - 1].trim() === '')) {
    commentStart--;
  }
  // Don't go too far back
  if (actualStart - commentStart > 5) commentStart = actualStart - 2;
  if (commentStart < 0) commentStart = 0;

  boundaries.push({
    ...comp,
    startLine: commentStart,
    endLine: end,
    lineCount: end - commentStart + 1
  });
  
  console.log(`✅ ${comp.name}: lines ${commentStart + 1}-${end + 1} (${end - commentStart + 1} lines)`);
}

// Sort by start line
boundaries.sort((a, b) => a.startLine - b.startLine);

// ============================================================
// Step 2: Extract each component to its own file
// ============================================================

// Analyze which lucide icons are used in each component
const lucideIcons = [
  'Camera', 'Heart', 'LayoutDashboard', 'ShoppingBag', 'FileText', 'Settings',
  'Scan', 'ChevronRight', 'Activity', 'Weight', 'Calendar', 'AlertCircle',
  'CheckCircle2', 'ArrowLeft', 'ArrowRight', 'Search', 'Plus', 'MoreVertical',
  'Cross', 'Battery', 'Wifi', 'Signal', 'Shield', 'TrendingUp', 'Utensils',
  'Moon', 'Clock', 'Droplets', 'MapPin', 'Upload', 'BriefcaseMedical',
  'Eye', 'Dna', 'BookOpen', 'Quote', 'Lock', 'ChevronLeft', 'User', 'Star',
  'Bell', 'Sun', 'CloudRain', 'Thermometer', 'Check', 'Sparkles', 'PawPrint',
  'ChevronDown', 'LogOut', 'Globe', 'HelpCircle', 'Share2', 'X', 'Info',
  'Stethoscope', 'MessageCircle', 'Send', 'Trash2', 'Image', 'Mic',
  'Navigation'
];

function getUsedIcons(code) {
  const used = [];
  for (const icon of lucideIcons) {
    // Check for usage pattern: <Icon or icon={Icon} or Icon,
    const patterns = [
      new RegExp(`<${icon}[\\s/>]`),
      new RegExp(`icon:\\s*${icon}[,\\s}]`),
      new RegExp(`${icon}\\.`),
      new RegExp(`\\b${icon}\\b`)
    ];
    if (patterns.some(p => p.test(code))) {
      // Handle Navigation alias
      if (icon === 'Navigation') {
        used.push('Navigation as NavIcon');
      } else if (icon === 'History') {
        used.push('History as HistoryIcon');
      } else {
        used.push(icon);
      }
    }
  }
  return [...new Set(used)];
}

function getComponentCode(boundary) {
  return lines.slice(boundary.startLine, boundary.endLine + 1).join('\n');
}

function buildImports(code, componentName, dir) {
  const imports = [];
  
  // React imports
  const reactHooks = ['useState', 'useEffect', 'useRef', 'useCallback', 'useMemo', 'Suspense', 'lazy'];
  const usedHooks = reactHooks.filter(h => code.includes(h));
  if (usedHooks.length > 0) {
    imports.push(`import React, { ${usedHooks.join(', ')} } from 'react';`);
  }
  
  // i18n
  if (code.includes('useTranslation') || code.includes('Trans')) {
    const i18nImports = [];
    if (code.includes('useTranslation')) i18nImports.push('useTranslation');
    if (code.includes('Trans')) i18nImports.push('Trans');
    imports.push(`import { ${i18nImports.join(', ')} } from 'react-i18next';`);
  }
  
  // Lucide icons
  const icons = getUsedIcons(code);
  if (icons.length > 0) {
    imports.push(`import { ${icons.join(', ')} } from 'lucide-react';`);
  }
  
  // Motion
  if (code.includes('motion.') || code.includes('AnimatePresence') || code.includes('motion,')) {
    const motionImports = [];
    if (code.includes('motion.') || code.includes('motion,')) motionImports.push('motion');
    if (code.includes('AnimatePresence')) motionImports.push('AnimatePresence');
    imports.push(`import { ${motionImports.join(', ')} } from 'motion/react';`);
  }
  
  // cn utility
  if (code.includes('cn(')) {
    const depth = dir === COMMON_DIR ? '../../' : '../../';
    imports.push(`import { cn } from '${depth}lib/utils';`);
  }
  
  // Screen type
  if (code.includes('Screen)') || code.includes('Screen >') || code.includes(': Screen')) {
    imports.push(`import type { Screen } from '../../types';`);
  }
  
  // CareItem type
  if (code.includes('CareItem')) {
    imports.push(`import type { CareItem } from '../../types';`);
  }
  
  // PetProfile type
  if (code.includes('PetProfile')) {
    imports.push(`import type { PetProfile } from '../../types';`);
  }
  
  // CircularProgress (for components that use it)
  if (code.includes('<CircularProgress') && componentName !== 'CircularProgress') {
    imports.push(`import CircularProgress from '../common/CircularProgress';`);
  }
  
  // AdBanner
  if (code.includes('<AdBanner') && componentName !== 'AdBanner') {
    imports.push(`import AdBanner from '../common/AdBanner';`);
  }
  
  // LanguageSwitcher
  if (code.includes('<LanguageSwitcher') && componentName !== 'LanguageSwitcher') {
    imports.push(`import LanguageSwitcher from '../common/LanguageSwitcher';`);
  }
  
  // StatusBar
  if (code.includes('<StatusBar') && componentName !== 'StatusBar') {
    imports.push(`import StatusBar from '../common/StatusBar';`);
  }

  // Google GenAI
  if (code.includes('GoogleGenAI')) {
    imports.push(`import { GoogleGenAI } from "@google/genai";`);
  }

  // GEMINI_API_KEY
  if (code.includes('GEMINI_API_KEY')) {
    imports.push(`\nconst GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;`);
  }
  
  return imports.join('\n');
}

// Extract each component
for (const boundary of boundaries) {
  const code = getComponentCode(boundary);
  const imports = buildImports(code, boundary.name, boundary.dir);
  
  // Build the file content
  let fileContent = `${imports}\n\n${code}\n\nexport default ${boundary.name};\n`;
  
  // Write file
  const filePath = path.join(boundary.dir, `${boundary.name}.tsx`);
  fs.writeFileSync(filePath, fileContent, 'utf8');
  console.log(`📁 Wrote ${filePath} (${fileContent.split('\n').length} lines)`);
}

// ============================================================
// Step 3: Rebuild App.tsx with imports only
// ============================================================

// Find the main App function
let appFunctionStart = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].startsWith('function App(') || lines[i].startsWith('export default function App(')) {
    appFunctionStart = i;
    break;
  }
}

if (appFunctionStart === -1) {
  // Try alternative: look for `export default function App`
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('function App()')) {
      appFunctionStart = i;
      break;
    }
  }
}

console.log(`\n🔍 App function starts at line ${appFunctionStart + 1}`);

// Collect lines that are NOT part of any extracted component and NOT before App function
// We want: imports (original) + MOCK_PET (leave it or move) + types + App function

// Find what's before the first component
const firstCompStart = boundaries[0].startLine;

// Find MOCK_PET boundaries
const mockPetStart = findComponentStart('MOCK_PET');
let mockPetEnd = mockPetStart;
if (mockPetStart >= 0) {
  let braces = 0;
  let started = false;
  for (let i = mockPetStart; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') { braces++; started = true; }
      if (ch === '}') { braces--; }
    }
    if (started && braces === 0) {
      mockPetEnd = i;
      // Check for };
      if (i + 1 < lines.length && lines[i + 1].trim() === '};') {
        mockPetEnd = i + 1;
      }
      break;
    }
  }
}

// Build new App.tsx
const newLines = [];

// 1. Original imports (lines 1 to first component or MOCK_PET, whichever comes first)
const importEnd = Math.min(firstCompStart, mockPetStart >= 0 ? mockPetStart : firstCompStart);

// Add original imports but filter out things we don't need
for (let i = 0; i < importEnd; i++) {
  const line = lines[i];
  // Skip the old SplashScreen/OnboardingScreen imports from screens/index
  // We'll add proper imports below
  if (line.includes("from './components/screens'") || line.includes("from './components/common'")) {
    continue;
  }
  newLines.push(line);
}

// 2. Add imports for extracted components
newLines.push('');
newLines.push('// --- Extracted Screen Components ---');
for (const b of boundaries.filter(b => b.dir === SCREENS_DIR)) {
  newLines.push(`import ${b.name} from './components/screens/${b.name}';`);
}
newLines.push('');
newLines.push('// --- Extracted Common Components ---');
for (const b of boundaries.filter(b => b.dir === COMMON_DIR)) {
  newLines.push(`import ${b.name} from './components/common/${b.name}';`);
}

// Also import AIVetScreen (already exists separately)
newLines.push(`import AIVetScreen from './components/screens/AIVetScreen';`);
// PetDashboard (already exists separately)
newLines.push(`import PetDashboard from './components/screens/PetDashboard';`);
// Auth screens
newLines.push(`import { LoginScreen, SignUpScreen } from './components/screens/AuthScreens';`);
// SplashScreen
newLines.push(`import { SplashScreen } from './components/screens/SplashScreen';`);

newLines.push('');

// 3. Add MOCK_PET and types (if they exist between imports and first component)
if (mockPetStart >= 0) {
  for (let i = mockPetStart; i <= mockPetEnd; i++) {
    newLines.push(lines[i]);
  }
  newLines.push('');
}

// Types are defined near line 70-87, should already be in the import block
// But we need Screen and CareItem types
// Check if they're in the import block already
const hasTypeImport = newLines.some(l => l.includes("from './types'") || l.includes("type Screen"));
if (!hasTypeImport) {
  // Add type definitions that exist in App.tsx
  for (let i = importEnd; i < (mockPetStart >= 0 ? mockPetStart : firstCompStart); i++) {
    const line = lines[i];
    if (line.trim() !== '' && !line.startsWith('const ')) {
      newLines.push(line);
    }
  }
}

// 4. Add the main App function (everything from appFunctionStart to end)
newLines.push('');
for (let i = appFunctionStart; i < lines.length; i++) {
  newLines.push(lines[i]);
}

// Write the new App.tsx
const newContent = newLines.join('\n');
console.log(`\n📝 New App.tsx: ${newContent.split('\n').length} lines (was ${lines.length})`);

// Backup original
fs.copyFileSync(APP_PATH, APP_PATH + '.backup');
console.log(`💾 Backed up original to ${APP_PATH}.backup`);

// Write new file
fs.writeFileSync(APP_PATH, newContent, 'utf8');
console.log(`✅ App.tsx refactored!`);

// Summary
console.log('\n=== Summary ===');
for (const b of boundaries) {
  console.log(`  ${b.name} → ${path.join(b.dir, b.name + '.tsx')} (${b.lineCount} lines)`);
}
console.log(`  App.tsx: ${lines.length} → ${newContent.split('\n').length} lines`);
