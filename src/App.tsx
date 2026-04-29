import { ADMOB_IDS } from './config/ads';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { 
  Camera, Heart, LayoutDashboard, ShoppingBag, FileText, Settings, Scan,
  ChevronRight, Activity, Weight, Calendar, AlertCircle, CheckCircle2,
  ArrowLeft, ArrowRight, Search, Plus, MoreVertical, Battery, Wifi, Signal,
  Shield, TrendingUp, Utensils, Moon, Clock, Droplets, MapPin,
  Navigation as NavIcon, Upload, BriefcaseMedical, Eye, Dna, BookOpen,
  Quote, Lock, History as HistoryIcon, ChevronLeft, User, Star, Bell, Sun,
  CloudRain, Thermometer, Check, Sparkles, PawPrint, ChevronDown, LogOut,
  Globe, HelpCircle, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { antigravityEngine } from './services/antigravityEngine';
import { performPetScan, getFallbackResult } from './services/geminiScanner';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// --- 필수 컴포넌트: 정적 import (렉 방지) ---
import { SplashScreen } from './components/screens/SplashScreen';
import CameraScreen from './components/screens/CameraScreen';
import NavigationBar from './components/common/Navigation';
import StatusBar from './components/common/StatusBar';
import AnalysisLoadingOverlay from './components/common/AnalysisLoadingOverlay';
import AdBanner from './components/common/AdBanner';

// --- 무거운 화면: Lazy Loading (초기 로드 최적화) ---
const OnboardingScreen = lazy(() => import('./components/screens/OnboardingScreen'));
const HealthReport = lazy(() => import('./components/screens/HealthReport'));
const AIVetScreen = lazy(() => import('./components/screens/AIVetScreen'));
const PetDashboard = lazy(() => import('./components/screens/PetDashboard'));
const ProfileScreen = lazy(() => import('./components/screens/ProfileScreen'));
const MembershipScreen = lazy(() => import('./components/screens/MembershipScreen'));
const DietGuideScreen = lazy(() => import('./components/screens/DietGuideScreen'));
const ExercisePlanScreen = lazy(() => import('./components/screens/ExercisePlanScreen'));
const CareGuideScreen = lazy(() => import('./components/screens/CareGuideScreen'));
const HistoryScreen = lazy(() => import('./components/screens/HistoryScreen'));
const PrivacyPolicyScreen = lazy(() => import('./components/screens/PrivacyPolicyScreen'));
const AdminDashboard = lazy(() => import('./components/screens/AdminDashboard'));
const EmergencyGuideScreen = lazy(() => import('./components/screens/EmergencyGuideScreen'));
const WalkTimerScreen = lazy(() => import('./components/screens/WalkTimerScreen'));
const VaccinationScreen = lazy(() => import('./components/screens/VaccinationScreen'));
const WeightTrackerScreen = lazy(() => import('./components/screens/WeightTrackerScreen'));
const BreedInfoScreen = lazy(() => import('./components/screens/BreedInfoScreen'));
const CommunityScreen = lazy(() => import('./components/screens/CommunityScreen'));
const CommunityPostScreen = lazy(() => import('./components/screens/CommunityPostScreen'));
const PostDetailScreen = lazy(() => import('./components/screens/PostDetailScreen'));
const LoginScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.LoginScreen })));
const SignUpScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.SignUpScreen })));

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- Types ---
type Screen = 'onboarding' | 'login' | 'signup' | 'camera' | 'pet-dashboard' | 'health-report' | 'membership' | 'diet-guide' | 'exercise-plan' | 'care-guide' | 'history' | 'privacy' | 'profile' | 'ai-vet' | 'admin' | 'emergency-guide' | 'walk-timer' | 'vaccination' | 'weight-tracker' | 'breed-info' | 'community' | 'community-post' | 'post-detail';
interface PetProfile {
  name: string;
  breed: string;
  age: string;
  gender: 'male' | 'female' | '';
  weight: string;
}
interface CareItem {
  id: string;
  label: string;
  icon: any;
  completed: boolean;
}

// --- Mock Data ---
const MOCK_PET = {
  name: "루나",
  type: "골든 리트리버",
  breedMatch: 99,
  primaryBreed: "골든 리트리버",
  primaryPercentage: 70,
  secondaryBreed: "진돗개",
  secondaryPercentage: 30,
  weight: 24.2,
  lastScan: "2시간 전",
  activityLevel: "보통",
  recommendations: [
    "관절 영양제 섭취 권장",
    "체중 관리 식단 유지",
    "정기적인 고관절 체크"
  ]
};

export default function App() {
  const { t, i18n } = useTranslation();
  const [currentScreen, setCurrentScreen] = useState<Screen>('camera');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // 🎉 Grand Launch Promotion: 2026년 6월 30일까지 모든 기능 무료 개방
  const PROMO_END_DATE = new Date('2026-07-01T00:00:00');
  const isPromoActive = new Date() < PROMO_END_DATE;
  const [isPremium, setIsPremium] = useState(isPromoActive);
  const [scanCount, setScanCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [interstitialAction, setInterstitialAction] = useState<{onComplete: () => void} | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ uid?: string, email: string, is_premium: boolean } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedCareGuides, setSelectedCareGuides] = useState<any[] | null>(null);
  // 커뮤니티 - 선택된 게시글 (상세 보기용)
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    try { return localStorage.getItem('petgenie_onboarding') === 'true'; } catch { return false; }
  });
  const [petProfile, setPetProfile] = useState<PetProfile>(() => {
    try {
      const saved = localStorage.getItem('petgenie_pet_profile');
      return saved ? JSON.parse(saved) : { name: '', breed: '', age: '', gender: '', weight: '' };
    } catch { return { name: '', breed: '', age: '', gender: '', weight: '' }; }
  });
  // 아이콘 타입 문자열 → 실제 Lucide 아이콘으로 매핑하는 헬퍼
  const careIconMap: Record<string, any> = {
    heart: Heart, eye: Eye, activity: Activity, sparkles: Sparkles,
    shield: Shield, thermometer: Thermometer, droplets: Droplets,
    utensils: Utensils, check: Check, calendar: Calendar,
  };

  // 기본 3개 항목 (모든 강아지에게 공통)
  const baseCareItems: CareItem[] = [
    { id: 'walk', label: 'dashboard.care_walk', icon: Activity, completed: false },
    { id: 'feed', label: 'dashboard.care_feed', icon: Utensils, completed: false },
    { id: 'water', label: 'dashboard.care_water', icon: Droplets, completed: false },
  ];

  const [dailyCare, setDailyCare] = useState<CareItem[]>(() => {
    // localStorage에서 저장된 케어 항목 복원 (완료 상태 유지)
    try {
      const saved = localStorage.getItem('petgenie_daily_care');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 저장된 항목에 아이콘 복원 (JSON에 함수 저장 불가하므로)
        return parsed.map((item: any) => ({
          ...item,
          icon: careIconMap[item.iconType] || Heart,
        }));
      }
    } catch {}
    return baseCareItems;
  });

  // Set initial screen based on onboarding state
  useEffect(() => {
    if (hasSeenOnboarding) {
      setCurrentScreen('camera');
    }
    
    // AdMob Initialization for native platform
    if (Capacitor.isNativePlatform()) {
      AdMob.initialize({
        requestTrackingAuthorization: true,
      } as any).catch(err => console.warn('AdMob init error', err));
    }

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setUser({ 
          uid: firebaseUser.uid,
          email: firebaseUser.email || '', 
          is_premium: isPromoActive // 추후 Firestore/Claims에서 확인하도록 확장 가능
        });

        // 사용자 로그인 시 푸시 알림 등록
        try {
          const { registerPushNotifications } = await import('./services/notificationService');
          await registerPushNotifications();
        } catch (err) {
          console.error('Push notification registration failed', err);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [hasSeenOnboarding, isPromoActive]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Reset daily care at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => {
      setDailyCare(prev => prev.map(c => ({ ...c, completed: false })));
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, [dailyCare]);

  const toggleCare = useCallback((id: string) => {
    setDailyCare(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c));
  }, []);

  const updatePetProfile = useCallback((profile: PetProfile) => {
    setPetProfile(profile);
    try { localStorage.setItem('petgenie_pet_profile', JSON.stringify(profile)); } catch {}
  }, []);

  const navigateTo = (screen: Screen) => {
    setScreenHistory(prev => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prevScreen = screenHistory[screenHistory.length - 1];
      setScreenHistory(prev => prev.slice(0, -1));
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('pet-dashboard');
    }
  };

  const handleTabNavigate = (screen: Screen) => {
    setScreenHistory([]); // Clear history when switching top-level tabs
    setCurrentScreen(screen);
  };

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    try { localStorage.setItem('petgenie_onboarding', 'true'); } catch {}
    setCurrentScreen('camera');
  };

  const handleLogin = async (email: string, uid: string, agreeMarketing: boolean) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        email,
        marketingConsent: agreeMarketing,
        lastLoginAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user data:", error);
    }
    setScreenHistory([]); // Reset history on login
    setCurrentScreen('pet-dashboard');
  };

  const handleSignUp = async (email: string, uid: string, agreeMarketing: boolean) => {
    try {
      await setDoc(doc(db, 'users', uid), {
        email,
        marketingConsent: agreeMarketing,
        createdAt: new Date(),
        lastLoginAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user data:", error);
    }
    setScreenHistory([]); // Reset history on signup
    setCurrentScreen('pet-dashboard');
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      setIsLoggedIn(false);
      setUser(null);
      setScreenHistory([]); // Reset history on logout
      setCurrentScreen('camera');
    }).catch(err => {
      console.error('Logout failed', err);
    });
  };

  const handleScan = async (data: { image: string, weight?: number, height?: number }) => {
    if (!data.image) {
      alert("이미지 데이터가 올바르지 않습니다.");
      return;
    }

    setCapturedImage(data.image);
    setIsAnalyzing(true);
    
    try {
      const result = await performPetScan(data, petProfile, i18n.language, GEMINI_API_KEY, t);
      setAnalysisResult(result);
      
      if (!isPremium) setScanCount(prev => prev + 1);

      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        image: data.image,
        result: result
      }, ...prev]);
      
      if (result?.primaryBreed && !petProfile.breed) {
        setPetProfile({ ...petProfile, breed: result.primaryBreed });
      }

      // AI 분석 결과에 따른 맞춤형 데일리 케어 업데이트
      const aiCareItems: CareItem[] = (result?.dailyCareChecklist || []).map((item: any) => ({
        id: item.id || `ai_care_${Math.random().toString(36).slice(2, 7)}`,
        label: item.label,
        icon: careIconMap[item.iconType] || Heart,
        iconType: item.iconType,
        completed: false,
      }));
      const newCare = [
        ...baseCareItems,
        ...(aiCareItems.length > 0 ? aiCareItems : [
          // AI 응답 없을 때 기본 맞춤 항목
          { id: 'supplement', label: i18n.language === 'ko' ? '영양제 급여' : 'Supplement', icon: Heart, iconType: 'heart', completed: false },
          { id: 'brush', label: i18n.language === 'ko' ? '빗질 / 그루밍' : 'Brushing', icon: Sparkles, iconType: 'sparkles', completed: false },
          { id: 'teeth', label: i18n.language === 'ko' ? '치아 관리' : 'Dental Care', icon: Shield, iconType: 'shield', completed: false },
          { id: 'eyes', label: i18n.language === 'ko' ? '눈/귀 체크' : 'Eye/Ear Check', icon: Eye, iconType: 'eye', completed: false },
        ]),
      ];
      setDailyCare(newCare);
      // localStorage에 저장 (아이콘 타입만 저장, 함수는 저장 불가)
      try {
        localStorage.setItem('petgenie_daily_care', JSON.stringify(
          newCare.map(c => ({ ...c, icon: undefined, iconType: (c as any).iconType || c.id }))
        ));
      } catch {}
      
      if (!isPremium) {
        setInterstitialAction({ onComplete: () => navigateTo('health-report') });
      } else {
        navigateTo('health-report');
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      const fallbackResult = getFallbackResult();
      setAnalysisResult(fallbackResult);
      
      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        image: data.image,
        result: fallbackResult
      }, ...prev]);
      
      if (!isPremium) {
        setInterstitialAction({ onComplete: () => navigateTo('health-report') });
      } else {
        navigateTo('health-report');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    if (user) setUser({ ...user, is_premium: true });
    navigateTo('pet-dashboard');
  };

  const isSubScreen = ['login', 'signup', 'health-report', 'membership', 'care-guide', 'diet-guide', 'exercise-plan', 'onboarding', 'privacy', 'admin', 'ai-vet', 'emergency-guide', 'walk-timer', 'vaccination', 'weight-tracker', 'breed-info', 'community-post', 'post-detail'].includes(currentScreen);

  return (
    <>
    <div className="h-full bg-zinc-50 font-sans selection:bg-emerald-100 overflow-hidden font-[Inter,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_sans-serif]">
      {/* Full-Screen Mobile App Container */}
      <div className="w-full h-full bg-zinc-50 relative overflow-hidden flex flex-col">
        <AnimatePresence>
          {isLoading && <SplashScreen />}
          {isAnalyzing && <AnalysisLoadingOverlay />}
        </AnimatePresence>

        <StatusBar dark={currentScreen === 'camera' || currentScreen === 'onboarding'} />
        
        <div className="flex-1 relative bg-zinc-50">
          <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute inset-0 w-full h-full",
                currentScreen === 'onboarding' ? "bg-black" : ""
              )}
            >
              {currentScreen === 'onboarding' && (
                <OnboardingScreen onComplete={handleOnboardingComplete} />
              )}
              {currentScreen === 'login' && (
                <LoginScreen 
                  onLogin={handleLogin} 
                  onNavigateToSignUp={() => navigateTo('signup')} 
                />
              )}
              {currentScreen === 'signup' && (
                <SignUpScreen 
                  onSignUp={handleSignUp} 
                  onNavigateToLogin={() => navigateTo('login')} 
                />
              )}
              {currentScreen === 'camera' && (
                <CameraScreen 
                  onScan={handleScan} 
                  onBack={goBack} 
                  isLoggedIn={isLoggedIn}
                  isPremium={isPremium}
                  scanCount={scanCount}
                  analysisResult={analysisResult}
                  capturedImage={capturedImage}
                />
              )}
              {currentScreen === 'history' && (
                <HistoryScreen 
                  history={history}
                  onSelect={(item) => {
                    if (!isPremium) {
                      navigateTo('membership');
                      return;
                    }
                    setAnalysisResult(item.result);
                    setCapturedImage(item.image);
                    navigateTo('health-report');
                  }}
                  onBack={goBack}
                />
              )}
              {currentScreen === 'pet-dashboard' && (
                <PetDashboard 
                  onDetail={() => navigateTo('health-report')} 
                  onScan={() => {
                    if (!isPremium && scanCount >= 3) {
                      navigateTo('membership');
                    } else {
                      navigateTo('camera');
                    }
                  }} 
                  onNavigate={navigateTo}
                  isPremium={isPremium}
                  scanCount={scanCount}
                  analysisResult={analysisResult}
                  capturedImage={capturedImage}
                  onLogout={handleLogout}
                  dailyCare={dailyCare}
                  onToggleCare={toggleCare}
                  petProfile={petProfile}
                />
              )}
              {currentScreen === 'diet-guide' && (
                <DietGuideScreen 
                  onBack={goBack} 
                  dietPlan={analysisResult?.dietPlan}
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('membership')}
                />
              )}
              {currentScreen === 'exercise-plan' && (
                <ExercisePlanScreen 
                  onBack={goBack} 
                  exercisePlan={analysisResult?.exercisePlan}
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('membership')}
                />
              )}
              {currentScreen === 'care-guide' && (
                <CareGuideScreen 
                  onBack={() => {
                    setSelectedCareGuides(null);
                    goBack();
                  }} 
                  careGuides={selectedCareGuides || analysisResult?.careGuides}
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('membership')}
                />
              )}
              {currentScreen === 'health-report' && (
                <HealthReport 
                  onBack={goBack} 
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('membership')}
                  analysisResult={analysisResult}
                  capturedImage={capturedImage}
                  onNavigate={navigateTo}
                  onSelectCareGuides={setSelectedCareGuides}
                />
              )}
              {currentScreen === 'privacy' && (
                <PrivacyPolicyScreen onBack={goBack} />
              )}
              {currentScreen === 'membership' && (
                <MembershipScreen 
                  onBack={goBack} 
                  onUpgrade={handleUpgrade}
                />
              )}
              {currentScreen === 'profile' && (
                <ProfileScreen
                  onBack={goBack}
                  onNavigate={navigateTo}
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('membership')}
                  onLogout={handleLogout}
                  isLoggedIn={isLoggedIn}
                  user={user}
                  petProfile={petProfile}
                  onUpdatePetProfile={updatePetProfile}
                  onLogin={() => navigateTo('login')}
                />
              )}
              {currentScreen === 'ai-vet' && (
                <AIVetScreen
                  onBack={goBack}
                  isPremium={isPremium}
                  onUpgrade={() => navigateTo('membership')}
                  petProfile={petProfile}
                />
              )}
              {currentScreen === 'admin' && (
                <AdminDashboard
                  onBack={goBack}
                />
              )}
              {currentScreen === 'emergency-guide' && (
                <EmergencyGuideScreen onBack={goBack} />
              )}
              {currentScreen === 'walk-timer' && (
                <WalkTimerScreen
                  onBack={goBack}
                  onCompleteCare={(id) => toggleCare(id)}
                  onShareWalk={(duration: number) => {
                    // 산책 기록을 커뮤니티에 공유하기 위해 community-post 대신 직접 서비스 호출
                    import('./services/communityService').then(async (mod) => {
                      if (auth.currentUser && isLoggedIn) {
                        try {
                          await mod.shareWalkRecord(
                            duration,
                            petProfile,
                            { uid: auth.currentUser.uid, email: auth.currentUser.email || '', displayName: auth.currentUser.displayName || undefined },
                          );
                          navigateTo('community');
                        } catch (err) {
                          console.error('산책 공유 실패:', err);
                        }
                      } else {
                        navigateTo('login');
                      }
                    });
                  }}
                />
              )}
              {currentScreen === 'vaccination' && (
                <VaccinationScreen onBack={goBack} petProfile={petProfile} />
              )}

              {currentScreen === 'weight-tracker' && (
                <WeightTrackerScreen onBack={goBack} />
              )}
              {currentScreen === 'breed-info' && (
                <BreedInfoScreen onBack={goBack} analysisResult={analysisResult} />
              )}
              {currentScreen === 'community' && (
                <CommunityScreen
                  onNavigate={navigateTo}
                  onSelectPost={(post) => {
                    setSelectedPost(post);
                    navigateTo('post-detail');
                  }}
                  isLoggedIn={isLoggedIn}
                  onLogin={() => navigateTo('login')}
                  onBack={goBack}
                />
              )}
              {currentScreen === 'community-post' && (
                <CommunityPostScreen
                  onBack={goBack}
                  petProfile={petProfile}
                />
              )}
              {currentScreen === 'post-detail' && selectedPost && (
                <PostDetailScreen
                  post={selectedPost}
                  onBack={goBack}
                  isLoggedIn={isLoggedIn}
                  onLogin={() => navigateTo('login')}
                  onPostDeleted={() => setSelectedPost(null)}
                />
              )}
            </motion.div>
        </AnimatePresence>
          </Suspense>
      </div>

        {!isSubScreen && (
          <div className="shrink-0 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
            <AdBanner isPremium={isPremium} onUpgrade={() => navigateTo('membership')} type="banner" />
            <NavigationBar current={currentScreen} onNavigate={handleTabNavigate} />
          </div>
        )}
      </div>
    </div>

      <AnimatePresence>
        {interstitialAction && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-6 text-white"
          >
            <div className="bg-zinc-800 p-8 rounded-3xl w-full max-w-sm text-center relative overflow-hidden border border-zinc-700 shadow-2xl">
              <div className="absolute top-3 left-3 bg-zinc-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider text-zinc-300">{t('common.sponsored', 'Sponsored')}</div>
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-6 mt-4">{t('common.admob_interstitial', 'AdMob Interstitial Unit')}</div>
              
              <div className="aspect-[300/250] bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700 mb-8">
                <span className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] break-all px-4 text-center">ca-app-pub-7630237731274328/5352133362</span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">{t('dashboard.premium_banner.title', 'Premium Pet Care')}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-8">{t('dashboard.premium_banner.desc', 'Smart dog care begins here')}</p>
              
              <button 
                onClick={() => {
                  interstitialAction.onComplete();
                  setInterstitialAction(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 [-webkit-tap-highlight-color:transparent]"
              >
                {t('common.close_ad_and_view', 'Close Ad & View Results')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </>
  );
}

