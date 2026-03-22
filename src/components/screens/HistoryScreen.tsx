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

export default HistoryScreen;
