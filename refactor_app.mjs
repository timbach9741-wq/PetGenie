import fs from 'fs';

const content = fs.readFileSync('src/App.tsx', 'utf8');

// Find the start of export default function App()
const appStartIndex = content.indexOf('export default function App() {');
if (appStartIndex === -1) {
    console.error('Could not find App component');
    process.exit(1);
}

const appComponent = content.slice(appStartIndex);

// Construct the new App.tsx
const newContent = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Camera, Heart, LayoutDashboard, ShoppingBag, FileText, Settings, ArrowLeft, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleProvider, useGoogleLogin } from '@react-oauth/google';
import { cn } from './lib/utils';
import { Navigation, StatusBar, AdBanner, LanguageSwitcher } from './components/common';

// Lazy loaded screens
const SplashScreen = lazy(() => import('./components/screens/SplashScreen').then(m => ({ default: m.SplashScreen })));
const AuthScreens = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.AuthScreens })));
const OnboardingScreen = lazy(() => import('./components/screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })));
const CameraScreen = lazy(() => import('./components/screens/CameraScreen').then(m => ({ default: m.CameraScreen })));
const AnalysisLoadingOverlay = lazy(() => import('./components/screens/AnalysisLoadingOverlay').then(m => ({ default: m.AnalysisLoadingOverlay })));
const HealthReport = lazy(() => import('./components/screens/HealthReport').then(m => ({ default: m.HealthReport })));
const ProfileScreen = lazy(() => import('./components/screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const HistoryScreen = lazy(() => import('./components/screens/HistoryScreen').then(m => ({ default: m.HistoryScreen })));
const PetDashboard = lazy(() => import('./components/screens/PetDashboard').then(m => ({ default: m.PetDashboard })));
const CareGuideScreen = lazy(() => import('./components/screens/CareGuideScreen').then(m => ({ default: m.CareGuideScreen })));
const ExercisePlanScreen = lazy(() => import('./components/screens/ExercisePlanScreen').then(m => ({ default: m.ExercisePlanScreen })));
const DietGuideScreen = lazy(() => import('./components/screens/DietGuideScreen').then(m => ({ default: m.DietGuideScreen })));
const HospitalSearchScreen = lazy(() => import('./components/screens/HospitalSearchScreen').then(m => ({ default: m.HospitalSearchScreen })));
const InsuranceScreen = lazy(() => import('./components/screens/InsuranceScreen').then(m => ({ default: m.InsuranceScreen })));
const Marketplace = lazy(() => import('./components/screens/Marketplace').then(m => ({ default: m.Marketplace })));
const MembershipScreen = lazy(() => import('./components/screens/MembershipScreen').then(m => ({ default: m.MembershipScreen })));
const PrivacyPolicyScreen = lazy(() => import('./components/screens/PrivacyPolicyScreen').then(m => ({ default: m.PrivacyPolicyScreen })));

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Temporary fallback data for demo purposes if API fails
const getFallbackResult = (t) => ({
  breedInfo: {
    primary: "Golden Retriever Mix",
    secondary: "Labrador",
    confidence: 94,
    traits: [t('fallback.trait_friendly'), t('fallback.trait_energetic'), t('fallback.trait_loyal')],
    isFallback: true
  },
  healthIndicators: [
    { name: t('fallback.indicator_coat'), status: "excellent", description: t('fallback.desc_coat_excellent') },
    { name: t('fallback.indicator_eyes'), status: "good", description: t('fallback.desc_eyes_good') },
    { name: t('fallback.indicator_weight'), status: "fair", description: t('fallback.desc_weight_fair'), recommendation: t('fallback.rec_weight_fair') }
  ],
  customAdvice: [
    t('fallback.advice_diet'),
    t('fallback.advice_brushing')
  ],
  isFallback: true
});

` + appComponent;

fs.writeFileSync('src/App.tsx', newContent);
console.log('Successfully refactored App.tsx!');
