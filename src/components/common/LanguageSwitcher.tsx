import React, { useState, useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';


// --- Language Switcher (4 Languages) ---
const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', short: 'KO' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼', short: 'TW' },
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

export default LanguageSwitcher;
