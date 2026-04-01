import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from 'react';
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
import { Screen, PetProfile, CareItem } from '../../types';
import { CircularProgress, LanguageSwitcher, Navigation, AdBanner, StatusBar } from '../common';


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

export default InsuranceScreen;
