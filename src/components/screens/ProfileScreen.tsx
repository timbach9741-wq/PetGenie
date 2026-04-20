import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Settings, ChevronRight, CheckCircle2, Shield, User, Bell, PawPrint, LogOut, Globe, HelpCircle, Info, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Screen } from '../../types';
import type { PetProfile } from '../../types';
import packageJson from '../../../package.json';
const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
] as const;

// --- Profile Screen ---
const ProfileScreen = ({ 
  onBack, onNavigate, isPremium, onUpgrade, onLogout, isLoggedIn, user, petProfile, onUpdatePetProfile, onLogin
}: { 
  onBack: () => void, onNavigate: (s: Screen) => void, isPremium: boolean, onUpgrade: () => void, onLogout: () => void, 
  isLoggedIn: boolean, user: { email: string } | null, petProfile: PetProfile, onUpdatePetProfile: (p: PetProfile) => void,
  onLogin: () => void
}) => {
  const { t, i18n } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState(petProfile);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    onUpdatePetProfile(editProfile);
    setIsEditing(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="h-full bg-zinc-50 flex flex-col items-center justify-center p-8 text-center pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        <div className="w-24 h-24 rounded-full bg-zinc-100 flex items-center justify-center mb-6">
          <User className="w-12 h-12 text-zinc-300" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">{t('auth.login_welcome')}</h2>
        <p className="text-zinc-500 text-sm mb-6">{t('auth.signup_welcome')}</p>
        <button onClick={onLogin} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-transform">
          {t('auth.login_button')}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
      <header className="bg-white px-6 pb-6 border-b border-zinc-100 pt-[calc(env(safe-area-inset-top,0px)+44px)]">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              aria-label="뒤로가기"
              className="p-2 -ml-2 mr-1 text-zinc-900 hover:bg-zinc-100 rounded-full transition-transform active:scale-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-zinc-900">{t('profile.title')}</h1>
          </div>
          {!isEditing ? (
            <button onClick={() => { setEditProfile(petProfile); setIsEditing(true); }} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
              {t('profile.edit_profile')}
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl">{t('common.cancel')}</button>
              <button onClick={handleSave} className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-xl">{t('common.save')}</button>
            </div>
          )}
        </div>
      </header>

      {/* Save Success Toast */}
      <AnimatePresence>
        {showSaved && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> {t('profile.save_success')}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 space-y-6">
        {/* Pet Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <PawPrint className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('profile.pet_info')}</h3>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_name')}</label>
                <input title={t('profile.pet_name')} placeholder={t('profile.pet_name')} value={editProfile.name} onChange={(e) => setEditProfile({...editProfile, name: e.target.value})} className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_age')}</label>
                  <div className="flex items-center gap-2">
                    <input title={t('profile.pet_age')} placeholder={t('profile.pet_age')} value={editProfile.age} onChange={(e) => setEditProfile({...editProfile, age: e.target.value})} type="number" className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
                    <span className="text-xs text-zinc-400 shrink-0">{t('profile.age_unit')}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_weight')}</label>
                  <div className="flex items-center gap-2">
                    <input title={t('profile.pet_weight')} placeholder={t('profile.pet_weight')} value={editProfile.weight} onChange={(e) => setEditProfile({...editProfile, weight: e.target.value})} type="number" step="0.1" className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
                    <span className="text-xs text-zinc-400 shrink-0">{t('profile.weight_unit')}</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 block">{t('profile.pet_gender')}</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map(g => (
                    <button key={g} onClick={() => setEditProfile({...editProfile, gender: g})} className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
                      editProfile.gender === g ? "bg-emerald-600 text-white" : "bg-zinc-50 text-zinc-500 border border-zinc-200"
                    )}>
                      {t(`profile.${g}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 block">{t('profile.pet_breed')}</label>
                <input title={t('profile.pet_breed')} placeholder={t('profile.pet_breed')} value={editProfile.breed} onChange={(e) => setEditProfile({...editProfile, breed: e.target.value})} className="w-full bg-zinc-50 rounded-xl px-4 py-3 text-sm border border-zinc-200 focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: t('profile.pet_name'), value: petProfile.name || '-' },
                { label: t('profile.pet_breed'), value: petProfile.breed || '-' },
                { label: t('profile.pet_age'), value: petProfile.age ? `${petProfile.age}${t('profile.age_unit')}` : '-' },
                { label: t('profile.pet_weight'), value: petProfile.weight ? `${petProfile.weight}${t('profile.weight_unit')}` : '-' },
                { label: t('profile.pet_gender'), value: petProfile.gender ? t(`profile.${petProfile.gender}`) : '-' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-zinc-50 last:border-0">
                  <span className="text-xs text-zinc-500">{item.label}</span>
                  <span className="text-sm font-bold text-zinc-900">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('profile.account_info')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-zinc-50">
              <span className="text-xs text-zinc-500">{t('profile.email')}</span>
              <span className="text-sm font-bold text-zinc-900">{user?.email || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-zinc-500">{t('profile.membership_status')}</span>
              <span className={cn("text-sm font-bold px-3 py-1 rounded-full", isPremium ? "text-emerald-600 bg-emerald-50" : "text-zinc-500 bg-zinc-100")}>
                {isPremium ? t('common.premium_member') : t('common.free_member')}
              </span>
            </div>
          </div>
          {!isPremium && (
            <button onClick={onUpgrade} className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-transform">
              {t('common.upgrade')}
            </button>
          )}
        </div>

        {/* App Settings */}
        <div className="bg-white rounded-3xl p-6 border border-zinc-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Settings className="w-4 h-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{t('profile.app_settings')}</h3>
          </div>
          <div className="space-y-1">
            {user?.email === 'timbach@naver.com' && (
              <button onClick={() => onNavigate('admin')} className="w-full flex items-center gap-4 py-3.5 px-1 rounded-xl hover:bg-emerald-50 transition-colors">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span className="flex-1 text-left text-sm font-bold text-emerald-600">{t('profile.admin_dashboard', 'Admin Dashboard')}</span>
                <ChevronRight className="w-4 h-4 text-emerald-300" />
              </button>
            )}
            {[
              { icon: Globe, label: t('profile.language'), value: (LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]).label, action: () => { const idx = LANGUAGES.findIndex(l => l.code === i18n.language); i18n.changeLanguage(LANGUAGES[(idx + 1) % LANGUAGES.length].code); } },
              { icon: Bell, label: t('profile.notifications'), value: '', action: () => {} },
              { icon: Shield, label: t('privacy.title'), value: '', action: () => onNavigate('privacy') },
              { icon: HelpCircle, label: t('profile.help'), value: '', action: () => {} },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="w-full flex items-center gap-4 py-3.5 px-1 rounded-xl hover:bg-zinc-50 transition-colors">
                <item.icon className="w-5 h-5 text-zinc-400" />
                <span className="flex-1 text-left text-sm text-zinc-700">{item.label}</span>
                {item.value && <span className="text-xs text-zinc-400 font-medium">{item.value}</span>}
                <ChevronRight className="w-4 h-4 text-zinc-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout / About */}
        <div className="space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-zinc-100 shadow-sm text-center">
            <p className="text-[10px] text-zinc-400">{t('profile.version')} {packageJson.version}</p>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 rounded-2xl font-bold text-sm border border-rose-100 active:scale-[0.98] transition-transform">
            <LogOut className="w-4 h-4" />
            {t('common.logout')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
