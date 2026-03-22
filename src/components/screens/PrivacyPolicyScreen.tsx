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
import { GoogleGenAI } from "@google/genai";
import { Screen, PetProfile, CareItem } from '../../types';
import { CircularProgress, LanguageSwitcher, Navigation, AdBanner, StatusBar } from '../common';


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

export default PrivacyPolicyScreen;
