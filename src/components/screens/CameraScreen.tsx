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

export default CameraScreen;
