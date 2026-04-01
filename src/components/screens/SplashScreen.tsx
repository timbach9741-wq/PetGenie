import { useTranslation } from 'react-i18next';
import { Scan, Dna } from 'lucide-react';
import { motion } from 'motion/react';
import logoSrc from '../../assets/pet_genie_logo.png';

export const SplashScreen = () => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-zinc-950 flex flex-col items-center justify-center text-white max-w-md mx-auto overflow-hidden"
    >
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
      <div className="relative w-full h-full bg-white/10 backdrop-blur-xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl p-2">
        <img src={logoSrc} alt="Pet Genie Logo" className="w-full h-full rounded-[2rem] object-cover" />
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

export const AnalysisLoadingOverlay = () => {
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
