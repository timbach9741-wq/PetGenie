import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appPath = path.join(__dirname, 'src', 'App.tsx');
let text = fs.readFileSync(appPath, 'utf8');

// 1. Add lazy and Suspense to React import if not there
if (text.includes("import { useState, useEffect, useRef, useCallback } from 'react';")) {
  text = text.replace(
    "import { useState, useEffect, useRef, useCallback } from 'react';", 
    "import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';"
  );
} else if (!text.includes("lazy") && !text.includes("Suspense")) {
  text = text.replace("from 'react';", ", Suspense, lazy } from 'react';");
}

// 2. Replace static imports with lazy
const screens = [
  'CameraScreen', 'PetDashboard', 'HealthReport', 'DietGuideScreen', 
  'ExercisePlanScreen', 'Marketplace', 'InsuranceScreen', 'HospitalSearchScreen', 
  'MembershipScreen', 'AnalysisLoadingOverlay', 'CareGuideScreen', 'HistoryScreen', 'ProfileScreen'
];

screens.forEach(screen => {
  // It looks like `import Component from "./components/screens/Component";`
  const regex = new RegExp(`import ${screen} from ["']\\./components/screens/${screen}["'];`, 'g');
  if (regex.test(text)) {
    text = text.replace(regex, `const ${screen} = lazy(() => import('./components/screens/${screen}'));`);
  }
});

// For pre-existing separated screens: 
['OnboardingScreen', 'AuthScreens', 'SplashScreen'].forEach(sc => {
  const r1 = new RegExp(`import ${sc} from ["']\\./components/screens/${sc}["'];`, 'g');
  if (r1.test(text)) {
    text = text.replace(r1, `const ${sc} = lazy(() => import('./components/screens/${sc}'));`);
  }
  
  const r2 = new RegExp(`import { ([^}]*) } from ["']\\./components/screens/AuthScreens["'];`, 'g');
  if (r2.test(text)) {
    text = text.replace(r2, `const LoginScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.LoginScreen })));\nconst SignUpScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.SignUpScreen })));`);
  }
});

// Since AnalysisLoadingOverlay might be lazy, but it's used as fallback, we shouldn't lazy load it if it's the fallback. Let's keep AnalysisLoadingOverlay static, or just use a simple div. Let's use `null` or `<CircularProgress />` for fallback because AnalysisLoadingOverlay is a big screen.
// Actually, it's better to just wrap the whole conditional block!

text = text.replace(
  /{currentScreen === 'onboarding' && \(/,
  '<Suspense fallback={<div className="flex w-full h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div></div>}>\n              {currentScreen === \'onboarding\' && ('
);

text = text.replace(
  /<\/motion\.div>/,
  '</Suspense>\n            </motion.div>'
);

fs.writeFileSync(appPath, text, 'utf8');
console.log('App.tsx updated for lazy loading!');
