import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, Heart, Scan, ChevronRight, Activity, Weight, Calendar,
  AlertCircle, CheckCircle2, Shield, TrendingUp, Utensils, Moon, Clock, Droplets,
  Check, Sparkles, PawPrint, Bell, Sun, CloudRain, Thermometer, Dna, FileText, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Screen, PetProfile, CareItem } from '../../types';
import { CircularProgress, LanguageSwitcher, AdBanner } from '../common';
import { globalTranslate } from '../../utils/translateData';

const PetDashboard = ({ onDetail, onScan, onNavigate, isPremium, scanCount, analysisResult, capturedImage, onLogout, dailyCare, onToggleCare, petProfile }: { onDetail: () => void, onScan: () => void, onNavigate: (s: Screen) => void, isPremium: boolean, scanCount: number, analysisResult?: any, capturedImage?: string | null, onLogout: () => void, dailyCare: CareItem[], onToggleCare: (id: string) => void, petProfile: PetProfile }) => {
  const { t, i18n } = useTranslation();
  const isScanLimitReached = !isPremium && scanCount >= 3;

  const translateBreed = (breedName: string) => {
    return globalTranslate(breedName, i18n.language);
  };

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

        {/* 24/7 AI Vet Premium Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => isPremium ? onNavigate('ai-vet') : onNavigate('membership')}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/20"
        >
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-sm">{t('ai_vet.title')}</h4>
            <p className="text-white/70 text-[10px]">{isPremium ? t('ai_vet.welcome_msg').slice(0, 30) + '...' : t('dashboard.premium_banner.button')}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60" />
        </motion.div>

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
                  )}>{t(care.label)}</span>
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
                  <h2 className="text-4xl font-bold tracking-tight text-white">{translateBreed(analysisResult?.primaryBreed) || t('dashboard.default_breed')}</h2>
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
                  ? t('dashboard.scan_item.date_format', { year: '2026', month: '3', day: '4', time: '11:27 PM' })
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

export default PetDashboard;
