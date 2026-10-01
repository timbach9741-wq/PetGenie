import { ADMOB_IDS } from './config/ads';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { AdMob } from '@capacitor-community/admob';
import { App as CapacitorApp } from '@capacitor/app';
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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AdFreeContext } from './lib/adFree';
import { QuotaExceededError, onUsage } from './lib/geminiProxy';
import { isBillingAvailable, restorePurchases } from './lib/billing';
import { isLegacyDevice, legacyFreeActive, fetchPaidLaunchAt, claimLegacyFree } from './lib/membership';

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
  // 유료화 전(config/billing.paidLaunchAt 이전)에는 모든 기능 무료 개방.
  // 광고는 AdBanner.tsx에서 결제 여부(adFree)로만 판단하므로 무료 기간에도 광고 수익은 발생함.
  // null = 아직 확인 전(그동안은 기능을 잠그지 않되, 무료 홍보 문구도 띄우지 않는다)
  const [freeForAll, setFreeForAll] = useState<boolean | null>(null);
  // 유료화 전부터 쓰던 사용자는 12/31까지 무료(users/{uid}.freeUntil, 서버가 기록). 광고는 그대로.
  const [legacyFree, setLegacyFree] = useState(isLegacyDevice && legacyFreeActive());
  // 실제 결제 회원 여부(광고 제거 기준). users/{uid}.premiumUntil이 지금보다 뒤면 true.
  const [isPaidMember, setIsPaidMember] = useState(false);
  const isPremium = (freeForAll ?? true) || legacyFree || isPaidMember;
  const showFreePromo = freeForAll === true || legacyFree;
  const [scanCount, setScanCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ uid?: string, email: string } | null>(null);
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

    // 유료화 시작 시각 확인
    fetchPaidLaunchAt().then((at) => setFreeForAll(Date.now() < at.getTime()));

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
        });

        // 결제 회원·기존 사용자 무료 여부 확인. premiumUntil/freeUntil은 서버만 기록할 수 있다(firestore.rules protectedUserFields).
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
          const until = snap.data()?.premiumUntil?.toDate?.();
          setIsPaidMember(!!until && until.getTime() > Date.now());
          const freeUntil = snap.data()?.freeUntil?.toDate?.();
          if (freeUntil && freeUntil.getTime() > Date.now()) setLegacyFree(true);
        } catch (err) {
          console.warn('Membership check failed', err);
        }

        // 유료화 전 계정이거나 유료화 전부터 쓰던 기기면 서버에 12/31까지 무료로 등록(한도 확인도 서버가 이 기록을 본다).
        if (legacyFreeActive()) {
          claimLegacyFree()
            .then((granted) => { if (granted) setLegacyFree(true); })
            .catch((err) => console.warn('Legacy free claim failed', err));
        }

        // 이 기기의 구글 계정에 있는 구독을 서버에 다시 확인(재설치 복원, 결제 직후 확인 실패분 처리).
        if (isBillingAvailable()) {
          restorePurchases(firebaseUser.uid)
            .then((active) => { if (active) setIsPaidMember(true); })
            .catch((err) => console.warn('Purchase restore failed', err));
        }

        // 이번 달(한국 시간) 무료 스캔 사용 횟수. 서버(geminiProxy)가 세고, 앱은 남은 횟수 표시에만 쓴다.
        try {
          const month = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 7);
          const usageSnap = await getDoc(doc(db, 'users', firebaseUser.uid, 'usage', `scan-${month}`));
          setScanCount(usageSnap.data()?.count || 0);
        } catch (err) {
          console.warn('Usage check failed', err);
        }

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
        setIsPaidMember(false);
        setLegacyFree(isLegacyDevice && legacyFreeActive());
      }
    });

    return () => unsubscribe();
  }, [hasSeenOnboarding]);

  // 스캔 성공 시 서버가 알려주는 이번 달 사용 횟수로 갱신
  useEffect(() => onUsage((u) => { if (u.kind === 'scan') setScanCount(u.used); }), []);

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

  // 하드웨어(제스처) 뒤로가기: 화면 이동 기록이 있으면 이전 화면으로,
  // 홈 탭('camera')이 아닌 다른 탭이면 홈 탭으로, 홈 탭에서 누르면 앱 종료.
  // (기본값은 아무 화면에서나 바로 앱이 꺼져버려서 UX가 거칠었음)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = CapacitorApp.addListener('backButton', () => {
      if (screenHistory.length > 0) {
        goBack();
      } else if (currentScreen !== 'camera') {
        handleTabNavigate('camera');
      } else {
        CapacitorApp.exitApp();
      }
    });
    return () => { listenerPromise.then(handle => handle.remove()); };
  }, [currentScreen, screenHistory]);

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
      const result = await performPetScan(data, petProfile, i18n.language, t);
      setAnalysisResult(result);
      
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
      
      navigateTo('health-report');
    } catch (error) {
      // 무료 스캔 한도(월 3회)를 다 쓰면 결과 대신 멤버십 안내로 보낸다.
      if (error instanceof QuotaExceededError) {
        setScanCount(error.used);
        alert(t('membership.scan_quota_reached', '이번 달 무료 스캔 {{limit}}회를 모두 사용했어요. 멤버십으로 무제한 이용할 수 있어요.', { limit: error.limit }));
        navigateTo('membership');
        return;
      }
      console.error("AI Analysis failed:", error);
      const fallbackResult = getFallbackResult();
      setAnalysisResult(fallbackResult);
      
      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleString(i18n.language === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        image: data.image,
        result: fallbackResult
      }, ...prev]);
      
      navigateTo('health-report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 서버가 확인한 결제 결과를 화면 상태에 반영
  const applyMembership = (active: boolean) => {
    setIsPaidMember(active);
  };

  const isSubScreen = ['login', 'signup', 'health-report', 'membership', 'care-guide', 'diet-guide', 'exercise-plan', 'onboarding', 'privacy', 'admin', 'ai-vet', 'emergency-guide', 'walk-timer', 'vaccination', 'weight-tracker', 'breed-info', 'community-post', 'post-detail'].includes(currentScreen);

  return (
    <AdFreeContext.Provider value={isPaidMember}>
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
                <OnboardingScreen onComplete={handleOnboardingComplete} showFreeBadge={freeForAll === true} />
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
                  showFreePromo={showFreePromo}
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
                  // 스캔 결과는 무료 회원에게도 전부 공개한다(첫 결과를 가리면 바로 이탈). 멤버십 혜택은 무제한 스캔·광고 제거.
                  isPremium={true}
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
                  uid={user?.uid}
                  isPaidMember={isPaidMember}
                  showFreePromo={showFreePromo}
                  onMembershipChanged={applyMembership}
                  onRequireLogin={() => navigateTo('login')}
                />
              )}
              {currentScreen === 'profile' && (
                <ProfileScreen
                  onBack={goBack}
                  onNavigate={navigateTo}
                  isPremium={isPremium}
                  isPaidMember={isPaidMember}
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



    </AdFreeContext.Provider>
  );
}

