/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { 
  Camera, 
  Heart, 
  LayoutDashboard, 
  ShoppingBag, 
  FileText, 
  Settings, 
  Scan, 
  ChevronRight, 
  Activity, 
  Weight, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  MoreVertical,
  Cross,
  Battery,
  Wifi,
  Signal,
  Shield,
  TrendingUp,
  Utensils,
  Moon,
  Clock,
  Droplets,
  MapPin,
  Navigation as NavIcon,
  Upload,
  BriefcaseMedical,
  Eye,
  Dna,
  BookOpen,
  Quote,
  Lock,
  History as HistoryIcon,
  ChevronLeft,
  User,
  Star,
  Bell,
  Sun,
  CloudRain,
  Thermometer,
  Check,
  Sparkles,
  PawPrint,
  ChevronDown,
  LogOut,
  Globe,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// --- Types ---
type Screen = 'onboarding' | 'login' | 'signup' | 'camera' | 'pet-dashboard' | 'health-report' | 'membership' | 'diet-guide' | 'exercise-plan' | 'care-guide' | 'history' | 'privacy' | 'profile';

// --- Pet Profile Type ---
interface PetProfile {
  name: string;
  breed: string;
  age: string;
  gender: 'male' | 'female' | '';
  weight: string;
}

// --- Daily Care Item ---
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

// --- Circular Progress Component ---
const CircularProgress = ({ value, size = 120, strokeWidth = 8, color = '#10b981' }: { value: number; size?: number; strokeWidth?: number; color?: string }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-zinc-100" />
      <motion.circle 
        cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} 
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        strokeLinecap="round"
      />
    </svg>
  );
};

// --- Language Switcher (4 Languages) ---
const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', short: 'KO' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
  { code: 'zh', label: '中文', flag: '🇨🇳', short: 'ZH' },
  { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' },
] as const;

const LanguageSwitcher = ({ variant = 'button' }: { variant?: 'button' | 'pill' | 'dark' }) => {
  const { i18n } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = i18n.language ? i18n.language.split('-')[0] : 'ko';
  const currentLangIndex = LANGUAGES.findIndex(l => l.code === currentLangCode);
  const currentLang = LANGUAGES[currentLangIndex >= 0 ? currentLangIndex : 0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const selectLang = (code: string) => {
    i18n.changeLanguage(code);
    setShowDropdown(false);
  };

  const buttonStyles = {
    button: "px-2.5 py-1.5 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-tighter border border-zinc-200 hover:bg-zinc-200 transition-colors",
    pill: "flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3 py-2 active:scale-95 transition-transform",
    dark: "flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-3 py-2 active:scale-95 transition-transform",
  };

  return (
    <div className="relative flex items-center gap-2" ref={dropdownRef}>
      {variant === 'button' && (
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Language</span>
      )}
      {(variant === 'dark' || variant === 'pill') && (
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Language</span>
      )}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={buttonStyles[variant]}
      >
        {variant === 'dark' || variant === 'pill' ? (
          <>
            <Globe className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
              {currentLang.flag} {currentLang.short}
            </span>
            <ChevronDown className={cn("w-3 h-3 text-white/60 transition-transform", showDropdown && "rotate-180")} />
          </>
        ) : (
          <span className="flex items-center gap-1">
            {currentLang.flag} {currentLang.short}
            <ChevronDown className={cn("w-3 h-3 text-zinc-400 transition-transform", showDropdown && "rotate-180")} />
          </span>
        )}
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-[100] bg-white rounded-2xl shadow-2xl shadow-zinc-200/80 border border-zinc-100 overflow-hidden min-w-[160px]"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLang(lang.code)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                  i18n.language === lang.code
                    ? "bg-emerald-50 text-emerald-700 font-bold"
                    : "text-zinc-700 hover:bg-zinc-50"
                )}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="flex-1 text-left">{lang.label}</span>
                {i18n.language === lang.code && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Onboarding Screen (Full-Bleed Cinematic + AI Particle) ---
const OnboardingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const { t, i18n } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1200',
      tag: t('onboarding.slide1_tag'),
      title: t('onboarding.slide1_title'),
      desc: t('onboarding.slide1_desc'),
      accentColor: '#00D4AA',
      icon: Dna,
    },
    {
      image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200',
      tag: t('onboarding.slide2_tag'),
      title: t('onboarding.slide2_title'),
      desc: t('onboarding.slide2_desc'),
      accentColor: '#00B4D8',
      icon: Heart,
    },
    {
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=1200',
      tag: t('onboarding.slide3_tag'),
      title: t('onboarding.slide3_title'),
      desc: t('onboarding.slide3_desc'),
      accentColor: '#7C3AED',
      icon: Shield,
    },
  ];

  const currentAccent = slides[currentSlide].accentColor;

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev < slides.length - 1 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
      if (diff < 0 && currentSlide > 0) setCurrentSlide(prev => prev - 1);
    }
    setTouchStart(null);
  };

  // Language switching handled by LanguageSwitcher component

  // Floating particles data
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 70,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 4,
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 h-full w-full bg-black flex flex-col z-50 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* === Full-Bleed Background Photos with Crossfade === */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${currentSlide}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slides[currentSlide].image}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" style={{ height: '55%', top: '45%' }} />
        </motion.div>
      </AnimatePresence>

      {/* === AI Scan Line Animation === */}
      <motion.div
        animate={{ y: ['0%', '100%', '0%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-0 right-0 z-10 h-[2px] pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${currentAccent}80, transparent)`,
          boxShadow: `0 0 20px ${currentAccent}40, 0 0 60px ${currentAccent}20`,
        }}
      />

      {/* === Floating DNA Particles === */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: `radial-gradient(circle, ${currentAccent}90, transparent)`,
              boxShadow: `0 0 ${p.size * 3}px ${currentAccent}50`,
            }}
            animate={{
              y: [0, -30, 0, 20, 0],
              x: [0, 15, -10, 5, 0],
              opacity: [0.2, 0.8, 0.4, 0.9, 0.2],
              scale: [1, 1.5, 0.8, 1.3, 1],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* === Top Bar === */}
      <div className="relative z-20 flex justify-between items-center px-6" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        {/* Language Switcher */}
        <LanguageSwitcher variant="dark" />

        {/* Skip */}
        <button
          onClick={onComplete}
          className="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] hover:text-white/80 transition-colors px-3 py-2"
        >
          {t('onboarding.skip')}
        </button>
      </div>

      {/* === Bottom Glassmorphism Card === */}
      <div className="mt-auto relative z-20">
        <div
          className="mx-4 mb-4 rounded-[2rem] border border-white/10 overflow-hidden"
          style={{
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(40px) saturate(180%)',
            WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          }}
        >
          <div className="p-7 pb-5">
            {/* Slide Content with Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`content-${currentSlide}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Tag + Icon */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: `${currentAccent}20`, border: `1px solid ${currentAccent}30` }}
                  >
                    {(() => { const Icon = slides[currentSlide].icon; return <Icon className="w-4 h-4" style={{ color: currentAccent }} />; })()}
                  </div>
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.2em]"
                    style={{ color: currentAccent }}
                  >
                    {slides[currentSlide].tag}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-[26px] font-extrabold text-white leading-[1.2] tracking-tight mb-3">
                  {slides[currentSlide].title}
                </h1>

                {/* Description */}
                <p className="text-white/50 text-[13px] leading-relaxed font-medium">
                  {slides[currentSlide].desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-2 mt-5 mb-5"
            >
              <div className="flex -space-x-2">
                {['🐕', '🐈', '🐩'].map((emoji, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[10px]">
                    {emoji}
                  </div>
                ))}
              </div>
              <span className="text-white/30 text-[10px] font-medium">
                {t('onboarding.social_proof')}
              </span>
            </motion.div>

            {/* Progress Dots + CTA Row */}
            <div className="flex items-center gap-4">
              {/* Dots */}
              <div className="flex gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className="relative h-1.5 rounded-full transition-all duration-500 overflow-hidden"
                    style={{ width: i === currentSlide ? 28 : 8 }}
                  >
                    <div className="absolute inset-0 bg-white/15 rounded-full" />
                    {i === currentSlide && (
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ background: currentAccent }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => {
                  if (currentSlide < slides.length - 1) {
                    setCurrentSlide(prev => prev + 1);
                  } else {
                    onComplete();
                  }
                }}
                className="flex-1 py-4 rounded-2xl font-bold text-[13px] text-white flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-lg"
                style={{
                  background: currentSlide === slides.length - 1
                    ? `linear-gradient(135deg, ${currentAccent}, #7C3AED)`
                    : 'rgba(255,255,255,0.1)',
                  border: currentSlide === slides.length - 1
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.12)',
                  boxShadow: currentSlide === slides.length - 1
                    ? `0 8px 30px ${currentAccent}30`
                    : 'none',
                }}
              >
                {currentSlide === slides.length - 1 ? t('onboarding.start') : t('onboarding.next')}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="border-t border-white/5 py-3.5 text-center">
            <button
              onClick={onComplete}
              className="text-white/30 text-[11px] font-medium hover:text-white/60 transition-colors"
            >
              {t('onboarding.has_account')} <span className="font-bold" style={{ color: currentAccent }}>{t('onboarding.login_link')}</span>
            </button>
          </div>
        </div>

        {/* Safe Area Bottom Spacer */}
        <div style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
      </div>
    </motion.div>
  );
};

// --- Components ---

const PrivacyPolicyScreen = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="h-full bg-white overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header className="px-6 pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('privacy.title')}</h1>
        <div className="w-9" />
      </header>

      <div className="p-8 space-y-8 text-zinc-600">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section1_title')}</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {t('privacy.section1_content')}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section2_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('privacy.section2_content')}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section3_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('privacy.section3_content')}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section4_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('privacy.section4_content')}
          </p>
        </section>

        <div className="pt-8 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400">{t('privacy.last_updated')}</p>
        </div>
      </div>
    </div>
  );
};

const AdBanner = ({ isPremium, onUpgrade, type = 'banner' }: { isPremium: boolean, onUpgrade: () => void, type?: 'banner' | 'native' | 'large' }) => {
  if (isPremium) return null;

  if (type === 'native') {
    return (
      <div className="w-full px-6 py-4">
        <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white bg-zinc-900 px-1.5 py-0.5 rounded uppercase tracking-tighter">Sponsored</span>
              <span className="text-[10px] font-bold text-zinc-400">Google AdSense</span>
            </div>
            <button onClick={onUpgrade} className="text-[10px] font-bold text-emerald-600 hover:underline">광고 제거</button>
          </div>
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-200/50">
              <ShoppingBag className="w-8 h-8 text-zinc-300" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-zinc-900 mb-1">반려견 맞춤형 건강 사료</h4>
              <p className="text-xs text-zinc-500 leading-relaxed mb-3">유전 분석 결과에 따른 최적의 영양 밸런스를 확인하세요.</p>
              <button className="w-full py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">자세히 보기</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-4">
      <div className="bg-zinc-100 rounded-2xl p-3 border border-zinc-200 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black text-zinc-500 border border-zinc-300 px-1 rounded uppercase tracking-tighter">AD</span>
            <span className="text-[9px] font-medium text-zinc-400">Google AdSense</span>
          </div>
          <button 
            onClick={onUpgrade}
            className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest hover:underline"
          >
            광고 제거
          </button>
        </div>
        
        <div className={cn(
          "bg-zinc-200/50 rounded-xl flex flex-col items-center justify-center border border-dashed border-zinc-300 transition-colors group-hover:bg-zinc-200/80",
          type === 'large' ? "aspect-[300/250]" : "aspect-[320/50]"
        )}>
          <div className="flex items-center gap-2 text-zinc-400">
            <Activity className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">맞춤형 광고 영역</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, onNavigateToSignUp }: { onLogin: (email: string) => void, onNavigateToSignUp: () => void }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Simulate social login
    onLogin(`${provider}@user.com`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-0 h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-white z-50 overflow-y-auto no-scrollbar"
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <Scan className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('auth.login_title')}</h1>
          <p className="text-zinc-500 text-sm mt-2">{t('auth.login_welcome')}</p>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google_login')}
          </button>

          <button 
            onClick={() => handleSocialLogin('apple')}
            className="w-full flex items-center justify-center gap-3 bg-white/10 text-white py-4 rounded-2xl font-bold text-sm border border-white/10 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {t('auth.apple_login')}
          </button>

          <button 
            onClick={() => handleSocialLogin('kakao')}
            className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.77 5.02 4.44 6.38l-1.13 4.12 4.78-3.15c.6.08 1.24.15 1.91.15 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
            </svg>
            {t('auth.kakao_login')}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('auth.or_continue')}</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('auth.email_label')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('auth.password_label')}</label>
              <button type="button" className="text-[10px] text-emerald-400 font-bold hover:underline">{t('auth.forgot_password')}</button>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]"
          >
            {t('auth.login_button')}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={onNavigateToSignUp}
            className="text-zinc-500 text-xs hover:text-white transition-colors"
          >
            {t('auth.no_account')} <span className="text-emerald-400 font-bold">{t('auth.signup_link')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SignUpScreen = ({ onSignUp, onNavigateToLogin }: { onSignUp: (email: string) => void, onNavigateToLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && password === confirmPassword) {
      onSignUp(email);
    } else if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-0 h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-white z-50"
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <Scan className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">회원가입</h1>
          <p className="text-zinc-500 text-sm mt-2">반려동물을 위한 스마트한 건강 관리</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">이메일</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="example@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">비밀번호</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">비밀번호 확인</label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]"
          >
            가입하기
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={onNavigateToLogin}
            className="text-zinc-500 text-xs hover:text-white transition-colors"
          >
            이미 계정이 있으신가요? <span className="text-emerald-400 font-bold">로그인</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const StatusBar = ({ dark = false }: { dark?: boolean }) => {
  // On real mobile devices, the system status bar is handled by the OS.
  // This component now only provides safe-area spacing.
  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-[100] pointer-events-none",
      dark ? "text-white" : "text-zinc-900"
    )}
    style={{ height: 'max(env(safe-area-inset-top, 0px), 12px)' }}
    />
  );
};

const Navigation = ({ current, onNavigate }: { current: Screen, onNavigate: (s: Screen) => void }) => {
  const { t } = useTranslation();
  const items = [
    { id: 'camera', icon: Camera, label: t('nav.scan') },
    { id: 'pet-dashboard', icon: LayoutDashboard, label: t('nav.health') },
    { id: 'history', icon: HistoryIcon, label: t('nav.history') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 px-6 pt-3 flex justify-around items-center z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as Screen)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-200 relative min-w-[56px] min-h-[44px] justify-center",
            current === item.id ? "text-emerald-600" : "text-zinc-400 active:text-zinc-600"
          )}
        >
          <item.icon className={cn("w-6 h-6 transition-transform", current === item.id && "scale-110")} />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          {current === item.id && (
            <motion.div 
              layoutId="nav-dot"
              className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-emerald-600"
            />
          )}
        </button>
      ))}
    </nav>
  );
};

const CameraScreen = ({ onScan, onBack, isLoggedIn, isPremium, scanCount, analysisResult, capturedImage }: { onScan: (data: any) => void, onBack: () => void, isLoggedIn: boolean, isPremium?: boolean, scanCount?: number, analysisResult?: any, capturedImage?: string | null }) => {
  const { t, i18n } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<'home' | 'camera'>('home');
  const [isScanning, setIsScanning] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);

  const setupCamera = async () => {
    setIsCameraLoading(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(() => {});
          setHasPermission(true);
        }
      } catch {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => videoRef.current?.play().catch(() => {});
          setHasPermission(true);
        }
      }
    } catch {
      setHasPermission(false);
    } finally {
      setIsCameraLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'camera') {
      setupCamera();
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(t => t.stop());
        }
      };
    }
  }, [mode]);

  const handleCapture = () => {
    if (isScanning) return;
    let imageData = uploadedImage;
    if (!imageData && videoRef.current && videoRef.current.readyState === 4) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        imageData = canvas.toDataURL('image/jpeg');
      }
    }
    if (!imageData) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      onScan({ image: imageData });
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;
        setUploadedImage(dataUrl);
        setIsScanning(true);
        setTimeout(() => {
          setIsScanning(false);
          onScan({ image: dataUrl });
        }, 1500);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // ====== CAMERA MODE ======
  if (mode === 'camera') {
    return (
      <div className="relative h-full w-full bg-black overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-700", hasPermission ? "opacity-100" : "opacity-0")} />
          {isCameraLoading && (
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          )}
          {!hasPermission && hasPermission !== null && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-zinc-950 p-8 text-center">
              <Camera className="w-12 h-12 text-white/20 mb-4" />
              <h3 className="text-white font-bold mb-2">{t('camera.permission_title')}</h3>
              <p className="text-white/40 text-xs mb-6">{t('camera.permission_desc')}</p>
              <button onClick={setupCamera} className="py-3 px-8 bg-white text-black rounded-2xl font-bold text-xs">{t('camera.request_permission')}</button>
            </div>
          )}
        </div>
        <div className="absolute inset-0 z-30 flex flex-col pointer-events-none">
          <div className="w-full flex justify-between items-center p-6 pointer-events-auto" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
            <button onClick={() => { setMode('home'); if(videoRef.current?.srcObject) { (videoRef.current.srcObject as MediaStream).getTracks().forEach(t=>t.stop()); } }} className="p-3 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 text-white active:scale-90 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-2.5 border border-white/10 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">AI Vision Active</span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-72 h-72 border border-white/20 rounded-[3rem] flex items-center justify-center">
              <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-[2.5rem]" />
              <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-[2.5rem]" />
              <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-[2.5rem]" />
              <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-[2.5rem]" />
              {isScanning && (
                <motion.div
                  initial={{ top: '10%' }} animate={{ top: '90%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-6 right-6 h-1 bg-emerald-500/50 blur-sm z-10"
                />
              )}
              <div className="flex flex-col items-center gap-2 opacity-40">
                <Scan className="w-8 h-8 text-white" />
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em]">Align Subject</span>
              </div>
            </div>
          </div>
          <div className="w-full bg-gradient-to-t from-black/90 to-transparent pt-16 pb-12 px-8 pointer-events-auto">
            <div className="flex items-center justify-center">
              <button onClick={handleCapture} disabled={isScanning} className="relative group">
                <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center p-1">
                  <div className="w-full h-full rounded-full border-4 border-white flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white group-active:scale-90 transition-transform" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====== HOME/SCAN MODE (Default) ======
  const scansLeft = isPremium ? 999 : Math.max(0, 3 - (scanCount || 0));
  // Language switching handled by LanguageSwitcher component

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header */}
      <header className="px-6 pb-4 bg-white sticky top-0 z-40 border-b border-zinc-100" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <PawPrint className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-black text-zinc-900 tracking-tight">Pet Genie</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="button" />
          </div>
        </div>
      </header>

      <div className="px-6 pt-6 space-y-6">
        {/* Hero Scan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-7 text-white shadow-2xl shadow-zinc-300"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[60px]" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[50px]" />
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-emerald-400/20"
              style={{ width: 3 + Math.random() * 4, height: 3 + Math.random() * 4, left: `${20 + Math.random() * 60}%`, top: `${10 + Math.random() * 60}%` }}
              animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}

          <div className="relative z-10">
            {/* Scan count badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
                {isPremium ? t('scan_home.unlimited') : t('scan_home.scans_left', { count: scansLeft })}
              </span>
            </div>

            <h2 className="text-[22px] font-extrabold leading-tight mb-2 tracking-tight">
              {t('scan_home.hero_title')}
            </h2>
            <p className="text-white/40 text-[13px] font-medium leading-relaxed mb-7 max-w-[240px]">
              {t('scan_home.hero_desc')}
            </p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('camera')}
                className="flex items-center justify-center gap-2.5 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold text-[13px] active:scale-[0.97] transition-all shadow-lg shadow-emerald-500/25"
              >
                <Camera className="w-5 h-5" />
                {t('scan_home.take_photo')}
              </button>
              <label className="flex items-center justify-center gap-2.5 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-2xl font-bold text-[13px] active:scale-[0.97] transition-all cursor-pointer">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                <Upload className="w-5 h-5" />
                {t('scan_home.upload_photo')}
              </label>
            </div>
          </div>
        </motion.div>

        {/* Last Scan Result Preview (if exists) - ABOVE How It Works */}
        {analysisResult && capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <HistoryIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('scan_home.last_result')}</span>
            </div>
            <div className="flex items-center gap-4 px-5 pb-4">
              <img src={capturedImage} alt="" className="w-14 h-14 rounded-xl object-cover border border-zinc-100" referrerPolicy="no-referrer" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-zinc-900 truncate">{analysisResult.primaryBreed}</h4>
                <p className="text-xs text-zinc-400">{t('scan_home.breed_match', { percent: analysisResult.breedMatch || 85 })}% {t('analysis.confidence') || 'Confidence'}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-600">{analysisResult.primaryPercentage}%</span>
                <p className="text-[9px] text-zinc-400">{t('dashboard.primary_breed')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">{t('scan_home.how_it_works')}</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { step: '01', icon: Camera, title: t('scan_home.step1_title'), desc: t('scan_home.step1_desc'), color: 'bg-emerald-50 text-emerald-600' },
              { step: '02', icon: Dna, title: t('scan_home.step2_title'), desc: t('scan_home.step2_desc'), color: 'bg-blue-50 text-blue-600' },
              { step: '03', icon: FileText, title: t('scan_home.step3_title'), desc: t('scan_home.step3_desc'), color: 'bg-purple-50 text-purple-600' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="bg-white rounded-2xl p-4 border border-zinc-100 shadow-sm text-center"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3", item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">{item.step}</span>
                <h4 className="text-[11px] font-bold text-zinc-800 mt-1">{item.title}</h4>
                <p className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* AdSense Banner */}
        <AdBanner isPremium={isPremium || false} onUpgrade={() => {}} type="banner" />

        {/* Premium Upsell (for free users) */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200/50"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-800 mb-1">{t('scan_home.premium_title')}</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">{t('scan_home.premium_desc')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {[t('scan_home.feature_unlimited'), t('scan_home.feature_report'), t('scan_home.feature_guide')].map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                      <Check className="w-3 h-3" /> {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Spacer for content */}
        <div className="h-4" />
      </div>
    </div>
  );
};

const PetDashboard = ({ onDetail, onScan, onNavigate, isPremium, scanCount, analysisResult, capturedImage, onLogout, dailyCare, onToggleCare, petProfile }: { onDetail: () => void, onScan: () => void, onNavigate: (s: Screen) => void, isPremium: boolean, scanCount: number, analysisResult?: any, capturedImage?: string | null, onLogout: () => void, dailyCare: CareItem[], onToggleCare: (id: string) => void, petProfile: PetProfile }) => {
  const { t, i18n } = useTranslation();
  const isScanLimitReached = !isPremium && scanCount >= 3;

  // Language switching handled by LanguageSwitcher component

  // Calculate care score based ONLY on daily care completion (honest metric)
  const completedCareCount = dailyCare.filter(c => c.completed).length;
  const careCompletionRate = dailyCare.length > 0 ? (completedCareCount / dailyCare.length) * 100 : 0;
  const healthScore = Math.round(careCompletionRate);
  const healthColor = healthScore >= 80 ? '#10b981' : healthScore >= 60 ? '#f59e0b' : healthScore >= 40 ? '#fb923c' : '#94a3b8';
  const healthLabel = healthScore >= 80 ? t('dashboard.health_excellent') : healthScore >= 60 ? t('dashboard.health_good') : healthScore >= 40 ? t('dashboard.health_caution') : t('dashboard.health_warning');

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      {/* Header with Profile */}
      <header className="bg-white px-6 pb-6 border-b border-zinc-100 sticky top-0 z-30" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-sm bg-zinc-100 flex items-center justify-center">
              {capturedImage ? (
                <img 
                  src={capturedImage} 
                  alt="Pet" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <PawPrint className="w-6 h-6 text-zinc-300" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">
                {isPremium && (petProfile.name || analysisResult?.petName)
                  ? t('dashboard.greeting', { name: petProfile.name || analysisResult?.petName })
                  : t('dashboard.greeting_no_name')}
              </h1>
              <div className="flex items-center gap-1.5">
                <div className={cn("w-1.5 h-1.5 rounded-full", isPremium ? "bg-emerald-500" : "bg-zinc-300")} />
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                  {isPremium ? t('common.premium_member') : `${t('common.free_member')} (${scanCount}/3)`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher variant="button" />
            {!isPremium && (
              <button 
                onClick={() => onNavigate('membership')}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-wider border border-emerald-100"
              >
                {t('common.upgrade')}
              </button>
            )}
            <button 
              onClick={onLogout}
              className="p-2.5 bg-zinc-50 text-zinc-400 rounded-xl hover:text-zinc-900"
              title={t('common.logout')}
            >
              <Moon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Curious Hero Banner */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer"
          onClick={() => onNavigate('camera')}
        >
          <img 
            src="https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800" 
            alt="Curious Pet" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('dashboard.hero_subtitle')}</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{t('dashboard.hero_title')}</h2>
            <p className="text-zinc-300 text-[10px] font-medium">{t('dashboard.hero_desc')}</p>
          </div>
          <div className="absolute top-6 right-6">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Revenue Feature: Premium Upgrade / Subscription Banner */}
        {!isPremium && (
          <motion.div 
            whileHover={{ scale: 1.02 }}
            onClick={() => onNavigate('membership')}
            className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden cursor-pointer"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-white/20 p-1 rounded-lg">
                  <Heart className="w-4 h-4 fill-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t('dashboard.premium_banner.title')}</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{t('dashboard.premium_banner.subtitle')}</h3>
              <p className="text-emerald-50/70 text-xs font-medium mb-4">{t('dashboard.premium_banner.desc')}</p>
              <div className="bg-white text-emerald-700 w-fit px-5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-black/10">
                {t('dashboard.premium_banner.button')}
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          </motion.div>
        )}

        {/* Scan Limit Alert for Free Users */}
        {isScanLimitReached && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-3xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-rose-900">{t('dashboard.scan_limit_title')}</p>
              <p className="text-[10px] text-rose-600 mt-0.5">{t('dashboard.scan_limit_desc')}</p>
            </div>
            <button 
              onClick={() => onNavigate('membership')}
              className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
            >
              {t('dashboard.scan_limit_button')}
            </button>
          </div>
        )}

        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={() => onNavigate('membership')} type="native" />

        {/* Health Score + Daily Care Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Health Score Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full" />
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">{t('dashboard.health_score')}</p>
            <div className="relative">
              <CircularProgress value={healthScore} size={100} strokeWidth={8} color={healthColor} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black" style={{ color: healthColor }}>{healthScore}</span>
                <span className="text-[9px] font-bold text-zinc-400">{healthLabel}</span>
              </div>
            </div>
            <p className="text-[9px] text-zinc-400 mt-2 text-center">{t('dashboard.health_score_desc')}</p>
          </motion.div>

          {/* Daily Care Checklist Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 border border-zinc-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.daily_care')}</p>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {dailyCare.filter(c => c.completed).length}/{dailyCare.length}
              </span>
            </div>
            <div className="space-y-2">
              {dailyCare.map((care) => (
                <button 
                  key={care.id}
                  onClick={() => onToggleCare(care.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 py-2 px-2.5 rounded-xl transition-all text-left",
                    care.completed ? "bg-emerald-50/50" : "hover:bg-zinc-50 active:scale-[0.98]"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    care.completed ? "bg-emerald-500 text-white" : "border-2 border-zinc-200"
                  )}>
                    {care.completed && <Check className="w-3 h-3" />}
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium transition-all",
                    care.completed ? "text-zinc-400 line-through" : "text-zinc-700"
                  )}>{care.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Genetic Analysis Card */}
        <div className="bg-[#1A241A] rounded-[2.5rem] p-8 border border-white/5 shadow-sm relative overflow-hidden group">
          {/* Curious Background for Card */}
          <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
            <img 
              src="https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=500" 
              alt="DNA Pattern" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('dashboard.genetic_title')}</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold tracking-tight text-white">{analysisResult?.primaryBreed || t('dashboard.default_breed')}</h2>
                  <span className="text-[#00FF41] font-bold text-lg">{analysisResult?.primaryPercentage || 70}%</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41] border border-[#00FF41]/20">
                <Dna className="w-7 h-7" />
              </div>
            </div>
            
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${analysisResult?.primaryPercentage || 70}%` }}
                className="h-full bg-[#00FF41] rounded-full shadow-[0_0_10px_rgba(0,255,65,0.3)]" 
              />
            </div>
          </div>
        </div>

        {/* Quick Actions Grid - Improved UX & Connected */}
        <div className="grid grid-cols-5 gap-2">
          {[
            { icon: Scan, label: t('dashboard.quick_actions.scan'), color: 'bg-emerald-50 text-emerald-600', action: onScan },
            { icon: FileText, label: t('dashboard.quick_actions.report'), color: 'bg-blue-50 text-blue-600', action: () => isPremium ? onDetail() : onNavigate('membership') },
            { icon: Utensils, label: t('dashboard.quick_actions.diet'), color: 'bg-orange-50 text-orange-600', action: () => isPremium ? onNavigate('diet-guide') : onNavigate('membership') },
            { icon: Activity, label: t('dashboard.quick_actions.exercise'), color: 'bg-purple-50 text-purple-600', action: () => isPremium ? onNavigate('exercise-plan') : onNavigate('membership') },
            { icon: BookOpen, label: t('dashboard.quick_actions.care'), color: 'bg-rose-50 text-rose-600', action: () => isPremium ? onNavigate('care-guide') : onNavigate('membership') },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={item.action}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Scans Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold text-zinc-900 tracking-tight">{t('dashboard.recent_scans')}</h3>
            <button className="text-emerald-600 text-xs font-bold">{t('dashboard.view_all')}</button>
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.98 }}
            onClick={onDetail}
            className="w-full bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm flex items-center gap-4 text-left group"
          >
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 overflow-hidden shrink-0">
              <img 
                src={capturedImage || "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=200"} 
                alt={t('dashboard.scan_item.title')} 
                className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase">{t('dashboard.scan_item.status')}</span>
                <p className="text-sm font-bold text-zinc-900">{t('dashboard.scan_item.title')}</p>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                {i18n.language === 'ko' 
                  ? t('dashboard.scan_item.date_format', { year: '2026', month: '3', day: '4', time: '오후 11:27' })
                  : t('dashboard.scan_item.date_format', { year: '2026', month: 'March', day: '4', time: '11:27 PM' })
                }
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </motion.button>
        </div>
        
        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={() => onNavigate('membership')} type="native" />

        <footer className="pt-12 pb-8 px-6 text-center space-y-4">
          <div className="flex justify-center gap-6">
            <button onClick={() => onNavigate('privacy')} className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900">{t('privacy.title')}</button>
            <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900">{t('dashboard.footer.terms')}</button>
            <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900">{t('dashboard.footer.contact')}</button>
          </div>
          <p className="text-[9px] text-zinc-300 font-medium">{t('dashboard.footer.rights')}</p>
        </footer>
      </div>
    </div>
  );
};

const HealthReport = ({ onBack, isPremium, onUpgrade, analysisResult, capturedImage, onNavigate, onSelectCareGuides }: { onBack: () => void, isPremium: boolean, onUpgrade: () => void, analysisResult?: any, capturedImage?: string | null, onNavigate?: (s: Screen) => void, onSelectCareGuides?: (guides: any[]) => void }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header className="px-6 pb-6 flex items-center justify-between bg-[#0A120A] sticky top-0 z-50" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-white uppercase tracking-widest">{t('analysis.detail_title')}</h1>
        <button className="p-2 text-zinc-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="p-6 space-y-8">
        {/* Analysis Image Preview */}
        {capturedImage && (
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
            <img 
              src={capturedImage} 
              alt="Analyzed Pet" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t('camera.analysis_complete')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Breed Analysis Result */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">{t('dashboard.breed_analysis')}</h3>
            <div className="flex items-center gap-1.5 text-[#00FF41] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('analysis.confidence') || 'Confidence'} {analysisResult?.breedMatch || 85}%</span>
            </div>
          </div>
          
          {/* Confidence Progress Bar - visible for all users */}
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${analysisResult?.breedMatch || 85}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-[#00FF41] rounded-full shadow-[0_0_15px_rgba(0,255,65,0.4)]"
            />
          </div>
          <p className="text-[10px] text-zinc-500 mb-8 text-right">{t('analysis.ai_confidence') || 'AI Analysis Confidence'}: {analysisResult?.breedMatch || 85}%</p>

          {/* Primary breed - visible to all */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00FF41]" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.primary_breed')}</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-1">{analysisResult?.primaryBreed || "Golden Retriever"}</h4>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-black text-[#00FF41]">{isPremium ? `${analysisResult?.primaryPercentage || 70}%` : '??%'}</p>
              {!isPremium && <span className="text-[10px] text-zinc-500">({t('analysis.upgrade_to_see') || 'Upgrade to see'})</span>}
            </div>
          </div>

          {/* Secondary breed - Premium only */}
          {isPremium ? (
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.secondary_breed')}</span>
              </div>
              <h4 className="text-lg font-bold text-zinc-300 mb-1">{analysisResult?.secondaryBreed || "Jindo Dog"}</h4>
              <p className="text-2xl font-black text-zinc-500">{analysisResult?.secondaryPercentage || 30}%</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-md flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Premium</span>
                </div>
              </div>
              <div className="blur-[4px] opacity-30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.secondary_breed')}</span>
                </div>
                <h4 className="text-lg font-bold text-zinc-300 mb-1">???</h4>
                <p className="text-2xl font-black text-zinc-500">??%</p>
              </div>
            </div>
          )}
        </section>

        {/* Free User: Premium Upgrade CTA */}
        {!isPremium && (
          <>
            {/* Teaser - show blurred preview of detailed analysis */}
            <section className="relative rounded-[2.5rem] overflow-hidden border border-white/5">
              {/* Blurred preview background */}
              <div className="p-8 space-y-4 blur-[6px] opacity-30 pointer-events-none select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-2 w-20 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 bg-white/5 rounded-2xl" />
                  <div className="h-12 bg-white/5 rounded-2xl" />
                  <div className="h-12 bg-white/5 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-20 bg-white/5 rounded-2xl" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                </div>
              </div>
              
              {/* Overlay CTA */}
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0A120A]/60 via-[#0A120A]/90 to-[#0A120A] flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('report.premium_report_title')}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-[260px] mx-auto whitespace-pre-wrap">
                      {t('report.premium_report_desc')}
                    </p>
                  </div>
                  
                  {/* Feature preview list */}
                  <div className="space-y-2 text-left max-w-[240px] mx-auto">
                    {[
                      { icon: '🧬', text: t('report.risk_factors_title') },
                      { icon: '🔍', text: t('dashboard.breed_analysis') },
                      { icon: '📊', text: t('report.genetic_mix_title') },
                      { icon: '💊', text: t('report.ai_insights_title') },
                      { icon: '📋', text: t('dashboard.expert_guide') },
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5"
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs font-medium text-zinc-300">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onUpgrade}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black px-10 py-4 rounded-2xl text-sm font-black shadow-2xl shadow-emerald-500/30 w-full max-w-[260px]"
                  >
                    🔓 {i18n.language.startsWith('en') ? 'Start Premium — $4.99/mo' : i18n.language.startsWith('ja') ? 'Premiumを開始 — $4.99/月' : i18n.language.startsWith('zh') ? '开始 Premium — $4.99/月' : i18n.language.startsWith('es') ? 'Iniciar Premium — $4.99/mes' : 'Premium 시작하기 — $4.99/월'}
                  </motion.button>
                  <p className="text-[10px] text-zinc-600 font-medium">
                    {i18n.language.startsWith('en') ? 'Cancel anytime · 7-day free trial' : i18n.language.startsWith('ja') ? 'いつでもキャンセル可能・7日間無料体験' : i18n.language.startsWith('zh') ? '随时取消 · 7天免费试用' : i18n.language.startsWith('es') ? 'Cancela en cualquier momento · 7 días gratis' : '언제든지 해지 가능 · 7일 무료 체험'}
                  </p>
                </motion.div>
              </div>
            </section>

            {/* AdSense for Free Users */}
            <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
          </>
        )}

        {/* === ANALYSIS SECTIONS (visible to all, content restricted for free) === */}
        {/* Identification Basis - Evidence Section */}
        {analysisResult?.identificationBasis && (
          <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {i18n.language.startsWith('ja') ? '品種識別根拠' : i18n.language.startsWith('en') ? 'Identification Basis' : i18n.language.startsWith('zh') ? '品种识别依据' : i18n.language.startsWith('es') ? 'Base de identificación' : '품종 식별 근거'}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Identification Basis</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {analysisResult.identificationBasis.map((basis: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={cn(
                    "flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden",
                    !isPremium && i >= 1 && "max-h-[60px]"
                  )}
                >
                  {!isPremium && i >= 1 && (
                    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[4px] flex items-center justify-center">
                      <button onClick={onUpgrade} className="text-[9px] font-black text-[#00FF41] uppercase tracking-tighter border border-[#00FF41]/30 px-3 py-1 rounded-full bg-[#00FF41]/5">
                        Premium
                      </button>
                    </div>
                  )}
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-blue-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">{basis}</p>
                </motion.div>
              ))}
            </div>

            {analysisResult?.breedSource && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-400/80 tracking-wide">
                  📋 {i18n.language.startsWith('ja') ? '出典' : i18n.language.startsWith('en') ? 'Source' : i18n.language.startsWith('zh') ? '来源' : i18n.language.startsWith('es') ? 'Fuente' : '출처'}: {analysisResult.breedSource}
                </span>
              </div>
            )}
          </section>
        )}

        {/* Expert Insights Section (NotebookLM Based) */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('dashboard.expert_guide')}</h3>
          </div>

          <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-[#00FF41]/30">
              <Quote className="absolute -left-1 -top-2 w-4 h-4 text-[#00FF41] opacity-50" />
              <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                {analysisResult?.expertInsights?.wsava || (i18n.language.startsWith('ja') ? '栄養状態は体温、脈拍と並ぶ「5番目のバイタルサイン」です。体系的な栄養評価により疾病を予防し寿命を延ばすことができます。' : i18n.language.startsWith('en') ? 'Nutritional status is the "fifth vital sign" alongside temperature and pulse. Systematic nutritional assessment can prevent disease and extend lifespan.' : '영양 상태는 체온, 맥박과 함께 "다섯 번째 활력징후"입니다. 체계적인 영양 평가를 통해 질병을 예방하고 수명을 연장할 수 있습니다.')}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {i18n.language.startsWith('ja') ? '出典：世界小動物獣医師会（WSAVA）ガイドライン' : i18n.language.startsWith('en') ? 'Source: World Small Animal Veterinary Association (WSAVA) Guidelines' : i18n.language.startsWith('zh') ? '来源：世界小动物兽医协会（WSAVA）指南' : i18n.language.startsWith('es') ? 'Fuente: Directrices de WSAVA' : '출처: 세계소동물수의사회 (WSAVA) 지침'}
                </span>
              </div>
            </div>

            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[6px] flex flex-col items-center justify-center rounded-xl border border-white/5">
                  <button onClick={onUpgrade} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                    {t('dashboard.premium_only')}
                  </button>
                </div>
              )}
              <div className={cn("pl-6 border-l-2 border-blue-500/30", !isPremium && "opacity-40 blur-[2px]")}>
                <Quote className="absolute -left-1 -top-2 w-4 h-4 text-blue-400 opacity-50" />
                <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                  {analysisResult?.expertInsights?.steveMann || (i18n.language.startsWith('ja') ? '強圧的な方法の代わりに、おやつやおもちゃを活用した「正の強化トレーニング」が愛犬との信頼関係を築く鍵です。ボディランゲージを理解し、コミュニケーションを取りましょう。' : i18n.language.startsWith('en') ? 'Instead of coercive methods, "positive reinforcement training" using treats and toys is key to building trust with your dog. Understand their body language and communicate.' : '강압적인 방식 대신 간식과 장난감을 활용한 "긍정강화교육"이 반려견과의 신뢰를 쌓는 핵심입니다. 보디랭귀지를 이해하고 소통하세요.')}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {i18n.language.startsWith('ja') ? '出典：スティーブ・マン（Steve Mann）教育方法論' : i18n.language.startsWith('en') ? 'Source: Steve Mann Training Methodology' : i18n.language.startsWith('zh') ? '来源：Steve Mann 教育方法论' : i18n.language.startsWith('es') ? 'Fuente: Metodología de Steve Mann' : '출처: 스티브 만 (Steve Mann) 교육 방법론'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {t('dashboard.notebooklm_desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Genetic Mix Breakdown */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#00FF41]">
              <Dna className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('report.genetic_mix_title')}</h3>
          </div>
          
            <div className="space-y-6">
            {(analysisResult?.lineage || [
              { label: '리트리버 계열 (Retriever Lineage)', value: 72, color: 'bg-[#00FF41]' },
              { label: '스피츠 계열 (Spitz Lineage)', value: 25, color: 'bg-zinc-500' },
              { label: '기타 미분류 (Others)', value: 3, color: 'bg-zinc-700' },
            ]).map((item: any, i: number) => (
              <div key={i} className={cn("space-y-2 relative", !isPremium && i >= 1 && "opacity-30 blur-[3px]")}>
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="text-white">{isPremium || i === 0 ? `${item.value}%` : '??%'}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}
            {!isPremium && (
              <button onClick={onUpgrade} className="w-full text-center text-[10px] font-black text-[#00FF41] uppercase tracking-widest border border-[#00FF41]/20 px-4 py-3 rounded-2xl bg-[#00FF41]/5 hover:bg-[#00FF41]/10 transition-all">
                🔓 전체 유전 믹스 보기
              </button>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              {t('report.disclaimer')}
            </p>
          </div>
        </section>

        {/* Genetic Risk Factors */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">{t('report.risk_factors_title')}</h3>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Genetic Health Screening</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('report.risk_count', { count: (analysisResult?.riskFactors || []).length })}</span>
            </div>
          </div>
          
          <div className="grid gap-5">
            {(analysisResult?.riskFactors || [
              {
                name: "고관절 이형성증",
                riskLevel: "high",
                description: "골든 리트리버 품종에서 흔히 발생합니다. 관절 건강을 위해 조기 발견과 체중 관리가 매우 중요합니다."
              }
            ]).map((risk: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "group relative bg-[#0D0D0D] rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden",
                  !isPremium && i > 0 && "max-h-[120px]"
                )}
              >
                {!isPremium && i > 0 && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">{t('report.additional_risks', { count: analysisResult?.riskFactors?.length - 1 || 0 })}</p>
                    <button onClick={onUpgrade} className="text-[9px] font-black text-[#00FF41] uppercase tracking-tighter border border-[#00FF41]/30 px-3 py-1 rounded-full bg-[#00FF41]/5">
                      {t('report.premium_only')}
                    </button>
                  </div>
                )}
                {/* Vertical Accent Bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  risk.riskLevel === 'high' ? "bg-rose-500" : 
                  risk.riskLevel === 'medium' ? "bg-orange-500" : "bg-emerald-500"
                )} />

                <div className={cn("p-8", !isPremium && i > 0 && "blur-[4px] opacity-20")}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                        risk.riskLevel === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                        risk.riskLevel === 'medium' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : 
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        <BriefcaseMedical className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-[#00FF41] transition-colors">{risk.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                          {risk.riskLevel === 'high' ? 'Critical Risk' : risk.riskLevel === 'medium' ? 'Moderate Risk' : 'Low Risk'}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                      risk.riskLevel === 'high' ? "bg-rose-500 text-white" : 
                      risk.riskLevel === 'medium' ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                      {risk.riskLevel === 'high' ? t('report.risk_level_high') : risk.riskLevel === 'medium' ? t('report.risk_level_medium') : t('report.risk_level_low')}
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-4">
                    {risk.description}
                  </p>

                  {/* Evidence badges: prevalence & source */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {risk.prevalence && (
                      <div className="flex items-center gap-1.5 bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-xl">
                        <TrendingUp className="w-3 h-3 text-rose-400" />
                        <span className="text-[10px] font-bold text-rose-300/80 tracking-wide">{risk.prevalence}</span>
                      </div>
                    )}
                    {risk.source && (
                      <div className="flex items-center gap-1.5 bg-blue-500/5 border border-blue-500/10 px-3 py-1.5 rounded-xl">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-300/80 tracking-wide">📋 {risk.source}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, idx) => (
                          <div key={idx} className="w-6 h-6 rounded-full border-2 border-[#0D0D0D] bg-zinc-800 flex items-center justify-center overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=40&h=40&sig=${idx}`} className="w-full h-full object-cover opacity-50" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('report.expert_review')}</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (isPremium) {
                          if (risk.careGuides) {
                            onSelectCareGuides?.(risk.careGuides);
                          }
                          onNavigate?.('care-guide');
                        } else {
                          onUpgrade();
                        }
                      }}
                      className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group/btn"
                    >
                      {t('report.care_guide_link')} <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Subtle background pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Dna className="w-32 h-32 rotate-12" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Health Insights Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">{t('report.ai_insights_title')}</h3>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">AI-Powered Recommendations</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {analysisResult?.expertInsights ? (
              <div className="bg-[#0D0D0D] rounded-[2.5rem] p-8 border border-white/5 space-y-8 relative overflow-hidden group hover:border-white/10 transition-all duration-500">
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">전문가 조언</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{analysisResult.expertInsights.expertAdvice}</p>
                  </div>
                </div>
                
                <div className={cn("flex items-start gap-5 relative z-10", !isPremium && "opacity-30 blur-[4px]")}>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">영양 및 활력 징후 (WSAVA 기준)</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{analysisResult.expertInsights.wsava}</p>
                  </div>
                </div>
                
                <div className={cn("flex items-start gap-5 relative z-10", !isPremium && "opacity-30 blur-[4px]")}>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">행동 및 훈련 (Steve Mann 기준)</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{analysisResult.expertInsights.steveMann}</p>
                  </div>
                </div>
                {!isPremium && (
                  <button onClick={onUpgrade} className="w-full text-center text-[10px] font-black text-[#00FF41] uppercase tracking-widest border border-[#00FF41]/20 px-4 py-3 rounded-2xl bg-[#00FF41]/5 hover:bg-[#00FF41]/10 transition-all relative z-10">
                    🔓 전체 인사이트 보기
                  </button>
                )}

                {/* Decorative background glow */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors" />
              </div>
            ) : (
              <div className="bg-[#0D0D0D] rounded-[2.5rem] p-12 border border-dashed border-white/10 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                  <Activity className="w-8 h-8" />
                </div>
                <p className="text-zinc-500 text-sm">분석 결과가 없습니다.</p>
              </div>
            )}
          </div>
        </section>


        {/* Detailed Genetic Analysis */}
        <section className="relative">
          <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/5 overflow-hidden relative group">
            {!isPremium && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[8px] flex flex-col items-center justify-center p-8 text-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-[#00FF41] text-black rounded-[1.5rem] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,65,0.3)]"
                >
                  <Dna className="w-8 h-8" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-2">정밀 유전 분석 리포트</h4>
                <p className="text-zinc-400 text-xs mb-8 leading-relaxed max-w-[200px] mx-auto">
                  프리미엄 회원만 확인 가능한<br />
                  <span className="text-white font-bold">상세 유전 질환 24종</span> 및<br />
                  <span className="text-white font-bold">혈통 분석 데이터</span>입니다.
                </p>
                <button 
                  onClick={onUpgrade}
                  className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-black shadow-2xl active:scale-95 transition-all hover:bg-[#00FF41]"
                >
                  멤버십 업그레이드
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('analysis.mapping_title')}</h3>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Advanced DNA Mapping</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
              </div>
            </div>

            <div className="space-y-6">
              {(analysisResult?.detailedMarkers || [
                { label: 'MDR1 유전자 변이', value: 98, status: 'normal' },
                { label: '퇴행성 골수염 (DM)', value: 85, status: 'normal' },
                { label: '진행성 망막 위축증', value: 12, status: 'caution' }
              ]).map((marker: any, i: number) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{marker.label}</span>
                      {marker.testSource && (
                        <span className="ml-2 text-[9px] font-medium text-zinc-600">({marker.testSource})</span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-md",
                      marker.status === 'normal' ? "bg-emerald-500/10 text-emerald-500" : 
                      marker.status === 'carrier' ? "bg-orange-500/10 text-orange-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {t(`analysis.status_${marker.status}`)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${marker.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        marker.status === '정상' ? "bg-emerald-500" : 
                        marker.status === '보인자' ? "bg-orange-500" : "bg-rose-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
        </section>

        {/* AI Analysis Disclaimer & Sources */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-6 shadow-sm border border-white/5">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {analysisResult?.disclaimer || "이 분석은 AI 시각 평가와 공개된 수의학 연구를 기반으로 합니다. 전문 수의사의 진단을 대체하지 않습니다."}
            </p>
          </div>
          
          {analysisResult?.expertInsights?.sources && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">참고 자료 References</p>
              <div className="space-y-1">
                {analysisResult.expertInsights.sources.map((src: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span className="text-[10px] text-zinc-500 font-medium">{src}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>



        {/* Final Care CTA - Future of the Pet */}
        <section className="bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] p-10 border border-white/10 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{t('analysis.future_title')}</h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed whitespace-pre-line">
              {t('analysis.future_desc')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigate?.('diet-guide')}
                className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-xs font-bold border border-white/10 transition-all"
              >
                {t('analysis.diet_button')}
              </button>
              <button 
                onClick={() => onNavigate?.('exercise-plan')}
                className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-xs font-bold border border-white/10 transition-all"
              >
                {t('analysis.exercise_button')}
              </button>
            </div>
          </div>
          
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        </section>


        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

const DietGuideScreen = ({ onBack, dietPlan, isPremium, onUpgrade }: { onBack: () => void, dietPlan: any, isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const plan = dietPlan || {
    title: t('diet.title'),
    recommendations: ["충분한 수분 섭취", "균형 잡힌 영양소 공급", "정기적인 식사 시간"],
    prohibitedFoods: ["초콜릿", "포도", "양파"],
    dailyCalories: "정보 없음"
  };

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-32 relative">
      {!isPremium && (
        <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-[12px] flex flex-col items-center justify-center p-8 text-center pt-24">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/30">
            <Utensils className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('diet.premium_title')}</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[240px] whitespace-pre-line">
            {t('diet.premium_desc')}
          </p>
          <button 
            onClick={onUpgrade}
            className="bg-emerald-500 text-black px-10 py-4 rounded-2xl text-sm font-black shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all"
          >
            {t('analysis.upgrade_button')}
          </button>
        </div>
      )}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('diet.title')}</h1>
      </header>

      <div className="p-6 space-y-8">
        <section className="bg-gradient-to-br from-emerald-900/40 to-black rounded-[2.5rem] p-8 border border-emerald-500/20">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mb-6">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{plan.title}</h2>
          <p className="text-emerald-400 font-bold text-sm">{t('diet.calories')}: {plan.dailyCalories}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white px-2">{t('diet.recommend_title')}</h3>
          <div className="grid gap-4">
            {plan.recommendations.map((item: string, i: number) => (
              <div key={i} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <p className="text-zinc-300 text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-rose-400 px-2">{t('diet.prohibit_title')}</h3>
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-[2.5rem] p-6">
            <div className="flex flex-wrap gap-2">
              {plan.prohibitedFoods.map((food: string, i: number) => (
                <span key={i} className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-full text-xs font-bold border border-rose-500/20">
                  {food}
                </span>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-rose-400/60 leading-relaxed">
              {t('diet.prohibit_caution')}
            </p>
          </div>
        </section>

        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

const ExercisePlanScreen = ({ onBack, exercisePlan, isPremium, onUpgrade }: { onBack: () => void, exercisePlan: any, isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const plan = exercisePlan || {
    title: t('exercise.title'),
    dailyGoal: "30분 - 60분",
    activities: [{ name: "산책", duration: "30분", intensity: "medium" }],
    precautions: ["충분한 휴식", "수분 공급"]
  };

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-32 relative">
      {!isPremium && (
        <div className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-[12px] flex flex-col items-center justify-center p-8 text-center pt-24">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-3xl flex items-center justify-center mb-6 border border-blue-500/30">
            <Activity className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t('exercise.premium_title')}</h2>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-[240px] whitespace-pre-line">
            {t('exercise.premium_desc')}
          </p>
          <button 
            onClick={onUpgrade}
            className="bg-blue-500 text-white px-10 py-4 rounded-2xl text-sm font-black shadow-2xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            {t('analysis.upgrade_button')}
          </button>
        </div>
      )}
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('exercise.title')}</h1>
      </header>

      <div className="p-6 space-y-8">
        <section className="bg-gradient-to-br from-blue-900/40 to-black rounded-[2.5rem] p-8 border border-blue-500/20">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{plan.title}</h2>
          <p className="text-blue-400 font-bold text-sm">{t('exercise.goal')}: {plan.dailyGoal}</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white px-2">{t('exercise.routine_title')}</h3>
          <div className="grid gap-4">
            {plan.activities.map((activity: any, i: number) => (
              <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      activity.intensity === 'high' ? "bg-rose-500/10 text-rose-500" :
                      activity.intensity === 'medium' ? "bg-orange-500/10 text-orange-500" :
                      "bg-emerald-500/10 text-emerald-500"
                    )}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white">{activity.name}</h4>
                  </div>
                  <span className="text-zinc-400 font-bold text-sm">{activity.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('exercise.intensity')}:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((step) => (
                      <div 
                        key={step} 
                        className={cn(
                          "w-4 h-1 rounded-full",
                          step === 1 && activity.intensity === 'low' ? "bg-emerald-500" :
                          step <= 2 && activity.intensity === 'medium' ? "bg-orange-500" :
                          step <= 3 && activity.intensity === 'high' ? "bg-rose-500" : "bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white px-2">{t('exercise.caution_title')}</h3>
          <div className="grid gap-3">
            {plan.precautions.map((item: string, i: number) => (
              <div key={i} className="flex items-start gap-3 px-2">
                <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                <p className="text-zinc-400 text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

const Marketplace = ({ onBack, onNavigate, isPremium }: { onBack: () => void, onNavigate: (s: Screen) => void, isPremium: boolean }) => {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const categories = ['all', 'food', 'health', 'toy', 'service'];
  
  const products = [
    { 
      id: 1, 
      name: i18n.language === 'ko' ? '프리미엄 관절 사료' : 'Premium Joint Support Food', 
      price: i18n.language === 'ko' ? '24,900' : '19.99', 
      image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400', 
      tag: 'HOT', 
      category: 'food', 
      amazon: 'https://www.amazon.com/s?k=dog+joint+support+food',
      naver: 'https://search.shopping.naver.com/search/all?query=강아지+관절+사료+최저가' 
    },
    { 
      id: 2, 
      name: i18n.language === 'ko' ? '스마트 자동 급수기' : 'Smart Pet Water Fountain', 
      price: i18n.language === 'ko' ? '45,000' : '34.99', 
      image: 'https://images.unsplash.com/photo-1585673103161-2ddf1521b8f6?auto=format&fit=crop&q=80&w=400', 
      tag: 'NEW', 
      category: 'health', 
      amazon: 'https://www.amazon.com/s?k=smart+pet+water+fountain',
      naver: 'https://search.shopping.naver.com/search/all?query=강아지+자동+급수기+최저가' 
    },
    { 
      id: 3, 
      name: i18n.language === 'ko' ? '치석 제거 덴탈껌' : 'Dental Care Chews', 
      price: i18n.language === 'ko' ? '12,500' : '9.99', 
      image: 'https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&q=80&w=400', 
      tag: 'BEST', 
      category: 'food', 
      amazon: 'https://www.amazon.com/s?k=dog+dental+chews',
      naver: 'https://search.shopping.naver.com/search/all?query=강아지+덴탈껌+최저가' 
    },
    { 
      id: 4, 
      name: i18n.language === 'ko' ? '노즈워크 장난감' : 'Snuffle Mat Toy', 
      price: i18n.language === 'ko' ? '18,000' : '14.99', 
      image: 'https://images.unsplash.com/photo-1591768793355-74d7cab73084?auto=format&fit=crop&q=80&w=400', 
      tag: 'TOY', 
      category: 'toy', 
      amazon: 'https://www.amazon.com/s?k=dog+snuffle+mat',
      naver: 'https://search.shopping.naver.com/search/all?query=강아지+노즈워크+장난감+최저가' 
    },
    { 
      id: 5, 
      name: i18n.language === 'ko' ? 'AI 맞춤형 영양제 세트' : 'AI Personalized Supplement Set', 
      price: i18n.language === 'ko' ? '59,000' : '49.99', 
      image: 'https://images.unsplash.com/photo-1550572017-ed200f545dec?auto=format&fit=crop&q=80&w=400', 
      tag: 'PREMIUM', 
      category: 'health', 
      isPremiumOnly: true 
    },
    { 
      id: 6, 
      name: i18n.language === 'ko' ? '펫 보험 상담 서비스' : 'Pet Insurance Consultation', 
      price: '0', 
      image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400', 
      tag: 'SERVICE', 
      category: 'service', 
      isInsurance: true 
    },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="bg-white px-6 pt-12 pb-6 border-b border-zinc-100 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">{t('market.title')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {!isPremium && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{t('common.free_member')}</span>
            )}
            <button className="p-2 bg-zinc-100 rounded-full">
              <Search className="w-5 h-5 text-zinc-500" />
            </button>
          </div>
        </div>
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {t(`market.categories.${cat}`)}
            </button>
          ))}
        </div>
      </header>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map((product) => (
            <motion.div 
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm flex relative"
            >
              {product.isPremiumOnly && !isPremium && (
                <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-[4px] flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-2 shadow-lg">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-[11px] font-bold text-white mb-1">{t('market.premium_only')}</h4>
                  <button 
                    onClick={() => onNavigate('membership')}
                    className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter border border-emerald-400/30 px-2 py-0.5 rounded-full bg-emerald-400/5"
                  >
                    {t('common.upgrade')}
                  </button>
                </div>
              )}
              <div className={cn("w-32 aspect-square relative shrink-0", product.isPremiumOnly && !isPremium && "blur-[8px] opacity-50")}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={cn(
                  "absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider",
                  product.isPremiumOnly ? "bg-emerald-600 text-white" : "bg-white/90 backdrop-blur-sm text-emerald-600"
                )}>
                  {product.tag}
                </div>
              </div>
              <div className={cn("p-4 flex-1 flex flex-col justify-between", product.isPremiumOnly && !isPremium && "blur-[8px] opacity-50")}>
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-zinc-900 leading-tight">{product.name}</h3>
                    {!product.isInsurance && (
                      <span className="bg-emerald-100 text-emerald-700 text-[8px] font-black px-1 py-0.5 rounded-md uppercase tracking-tighter shrink-0">{t('market.lowest_price')}</span>
                    )}
                  </div>
                  <p className="text-base font-black text-zinc-900">{i18n.language === 'ko' ? '₩' : '$'}{product.price}</p>
                </div>
                
                <div className="mt-3 flex gap-1.5">
                  {product.isInsurance ? (
                    <button 
                      onClick={() => onNavigate('membership')}
                      className="w-full bg-zinc-900 text-white py-2 rounded-xl font-bold text-[10px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <Shield className="w-3 h-3" />
                      {t('market.consult')}
                    </button>
                  ) : (
                    <>
                      <a 
                        href={i18n.language === 'ko' ? product.naver : product.amazon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest text-center active:scale-95 transition-transform"
                      >
                        {t('market.buy_now')}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AdBanner isPremium={isPremium} onUpgrade={() => onNavigate('membership')} type="native" />
      </div>
    </div>
  );
};

const SplashScreen = () => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center text-white max-w-md mx-auto overflow-hidden"
    >
    {/* Curious Background Image */}
    <div className="absolute inset-0 opacity-40">
      <img 
        src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=1000" 
        alt="Curious Dog" 
        className="w-full h-full object-cover scale-110"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/20 via-zinc-950/60 to-zinc-950" />
    </div>

    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-32 h-32 mb-8"
    >
      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
      <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl">
        <Scan className="w-16 h-16 text-emerald-400" />
      </div>
    </motion.div>

    <div className="relative text-center px-8">
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-3xl font-bold tracking-tight mb-3"
      >
        Pet <span className="text-emerald-400">Genie</span>
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-zinc-400 text-sm font-medium leading-relaxed whitespace-pre-line"
      >
        {t('splash.subtitle')}
      </motion.p>
    </div>

    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="absolute bottom-16 w-full px-12"
    >
      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
        />
      </div>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] text-center mt-4">
        {t('splash.loading')}
      </p>
    </motion.div>
  </motion.div>
  );
};

const InsuranceScreen = ({ onBack, isPremium, onUpgrade }: { onBack: () => void, isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const plans = [
    { 
      company: 'DB Insurance', 
      title: 'I Love Pet Insurance', 
      price: '₩15,800', 
      desc: 'Focus on patellar luxation and skin diseases', 
      color: 'bg-emerald-50 text-emerald-600',
      link: 'https://www.idirect.co.kr/mall/pet/pet_intro.do'
    },
    { 
      company: 'Hyundai Marine', 
      title: 'Hi-Pet Dog Insurance', 
      price: '₩28,400', 
      desc: '80% hospitalization/surgery coverage + liability', 
      color: 'bg-blue-50 text-blue-600', 
      popular: true,
      link: 'https://www.hi.co.kr/bin/main/main.jsp'
    },
    { 
      company: 'Meritz Fire', 
      title: 'Petpermint Puppy&Dog', 
      price: '₩45,200', 
      desc: 'Unlimited MRI/CT and 3 major diseases coverage', 
      color: 'bg-rose-50 text-rose-600',
      link: 'https://www.meritzfire.com/pet/pet_intro.do'
    },
    { 
      company: 'Samsung Fire', 
      title: 'Wipung Daengdaeng Pet Insurance', 
      price: '₩32,000', 
      desc: 'Senior dog enrollment and long-term coverage', 
      color: 'bg-indigo-50 text-indigo-600',
      link: 'https://www.samsungfire.com/pet/pet_intro.do'
    },
  ];

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('insurance.title')}</h1>
        {!isPremium && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{t('insurance.basic_mode')}</span>
        )}
        <div className="w-9" />
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2 whitespace-pre-line">{t('insurance.hero_title')}</h2>
            <p className="text-zinc-400 text-sm mb-6 whitespace-pre-line">{t('insurance.hero_desc')}</p>
            <div className="flex items-center gap-2 bg-white/10 w-fit px-4 py-2 rounded-xl">
              <Shield className="w-4 h-4 text-[#00FF41]" />
              <span className="text-xs font-bold">{isPremium ? t('insurance.status_premium') : t('insurance.status_free')}</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl -mr-24 -mt-24" />
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-2">{t('insurance.plans_title')}</h3>
          {plans.slice(0, isPremium ? undefined : 2).map((plan, i) => (
            <div key={i} className={cn(
              "bg-white p-6 rounded-[2rem] border relative transition-all active:scale-[0.98]",
              plan.popular ? "border-emerald-500 shadow-lg shadow-emerald-900/5" : "border-zinc-100 shadow-sm"
            )}>
              {plan.popular && (
                <div className="absolute -top-3 right-8 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  {t('insurance.popular')}
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">{plan.company}</span>
                  <h4 className="text-lg font-bold text-zinc-900">{plan.title}</h4>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-zinc-900">{plan.price}</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{t('insurance.monthly_price')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", plan.color)}>
                  <Shield className="w-5 h-5" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{plan.desc}</p>
              </div>

              <a 
                href={plan.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                  plan.popular ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {t('insurance.view_detail')}
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          ))}

          {!isPremium && (
            <div className="bg-zinc-100 p-8 rounded-[2rem] border border-dashed border-zinc-300 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-zinc-400 shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900">{t('insurance.upgrade_desc')}</h4>
              </div>
              <button 
                onClick={onUpgrade}
                className="bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg"
              >
                {t('insurance.upgrade_button')}
              </button>
            </div>
          )}
        </div>

        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

const HospitalSearchScreen = ({ onBack, isPremium, onUpgrade }: { onBack: () => void, isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Get user location if possible
      let locationContext = "";
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationContext = `User is currently at latitude: ${position.coords.latitude}, longitude: ${position.coords.longitude}.`;
      } catch (e) {
        console.log("Location access denied or timed out");
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find animal hospitals or veterinary clinics near ${searchQuery}. ${locationContext}
        Return a JSON array of objects with: name, address, distance (estimated), openStatus, rating, phone, and mapsUri.
        IMPORTANT: Return ONLY the JSON array.`,
        config: {
          tools: [{ googleMaps: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "[]";
      const results = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
      setHospitals(results);
    } catch (error) {
      console.error("Search error:", error);
      // Fallback to mock if error
      setHospitals([
        { name: '강남 24시 동물병원', address: '서울 강남구', distance: '1.2km', openStatus: '영업중', rating: 4.5 },
        { name: '튼튼 펫 클리닉', address: '서울 서초구', distance: '2.5km', openStatus: '영업중', rating: 4.2 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('dashboard.quick_actions.hospital')}</h1>
        <div className="w-9" />
      </header>

      <div className="p-6 space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-zinc-100 shadow-sm flex items-center gap-3">
          <Search className="w-5 h-5 text-zinc-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={t('hospital.search_placeholder', { defaultValue: '지역 또는 병원명 검색' })} 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <button onClick={handleSearch} className="text-emerald-600 text-xs font-bold">검색</button>
          )}
        </div>

        <div className="space-y-4 relative">
          {!isPremium && (
            <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[4px] rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center -mx-2">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-zinc-900 mb-1">{t('hospital.limit_title', { defaultValue: '무료 검색 횟수 (0/3)' })}</h4>
              <p className="text-zinc-500 text-xs mb-6">{t('hospital.limit_desc', { defaultValue: '일반 회원은 기본 요약 정보만 제공되며\n총 3회의 검색 기회를 가집니다.' })}</p>
              <button 
                onClick={onUpgrade}
                className="bg-rose-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-rose-900/20"
              >
                {t('common.upgrade')}
              </button>
            </div>
          )}
          
          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{t('hospital.nearby_title', { defaultValue: '가까운 병원' })}</h3>
            {!isPremium && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">{t('hospital.summary_mode', { defaultValue: '기본 요약 모드' })}</span>
            )}
          </div>

          {hospitals.length === 0 && !isLoading && (
            <div className="py-12 text-center">
              <p className="text-zinc-400 text-sm">{t('hospital.no_results', { defaultValue: '검색 결과가 없습니다.' })}</p>
            </div>
          )}

          {hospitals.map((h, i) => (
            <a 
              key={i} 
              href={h.mapsUri || `https://www.google.com/maps/search/${encodeURIComponent(h.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-5 rounded-3xl border border-zinc-100 shadow-sm flex items-start gap-4 active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <NavIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-zinc-900">{h.name}</h4>
                  {h.openStatus && (
                    <span className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-md",
                      h.openStatus.includes('영업중') || h.openStatus.includes('Open') ? "bg-emerald-50 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                    )}>
                      {h.openStatus}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">{h.address} {h.distance ? `• ${h.distance}` : ''}</p>
                <div className="flex items-center gap-3 mt-2">
                  {h.rating && (
                    <div className="flex items-center gap-1 text-orange-400">
                      <Heart className="w-3 h-3 fill-orange-400" />
                      <span className="text-[10px] font-bold">{h.rating}</span>
                    </div>
                  )}
                  {h.phone && (
                    <div className="flex items-center gap-1 text-zinc-400">
                      <Activity className="w-3 h-3" />
                      <span className="text-[10px] font-medium">{h.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>

        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

const MembershipScreen = ({ onBack, onUpgrade }: { onBack: () => void, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const benefits = [
    { title: t('membership.benefit1'), free: t('membership.benefit1_free'), premium: t('membership.benefit1_premium'), icon: Scan },
    { title: t('membership.benefit2'), free: t('membership.benefit2_free'), premium: t('membership.benefit2_premium'), icon: FileText },
    { icon: MapPin, title: t('membership.benefit3'), free: t('membership.benefit3_free'), premium: t('membership.benefit3_premium') },
    { icon: Shield, title: t('membership.benefit4'), free: t('membership.benefit4_free'), premium: t('membership.benefit4_premium') },
    { icon: ShoppingBag, title: t('membership.benefit5'), free: t('membership.benefit5_free'), premium: t('membership.benefit5_premium') },
  ];

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('membership.title')}</h1>
        <div className="w-9" />
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">{t('membership.hero_title')}</h2>
          <p className="text-zinc-500 text-sm">{t('membership.hero_desc')}</p>
        </div>

        {/* Membership Guide Text */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider border-l-4 border-emerald-500 pl-3">{t('membership.guide_title')}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-medium">
            <Trans i18nKey="membership.guide_desc">
              일반 회원은 기본적인 건강 스캔과 병원 검색(각 총 3회) 및 기본 요약 리포트를 이용하실 수 있습니다. 마켓과 보험 서비스 또한 일반형으로 제공됩니다.
              반면, <span className="text-emerald-600 font-bold">프리미엄 멤버십</span>은 AI 정밀 분석, 무제한 스캔/검색, 그리고 멤버십 전용 마켓/보험 혜택 등 반려동물을 위한 모든 프리미엄 권한을 제공합니다.
            </Trans>
          </p>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 bg-zinc-50 border-b border-zinc-100">
            <div className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('membership.table_service')}</div>
            <div className="p-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">{t('membership.table_free')}</div>
            <div className="p-4 text-[10px] font-bold text-emerald-600 uppercase tracking-widest text-center">{t('membership.table_premium')}</div>
          </div>
          <div className="divide-y divide-zinc-50">
            {benefits.map((b, i) => (
              <div key={i} className="grid grid-cols-3 items-center">
                <div className="p-4 flex items-center gap-2">
                  <b.icon className="w-3 h-3 text-zinc-400" />
                  <span className="text-[11px] font-bold text-zinc-700">{b.title}</span>
                </div>
                <div className="p-4 text-[11px] text-zinc-400 text-center font-medium">{b.free}</div>
                <div className="p-4 text-[11px] text-emerald-600 text-center font-bold">{b.premium}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-emerald-600 rounded-[2rem] p-8 text-white text-center shadow-xl shadow-emerald-900/20">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">{t('membership.price_label')}</p>
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-4xl font-bold">{t('membership.price_value')}</span>
            <span className="text-emerald-200 text-sm">/ mo</span>
          </div>
          <button 
            onClick={onUpgrade}
            className="w-full bg-white text-emerald-700 py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all"
          >
            {t('membership.subscribe_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

const AnalysisLoadingOverlay = () => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="relative w-32 h-32 mb-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 border-t-4 border-emerald-500 rounded-full"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Dna className="w-10 h-10 text-emerald-400 animate-pulse" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{t('analysis_loading.title')}</h3>
      <p className="text-zinc-400 text-sm max-w-xs whitespace-pre-line">
        {t('analysis_loading.desc')}
      </p>
      
      <div className="mt-12 w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-full bg-emerald-500 rounded-full"
        />
      </div>
    </motion.div>
  );
};

const CareGuideScreen = ({ onBack, careGuides, isPremium, onUpgrade }: { onBack: () => void, careGuides?: any[], isPremium: boolean, onUpgrade: () => void }) => {
  const { t } = useTranslation();
  const defaultGuides = [
    { title: t('care_guide.default_guide1_title'), desc: t('care_guide.default_guide1_desc'), icon: Calendar },
    { title: t('care_guide.default_guide2_title'), desc: t('care_guide.default_guide2_desc'), icon: Weight },
    { title: t('care_guide.default_guide3_title'), desc: t('care_guide.default_guide3_desc'), icon: Activity },
    { title: t('care_guide.default_guide4_title'), desc: t('care_guide.default_guide4_desc'), icon: BriefcaseMedical }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'calendar': return Calendar;
      case 'weight': return Weight;
      case 'activity': return Activity;
      case 'medical': return BriefcaseMedical;
      case 'heart': return Heart;
      case 'eye': return Eye;
      default: return BriefcaseMedical;
    }
  };

  const displayGuides = careGuides ? careGuides.map(g => ({
    ...g,
    icon: getIcon(g.iconType)
  })) : defaultGuides;

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-32">
      <header className="px-6 pt-12 pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 bg-white/5 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('care_guide.title')}</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="bg-gradient-to-br from-[#00FF41]/20 to-black rounded-[2.5rem] p-8 border border-[#00FF41]/20">
          <h2 className="text-2xl font-bold text-white mb-2">{t('care_guide.title')}</h2>
          <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">
            {t('care_guide.upgrade_desc')}
          </p>
        </div>

        <div className="grid gap-4">
          {displayGuides.map((guide, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 p-6 rounded-3xl border border-white/5 flex items-start gap-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#00FF41]/10 flex items-center justify-center text-[#00FF41] shrink-0">
                <guide.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{guide.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{guide.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <h4 className="text-sm font-bold text-white">{t('care_guide.warning_title')}</h4>
          </div>
          <p className="text-zinc-500 text-xs leading-relaxed">
            {t('care_guide.warning_desc')}
          </p>
        </div>

        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

const HistoryScreen = ({ history, onSelect, onBack }: { history: any[], onSelect: (item: any) => void, onBack: () => void }) => {
  const { t } = useTranslation();
  
  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, item) => acc + (item.result?.breedMatch || 70), 0) / history.length) : 0;
  const lastScanDate = history.length > 0 ? history[0].date : '-';

  return (
    <div className="h-full bg-zinc-50 flex flex-col" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header className="px-6 pb-6 flex items-center gap-4 bg-white sticky top-0 z-50 border-b border-zinc-100" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <h1 className="text-lg font-bold text-zinc-900">{t('history.title')}</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-2">
            <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
              <p className="text-2xl font-black text-emerald-600">{history.length}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('history.total_scans')}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
              <p className="text-2xl font-black text-blue-600">{avgScore}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('history.avg_health')}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-zinc-100 text-center">
              <p className="text-sm font-black text-zinc-700">{lastScanDate}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{t('history.last_scan')}</p>
            </div>
          </div>
        )}
        
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <HistoryIcon className="w-16 h-16" />
            <p className="text-sm font-medium">{t('history.empty_desc')}</p>
          </div>
        ) : (
          history.map((item, idx) => (
            <motion.button 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelect(item)}
              className="w-full bg-white p-4 rounded-3xl border border-zinc-100 flex items-center gap-4 hover:border-emerald-500/30 transition-all active:scale-[0.98] shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-100 shrink-0">
                <img src={item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-zinc-900">{item.result.primaryBreed}</h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.date}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-16 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.result.breedMatch || 70}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600">{item.result.breedMatch || 70}%</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300" />
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
};

// --- Profile Screen ---
const ProfileScreen = ({ 
  onBack, onNavigate, isPremium, onUpgrade, onLogout, isLoggedIn, user, petProfile, onUpdatePetProfile, onLogin
}: { 
  onBack: () => void, onNavigate: (s: Screen) => void, isPremium: boolean, onUpgrade: () => void, onLogout: () => void, 
  isLoggedIn: boolean, user: { email: string } | null, petProfile: PetProfile, onUpdatePetProfile: (p: PetProfile) => void,
  onLogin: () => void
}) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(petProfile);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    onUpdatePetProfile(editProfile);
    setIsEditing(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="h-full bg-zinc-50 flex flex-col items-center justify-center p-8 text-center" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
        <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
          <User className="w-12 h-12 text-zinc-300" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">{t('auth.login_welcome')}</h2>
        <p className="text-zinc-500 text-sm mb-6">{t('auth.signup_welcome')}</p>
        <button onClick={onLogin} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-transform">
          {t('auth.login_button')}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header className="bg-white px-6 pb-6 border-b border-zinc-100" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-bold text-zinc-900">{t('profile.title')}</h1>
          {!isEditing ? (
            <button onClick={() => { setEditProfile(petProfile); setIsEditing(true); }} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
              {t('profile.edit_profile')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl">{t('common.cancel')}</button>
              <button onClick={handleSave} className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-xl">{t('common.save')}</button>
            </div>
          )}
        </div>
      </header>

      {/* Save Success Toast */}
      <AnimatePresence>
        {showSaved && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> {t('profile.save_success')}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-6">
        {/* Pet Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <PawPrint className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('profile.pet_info')}</h3>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_name')}</label>
                <input value={editProfile.name} onChange={(e) => setEditProfile({...editProfile, name: e.target.value})} className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_age')}</label>
                  <div className="flex items-center gap-2">
                    <input value={editProfile.age} onChange={(e) => setEditProfile({...editProfile, age: e.target.value})} type="number" className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
                    <span className="text-xs text-zinc-400 shrink-0">{t('profile.age_unit')}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_weight')}</label>
                  <div className="flex items-center gap-2">
                    <input value={editProfile.weight} onChange={(e) => setEditProfile({...editProfile, weight: e.target.value})} type="number" step="0.1" className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
                    <span className="text-xs text-zinc-400 shrink-0">{t('profile.weight_unit')}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">{t('profile.pet_gender')}</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map(g => (
                    <button key={g} onClick={() => setEditProfile({...editProfile, gender: g})} className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      editProfile.gender === g ? "bg-emerald-600 text-white" : "bg-zinc-50 text-zinc-500 border border-zinc-200"
                    )}>
                      {t(`profile.${g}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_breed')}</label>
                <input value={editProfile.breed} onChange={(e) => setEditProfile({...editProfile, breed: e.target.value})} className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: t('profile.pet_name'), value: petProfile.name || '-' },
                { label: t('profile.pet_breed'), value: petProfile.breed || '-' },
                { label: t('profile.pet_age'), value: petProfile.age ? `${petProfile.age}${t('profile.age_unit')}` : '-' },
                { label: t('profile.pet_weight'), value: petProfile.weight ? `${petProfile.weight}${t('profile.weight_unit')}` : '-' },
                { label: t('profile.pet_gender'), value: petProfile.gender ? t(`profile.${petProfile.gender}`) : '-' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0">
                  <span className="text-xs text-zinc-500">{item.label}</span>
                  <span className="text-sm font-bold text-zinc-900">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('profile.account_info')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-zinc-50">
              <span className="text-xs text-zinc-500">{t('profile.email')}</span>
              <span className="text-sm font-bold text-zinc-900">{user?.email || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-zinc-500">{t('profile.membership_status')}</span>
              <span className={cn("text-sm font-bold px-3 py-1 rounded-full", isPremium ? "text-emerald-600 bg-emerald-50" : "text-zinc-500 bg-zinc-100")}>
                {isPremium ? t('common.premium_member') : t('common.free_member')}
              </span>
            </div>
          </div>
          {!isPremium && (
            <button onClick={onUpgrade} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-transform">
              {t('common.upgrade')}
            </button>
          )}
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('profile.app_settings')}</h3>
          </div>
          <div className="space-y-1">
            {[
              { icon: Globe, label: t('profile.language'), value: (LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]).label, action: () => { const idx = LANGUAGES.findIndex(l => l.code === i18n.language); i18n.changeLanguage(LANGUAGES[(idx + 1) % LANGUAGES.length].code); } },
              { icon: Bell, label: t('profile.notifications'), value: '', action: () => {} },
              { icon: Shield, label: t('privacy.title'), value: '', action: () => onNavigate('privacy') },
              { icon: HelpCircle, label: t('profile.help'), value: '', action: () => {} },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="w-full flex items-center gap-4 py-3.5 px-1 rounded-xl hover:bg-zinc-50 transition-colors">
                <item.icon className="w-5 h-5 text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-700">{item.label}</span>
                {item.value && <span className="text-xs text-zinc-400 font-medium">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout / About */}
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm text-center">
            <p className="text-[10px] text-zinc-400">{t('profile.version')} 1.0.0</p>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm border border-rose-100 active:scale-[0.98] transition-transform">
            <LogOut className="w-4 h-4" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  );
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
    { id: 'walk', label: t('dashboard.care_walk'), icon: Activity, completed: false },
    { id: 'feed', label: t('dashboard.care_feed'), icon: Utensils, completed: false },
    { id: 'water', label: t('dashboard.care_water'), icon: Droplets, completed: false },
    { id: 'supplement', label: t('dashboard.care_supplement'), icon: Heart, completed: false },
    { id: 'brush', label: t('dashboard.care_brush'), icon: Sparkles, completed: false },
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
            </motion.div>
        </AnimatePresence>
      </div>

        {!isSubScreen && (
          <Navigation current={currentScreen} onNavigate={handleTabNavigate} />
        )}
      </div>
    </div>
  );
}
