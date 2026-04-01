import { useTranslation, Trans } from 'react-i18next';
import { Heart, Activity, Weight, Calendar, AlertCircle, ArrowLeft, BriefcaseMedical, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import AdBanner from '../common/AdBanner';
import DrSilvermanHeader from '../common/DrSilvermanHeader';


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
      <DrSilvermanHeader />

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

export default CareGuideScreen;
