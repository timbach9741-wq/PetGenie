import { Project } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const project = new Project({ tsConfigFilePath: path.join(__dirname, "tsconfig.json") });
  const appFile = project.getSourceFileOrThrow("src/App.tsx");

  const componentsToRemove = [
    'CircularProgress', 'LanguageSwitcher', 'OnboardingScreen', 
    'LoginScreen', 'SignUpScreen', 'Navigation', 'StatusBar', 
    'AdBanner', 'SplashScreen', 'AnalysisLoadingOverlay'
  ];

  const componentsToExtract = [
    'CameraScreen', 'PetDashboard', 'DietGuideScreen', 
    'ExercisePlanScreen', 'MembershipScreen', 'CareGuideScreen', 
    'HistoryScreen', 'ProfileScreen', 'HealthReport', 'PrivacyPolicyScreen',
    'Marketplace', 'InsuranceScreen', 'HospitalSearchScreen'
  ];

  const baseImports = `import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { 
  Camera, Heart, LayoutDashboard, ShoppingBag, FileText, Settings, Scan, ChevronRight, Activity, Weight, Calendar,
  AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Search, Plus, MoreVertical, Cross, Battery, Wifi, Signal,
  Shield, TrendingUp, Utensils, Moon, Clock, Droplets, MapPin, Navigation as NavIcon, Upload, BriefcaseMedical,
  Eye, Dna, BookOpen, Quote, Lock, History as HistoryIcon, ChevronLeft, User, Star, Bell, Sun, CloudRain,
  Thermometer, Check, Sparkles, PawPrint, ChevronDown, LogOut, Globe, HelpCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { Screen, PetProfile, CareItem } from '../../types';
import { CircularProgress, LanguageSwitcher, Navigation, AdBanner, StatusBar } from '../common';
`;

  const varStatements = appFile.getVariableStatements();
  
  for (const statement of varStatements) {
    const decls = statement.getDeclarations();
    if (decls.length > 0) {
      const name = decls[0].getName();
      
      if (componentsToRemove.includes(name)) {
        console.log(`Removing ${name}...`);
        statement.remove();
      } else if (componentsToExtract.includes(name)) {
        console.log(`Extracting ${name}...`);
        const componentCode = statement.getText();
        const newFilePath = path.join(__dirname, 'src', 'components', 'screens', `${name}.tsx`);
        fs.writeFileSync(newFilePath, `${baseImports}\n\n${componentCode}\n\nexport default ${name};\n`, 'utf8');
        statement.remove();
      }
    }
  }

  // Also manually change App.tsx text for imports and Suspense
  appFile.saveSync();

  console.log('AST manipulation done. Fixing imports in App.tsx...');

  // Read the saved file and finalize using regex for precise Suspsense insertion and Imports
  let text = fs.readFileSync('src/App.tsx', 'utf8');

  // Inject standard lazy imports
  const lazyImports = `
import { Suspense, lazy } from 'react';
import { CircularProgress, LanguageSwitcher, Navigation, AdBanner, StatusBar } from './components/common';
const SplashScreen = lazy(() => import('./components/screens/SplashScreen').then(m => ({ default: m.SplashScreen })));
const AnalysisLoadingOverlay = lazy(() => import('./components/screens/SplashScreen').then(m => ({ default: m.AnalysisLoadingOverlay })));
const OnboardingScreen = lazy(() => import('./components/screens/OnboardingScreen'));
const LoginScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.LoginScreen })));
const SignUpScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.SignUpScreen })));
const CameraScreen = lazy(() => import('./components/screens/CameraScreen'));
const HistoryScreen = lazy(() => import('./components/screens/HistoryScreen'));
const PetDashboard = lazy(() => import('./components/screens/PetDashboard'));
const DietGuideScreen = lazy(() => import('./components/screens/DietGuideScreen'));
const ExercisePlanScreen = lazy(() => import('./components/screens/ExercisePlanScreen'));
const CareGuideScreen = lazy(() => import('./components/screens/CareGuideScreen'));
const HealthReport = lazy(() => import('./components/screens/HealthReport'));
const PrivacyPolicyScreen = lazy(() => import('./components/screens/PrivacyPolicyScreen'));
const MembershipScreen = lazy(() => import('./components/screens/MembershipScreen'));
const ProfileScreen = lazy(() => import('./components/screens/ProfileScreen'));
`;

  // Place it after imports
  text = text.replace(/import { cn } from '\.\/lib\/utils';/, "import { cn } from './lib/utils';" + lazyImports);

  // Add Suspense inside App
  text = text.replace(
    /\{currentScreen === 'onboarding' && \(/,
    '<Suspense fallback={<div className="flex w-full h-full items-center justify-center"><CircularProgress size={40} /></div>}>\n              {currentScreen === \'onboarding\' && ('
  );

  text = text.replace(
    /\{currentScreen === 'profile' && \([\s\S]*?<\/motion\.div>/,
    match => match.replace('</motion.div>', '</Suspense>\n            </motion.div>')
  );
  
  // also wrap splashscreen and analysis loading in suspense
  text = text.replace(
    /<AnimatePresence>\s*\{isLoading && <SplashScreen \/>\}\s*\{isAnalyzing && <AnalysisLoadingOverlay \/>\}\s*<\/AnimatePresence>/,
    `<AnimatePresence>
          <Suspense fallback={null}>
            {isLoading && <SplashScreen />}
            {isAnalyzing && <AnalysisLoadingOverlay />}
          </Suspense>
        </AnimatePresence>`
  );

  fs.writeFileSync('src/App.tsx', text, 'utf8');
  console.log('App.tsx string replacements done.');
}

run().catch(console.error);
