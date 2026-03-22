import { Project, SyntaxKind } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const project = new Project({
    tsConfigFilePath: path.join(__dirname, "tsconfig.json") // standard Vite TS config
  });

  const appFile = project.getSourceFileOrThrow("src/App.tsx");

  // Get all variable statements
  const varStatements = appFile.getVariableStatements();
  
  const screensToExtract = [
    'CameraScreen', 'PetDashboard', 'HealthReport', 'DietGuideScreen', 
    'ExercisePlanScreen', 'Marketplace', 'InsuranceScreen', 'HospitalSearchScreen', 
    'MembershipScreen', 'AnalysisLoadingOverlay', 'CareGuideScreen', 'HistoryScreen', 'ProfileScreen'
  ];

  // Prepare standard imports and types for the new files
  const baseImports = `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { 
  Camera, Heart, LayoutDashboard, ShoppingBag, FileText, Settings, Scan, ChevronRight, Activity, Weight, Calendar,
  AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Search, Plus, MoreVertical, Cross, Battery, Wifi, Signal,
  Shield, TrendingUp, Utensils, Moon, Clock, Droplets, MapPin, Navigation as NavIcon, Upload, BriefcaseMedical,
  Eye, Dna, BookOpen, Quote, Lock, History as HistoryIcon, ChevronLeft, User, Star, Bell, Sun, CloudRain,
  Thermometer, Check, Sparkles, PawPrint, ChevronDown, LogOut, Globe, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { GoogleGenAI } from "@google/genai";
import { Screen, PetProfile, CareItem } from '../../types';
import { CircularProgress, LanguageSwitcher, Navigation, AdBanner, StatusBar } from '../common';
`;

  let replacedCount = 0;
  
  for (const statement of varStatements) {
    const decls = statement.getDeclarations();
    if (decls.length > 0) {
      const name = decls[0].getName();
      if (screensToExtract.includes(name)) {
        console.log(`Extracting ${name}...`);
        
        const componentCode = statement.getText();
        
        // Write to new file
        const newFilePath = path.join(__dirname, 'src', 'components', 'screens', `${name}.tsx`);
        const newFileContent = `${baseImports}\n\n${componentCode}\n\nexport default ${name};\n`;
        
        fs.writeFileSync(newFilePath, newFileContent, 'utf8');
        
        // Replace in App.tsx
        statement.remove();
        
        // Add lazy import at top of App.tsx
        appFile.addImportDeclaration({
          defaultImport: name,
          moduleSpecifier: `./components/screens/${name}`
        });
        
        replacedCount++;
      }
    }
  }

  // Also replace `React.lazy` imports if needed... just normal imports for now.
  if (replacedCount > 0) {
    appFile.saveSync();
    console.log(`Successfully extracted ${replacedCount} screens!`);
  } else {
    console.log('No screens extracted. Check if the names are correct.');
  }
}

run().catch(err => {
  console.error(err);
});
