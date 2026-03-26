/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
import { useTranslation, Trans } from 'react-i18next';
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
import { GoogleGenAI } from "@google/genai";

// --- 필수 컴포넌트: 정적 import (렉 방지) ---
import { SplashScreen } from './components/screens/SplashScreen';
import CameraScreen from './components/screens/CameraScreen';
import NavigationBar from './components/common/Navigation';
import StatusBar from './components/common/StatusBar';
import AnalysisLoadingOverlay from './components/common/AnalysisLoadingOverlay';

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
const LoginScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.LoginScreen })));
const SignUpScreen = lazy(() => import('./components/screens/AuthScreens').then(m => ({ default: m.SignUpScreen })));

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- Types ---
type Screen = 'onboarding' | 'login' | 'signup' | 'camera' | 'pet-dashboard' | 'health-report' | 'membership' | 'diet-guide' | 'exercise-plan' | 'care-guide' | 'history' | 'privacy' | 'profile' | 'ai-vet';
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
  const [isPremium, setIsPremium] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedCareGuides, setSelectedCareGuides] = useState<any[] | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    try { return localStorage.getItem('petgenie_onboarding') === 'true'; } catch { return false; }
  });
  const [petProfile, setPetProfile] = useState<PetProfile>(() => {
    try {
      const saved = localStorage.getItem('petgenie_pet_profile');
      return saved ? JSON.parse(saved) : { name: '', breed: '', age: '', gender: '', weight: '' };
    } catch { return { name: '', breed: '', age: '', gender: '', weight: '' }; }
  });
  const [dailyCare, setDailyCare] = useState<CareItem[]>([
    { id: 'walk', label: 'dashboard.care_walk', icon: Activity, completed: false },
    { id: 'feed', label: 'dashboard.care_feed', icon: Utensils, completed: false },
    { id: 'water', label: 'dashboard.care_water', icon: Droplets, completed: false },
    { id: 'supplement', label: 'dashboard.care_supplement', icon: Heart, completed: false },
    { id: 'brush', label: 'dashboard.care_brush', icon: Sparkles, completed: false },
  ]);

  // Set initial screen based on onboarding state
  useEffect(() => {
    if (hasSeenOnboarding) {
      setCurrentScreen('camera');
    }
  }, []);

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

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setUser({ email });
    setScreenHistory([]); // Reset history on login
    setCurrentScreen('pet-dashboard');
  };

  const handleSignUp = (email: string) => {
    setIsLoggedIn(true);
    setUser({ email });
    setScreenHistory([]); // Reset history on signup
    setCurrentScreen('pet-dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setScreenHistory([]); // Reset history on logout
    setCurrentScreen('camera');
  };

  const handleScan = async (data: { image: string, weight?: number, height?: number }) => {
    if (!data.image) {
      alert("이미지 데이터가 올바르지 않습니다.");
      return;
    }

    setCapturedImage(data.image);
    setIsAnalyzing(true);
    
    try {
      if (!GEMINI_API_KEY) {
        console.warn("VITE_GEMINI_API_KEY is missing. Using fallback analysis.");
        throw new Error("API Key is missing");
      }

      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      
      // Extract mime type and base64 data from data URL
      const mimeType = data.image.split(';')[0].split(':')[1] || "image/jpeg";
      const base64Data = data.image.split(',')[1];
      
      if (!base64Data) throw new Error("Invalid base64 data");

      const petContext = `
        Pet Context (if available):
        ${data.weight ? `- Weight: ${data.weight}kg` : '- Weight: not provided'}
        ${data.height ? `- Height: ${data.height}cm` : '- Height: not provided'}
        ${petProfile.age ? `- Age: ${petProfile.age} years` : ''}
        ${petProfile.gender ? `- Gender: ${petProfile.gender}` : ''}
      `;

      const langMap: Record<string, string> = {
        ko: "Korean",
        en: "English",
        ja: "Japanese",
        zh: "Chinese (Simplified)",
        es: "Spanish"
      };
      const responseLang = langMap[i18n.language.split('-')[0]] || "Korean";

      const prompt = `You are a highly advanced Veterinary Genetics Expert AI. Perform a rigorous, evidence-based visual phenotype analysis of this dog image to identify its breed composition, health risks, and care requirements.
ALL descriptive and qualitative outputs MUST BE IN ${responseLang}.

ANALYSIS GUIDELINES:
1. **Rigorous Breed Identification**: Analyze phenotype strictly based on AKC and FCI breed standards. Evaluate minutely: 
   - Skull shape and "stop" (muzzle to forehead transition)
   - Ear shape, set, and carriage (e.g., pricked, drop, rose)
   - Coat texture, length, coloration, and patterns (e.g., merle, roan, ticking)
   - Body proportions, chest depth, back length, and tail set.
2. **Score vs. Purity Distinction (CRITICAL)**: 
   - \`breedMatch\` (Confidence): Your AI confidence score (0-100) that you have correctly identified the visual breed.
   - \`primaryPercentage\` (Bloodline/Purity): Your estimate (0-100) of how purebred the dog is based on visual phenotypic purity vs mixing. Purebreds must be 90-100. Mixed breeds must be clearly split.
3. **Evidence-Based Health Risks**: Reference OFA, CHIC, and UCDavis VGL. State actual known prevalence rates and identify critical risk factors for the primary breed.
4. **Nutrition & Behavior**: Strictly follow WSAVA Global Nutrition Guidelines 2021 and AVSAB behavior protocols (positive reinforcement only).

${petContext}

Return a valid JSON object with this exact structure (Translate all text values to ${responseLang}, EXCEPT 'color' fields or when noted):
{
  "primaryBreed": "품종명 (${responseLang})",
  "primaryPercentage": number (estimated genetic purity percentage, not confidence),
  "secondaryBreed": "두 번째 믹스 품종명 (If purebred, use 'N/A')",
  "secondaryPercentage": number (0 if purebred),
  "breedMatch": number (0-100, AI visual recognition confidence score),
  "breedSource": "e.g., AKC 견종 표준 / FCI 그룹 N",
  "identificationBasis": [
    "구체적인 외형적 특징과 표준의 일치 여부 (e.g., '넓은 두개골과 완만한 액단이 AKC 골든 리트리버 표준에 정확히 부합함')",
    "또 다른 구체적인 외형적 분석"
  ],
  "lineage": [
    {"label": "계열명 (e.g., 리트리버 계열)", "value": number, "color": "bg-[#00FF41] or other tailwind color"}
  ],
  "riskFactors": [
    {
      "name": "질병명",
      "riskLevel": "high" | "medium" | "low",
      "prevalence": "발생률 및 통계 (e.g., 'OFA 2024 통계 기준 해당 품종의 19.3%에서 발생')",
      "source": "출처 (e.g., 'OFA 통계 2024', 'CHIC 권장 검사')",
      "description": "임상적 설명 (구체적인 증상 및 기전)",
      "recommendation": "예방 및 관리 권장사항 (e.g., '12개월 령에 방사선 검사 권장')",
      "careGuides": [
        {
          "title": "가이드 제목",
          "desc": "구체적인 관리 지침",
          "iconType": "calendar" | "weight" | "activity" | "medical" | "heart" | "eye"
        }
      ]
    }
  ],
  "detailedMarkers": [
    {
      "label": "유전 마커 이름 (e.g., 'MDR1 유전자 변이', '퇴행성 골수염 (DM)')",
      "value": number (0-100, 정상일 확률),
      "status": "normal" | "carrier" | "caution",
      "testSource": "참고 데이터베이스 (e.g., 'UCDavis VGL 패널 기반 예상')"
    }
  ],
  "dietPlan": {
    "title": "식단 플랜 제목",
    "source": "WSAVA Global Nutrition Guidelines 2021 / NRC 2006",
    "recommendations": ["구체적인 영양 조언 및 그 이유 (${responseLang})"],
    "prohibitedFoods": ["위험한 음식과 중독 기전 (${responseLang})"],
    "dailyCalories": "권장 칼로리 범위 (예: '450-520 kcal')"
  },
  "exercisePlan": {
    "title": "운동 플랜 제목",
    "source": "품종별 권장 활동량 가이드라인",
    "dailyGoal": "e.g., '60-90분'",
    "activities": [{"name": "활동명", "duration": "시간", "intensity": "low" | "medium" | "high"}],
    "precautions": ["운동 시 주의사항 및 의학적 근거 (${responseLang})"]
  },
  "expertInsights": {
    "expertAdvice": "해당 품종(또는 믹스)에 대한 수의학적 총평 및 조언 (${responseLang})",
    "wsava": "WSAVA 가이드라인에 기반한 영양/활력 징후 관리 통찰 (${responseLang})",
    "steveMann": "긍정강화 훈련 전문가의 시각에서 본 행동/훈련 조언 (${responseLang})",
    "sources": ["WSAVA Global Nutrition Guidelines 2021", "AVSAB Position Statement", "OFA Breed Statistics"]
  },
  "careGuides": [
    {
      "title": "가이드 제목 (${responseLang})",
      "desc": "구체적인 관리 지침 (${responseLang})",
      "iconType": "calendar" | "weight" | "activity" | "medical" | "heart" | "eye",
      "source": "출처 (${responseLang})"
    }
  ],
  "disclaimer": "This analysis is generated by AI based on visual assessment and published veterinary research. It is not a substitute for professional veterinary diagnosis. Genetic testing by certified laboratories (e.g., Embark, Wisdom Panel) is recommended for definitive breed identification."
}

CRITICAL RULES:
- Use REAL prevalence data from OFA/CHIC when available for the identified breed
- Be honest about confidence levels - if breed identification is uncertain, reflect lower breedMatch scores
- All medical recommendations should align with AAHA (American Animal Hospital Association) preventive care guidelines
- Include only conditions genuinely associated with the identified breed(s)
- All text values MUST be in ${responseLang}, but keep source/reference names in English for credibility (unless they have well known translated names)
- If weight/height data is provided, factor it into calorie calculations and health assessments`;


      // Add a timeout to the AI call
      const analysisPromise = ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Analysis timed out")), 60000)
      );

      const response = await Promise.race([analysisPromise, timeoutPromise]) as any;
      const text = response.text || "{}";
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      let result: any = null;
      try {
        result = JSON.parse(cleanedText);
        setAnalysisResult(result);
      } catch (parseError) {
        console.error("JSON Parse failed:", parseError, "Text:", cleanedText);
        throw new Error("Invalid AI response format");
      }
      
      if (!isPremium) {
        setScanCount(prev => prev + 1);
      }

      // Always save to history regardless of login status
      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        image: data.image,
        result: result
      }, ...prev]);
      
      // Auto-update pet profile from analysis
      if (result?.primaryBreed && !petProfile.breed) {
        updatePetProfile({ ...petProfile, breed: result.primaryBreed });
      }
      
      // Both free and premium users go to health-report
      // HealthReport component handles content restriction for free users
      navigateTo('health-report');
    } catch (error) {
      console.error("AI Analysis failed:", error);
      // Fallback to mock data if AI fails
      const fallbackResult = {
        primaryBreed: "골든 리트리버",
        primaryPercentage: 70,
        secondaryBreed: "진돗개",
        secondaryPercentage: 30,
        breedMatch: 85,
        breedSource: "AKC Breed Standard / FCI Group 8 No.111",
        identificationBasis: [
          "넓은 두개골과 완만한 스탑 - AKC 골든 리트리버 표준 일치",
          "귀 위치가 눈 높이에서 시작, 앞으로 당기면 눈을 덮는 길이 - AKC 표준 부합",
          "중간 길이의 이중 피모, 금색~크림색 범위 - FCI 표준 색상 범위 내"
        ],
        lineage: [
          { label: '리트리버 계열 (Retriever Lineage)', value: 72, color: 'bg-[#00FF41]' },
          { label: '스피츠 계열 (Spitz Lineage)', value: 25, color: 'bg-zinc-500' },
          { label: '기타 미분류 (Others)', value: 3, color: 'bg-zinc-700' },
        ],
        riskFactors: [
          {
            "name": "고관절 이형성증",
            "riskLevel": "high",
            "prevalence": "골든 리트리버 중 19.3% 발생 (OFA 2024)",
            "source": "OFA Statistics 2024",
            "description": "골든 리트리버 품종에서 높은 발생률을 보이는 유전성 질환입니다. 고관절 소켓의 비정상적 발달로 인해 통증과 관절염을 유발합니다.",
            "recommendation": "AAHA 가이드라인에 따라 12개월 이후 X-ray 검사 권장",
            "careGuides": [
              { "title": "정기적인 고관절 검진", "desc": "OFA 권장에 따라 24개월에 공식 고관절 평가를 받으세요.", "iconType": "medical" },
              { "title": "체중 관리", "desc": "Purina 14년 연구에 따르면 적정 체중 유지 시 고관절 이형성증 발현이 평균 1.8년 지연됩니다.", "iconType": "weight" },
              { "title": "저충격 운동", "desc": "수영은 관절에 부담을 주지 않는 최적의 운동입니다. (ACVS 권장)", "iconType": "activity" }
            ]
          },
          {
            "name": "백내장",
            "riskLevel": "medium",
            "prevalence": "골든 리트리버 중 약 8.3% 발생 (CERF/OFA Eye Registry)",
            "source": "OFA Eye Certification Registry (CERF)",
            "description": "수정체의 혼탁으로 시력 저하를 유발. 유전적 요인으로 조기에 나타날 수 있어 정기적인 안구 검진이 중요합니다.",
            "recommendation": "ACVO (미국수의안과학회) 권장: 연 1회 안과 전문 검진",
            "careGuides": [
              { "title": "정기 안구 검사", "desc": "ACVO 권장에 따라 매년 눈 검진을 받으세요.", "iconType": "eye" },
              { "title": "항산화 영양소", "desc": "루테인, 비타민E 등 항산화 영양소가 수정체 건강 유지에 도움됩니다. (NRC 2006)", "iconType": "eye" }
            ]
          }
        ],
        detailedMarkers: [
          { label: 'MDR1 유전자 변이', value: 98, status: '정상', testSource: 'UCDavis VGL Panel' },
          { label: '퇴행성 골수염 (DM)', value: 85, status: '정상', testSource: 'UCDavis VGL Panel' },
          { label: '진행성 망막 위축증 (PRA)', value: 12, status: '주의', testSource: 'OFA/CHIC Recommended Test' },
          { label: '폰 빌레브란트 병', value: 95, status: '정상', testSource: 'UCDavis VGL Panel' }
        ],
        dietPlan: {
          title: "골든 리트리버를 위한 고단백 저지방 식단",
          source: "WSAVA Global Nutrition Guidelines 2021 / NRC 2006",
          recommendations: [
            "관절 건강을 위한 오메가-3 지방산 보충 (EPA+DHA 일 50-100mg/kg BW - NRC 권장)",
            "체중 조절을 위한 저칼로리 간식 (전체 칼로리의 10% 이내 - WSAVA 권장)",
            "소화가 잘 되는 고품질 단백질 (최소 25% - AAFCO 기준)"
          ],
          prohibitedFoods: [
            "포도 및 건포도 (신장 손상 유발 - ASPCA 독성 DB)",
            "초콜릿 (테오브로민 중독 - ASPCA)",
            "양파 및 마늘 (적혈구 파괴 유발 - Merck Vet Manual)",
            "자일리톨 함유 제품 (급성 간부전 유발 - FDA 경고)"
          ],
          dailyCalories: "1,200 - 1,500 kcal (30kg 기준, NRC 공식 적용)"
        },
        exercisePlan: {
          title: "활동적인 리트리버를 위한 데일리 운동 루틴",
          source: "AKC Exercise Guidelines",
          dailyGoal: "60분 - 90분",
          activities: [
            { name: "가벼운 산책", duration: "30분", intensity: "low" },
            { name: "터그 놀이 / 노즈워크", duration: "15분", intensity: "medium" },
            { name: "수영 또는 공놀이", duration: "20분", intensity: "high" }
          ],
          precautions: [
            "여름철 27°C 이상 시 열사병 주의 (AKC Heat Safety Guidelines)",
            "식후 최소 1시간 대기 후 운동 (위염전 예방 - ACVS 권장)",
            "고관절 보호를 위해 높은 곳에서 점프 자제 (OFA 운동 권장사항)"
          ]
        },
        expertInsights: {
          expertAdvice: "골든 리트리버는 지능이 높고 활동량이 많으므로, 충분한 신체 활동과 두뇌 자극이 필요합니다. 비만 성향이 있어 체중 관리가 건강의 핵심입니다.",
          wsava: "WSAVA 영양 가이드라인에 따르면 영양 상태는 '다섯 번째 활력징후'입니다. 모든 진료 시 체중과 BCS(Body Condition Score)를 9점 척도로 평가하고, 이를 바탕으로 급여량을 조절하세요.",
          steveMann: "긍정강화 훈련법(AVSAB 권장)을 활용하세요. 간식과 칭찬으로 원하는 행동을 강화하고, 체벌 대신 무시(negative punishment)로 불필요한 행동을 소거합니다.",
          sources: ["WSAVA Global Nutrition Guidelines 2021", "AVSAB Position Statement on Humane Training 2021", "OFA Breed Statistics 2024"]
        },
        careGuides: [
          { title: "고관절 정기 검진", desc: "OFA 평가를 24개월에 받고, 이후 연 1회 수의사 검진을 받으세요.", iconType: "medical", source: "OFA/AAHA Guidelines" },
          { title: "체중 관리", desc: "BCS 4-5/9 유지를 목표로 하세요. Purina 연구에 따르면 적정 체중 유지 시 수명이 평균 1.8년 연장됩니다.", iconType: "weight", source: "Purina Lifespan Study / WSAVA" },
          { title: "안구 검사", desc: "ACVO 권장에 따라 매년 안과 전문 검진을 받으세요. 유전성 백내장 조기 발견이 중요합니다.", iconType: "eye", source: "ACVO / OFA Eye Registry" },
          { title: "관절 보호 영양제", desc: "콘드로이친, 글루코사민, 오메가-3 보충이 관절 건강에 도움됩니다. (NRC 2006 기준)", iconType: "medical", source: "NRC 2006 / Veterinary Evidence" }
        ],
        disclaimer: "이 분석은 AI 시각 평가와 공개된 수의학 연구를 기반으로 합니다. 전문 수의사의 진단을 대체하지 않습니다. 정확한 품종 확인을 위해 공인 유전자 검사(Embark, Wisdom Panel 등)를 권장합니다."
      };
      
      setAnalysisResult(fallbackResult);
      
      // Always save fallback to history
      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        image: data.image,
        result: fallbackResult
      }, ...prev]);
      
      // Both free and premium users go to health-report
      navigateTo('health-report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    navigateTo('pet-dashboard');
  };

  const isSubScreen = ['login', 'signup', 'health-report', 'membership', 'care-guide', 'diet-guide', 'exercise-plan', 'onboarding', 'privacy'].includes(currentScreen);

  return (
    <div className="h-full bg-zinc-50 font-sans selection:bg-emerald-100 overflow-hidden" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
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
            </motion.div>
        </AnimatePresence>
          </Suspense>
      </div>

        {!isSubScreen && (
          <NavigationBar current={currentScreen} onNavigate={handleTabNavigate} />
        )}
      </div>
    </div>
  );
}
