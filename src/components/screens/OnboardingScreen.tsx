import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Heart, Scan, ArrowRight, Shield, Dna } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LanguageSwitcher from '../common/LanguageSwitcher';


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

  // App.tsx의 FREE_FOR_ALL_END_DATE와 동일한 값이어야 함
  const FREE_FOR_ALL_END_DATE = new Date('2027-01-01T00:00:00');
  const showFreeForAllBadge = new Date() < FREE_FOR_ALL_END_DATE;

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

      {/* === Free-For-All Promo Badge === */}
      {showFreeForAllBadge && (
        <div className="relative z-20 flex justify-center px-6 mt-2">
          <div
            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(20px)',
            }}
          >
            🎉 {t('onboarding.free_for_all_badge', '런칭 기념, 지금은 프리미엄 전체 기능 무료')}
          </div>
        </div>
      )}

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

export default OnboardingScreen;
