import { useTranslation, Trans } from 'react-i18next';
import { Dna } from 'lucide-react';
import { motion } from 'motion/react';


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

export default AnalysisLoadingOverlay;
