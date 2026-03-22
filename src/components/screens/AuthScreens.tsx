import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scan } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginScreen = ({ onLogin, onNavigateToSignUp }: { onLogin: (email: string) => void, onNavigateToSignUp: () => void }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) onLogin(email);
  };

  const handleSocialLogin = (provider: string) => onLogin(`${provider}@user.com`);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-0 h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-white z-50 overflow-y-auto no-scrollbar"
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <Scan className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('auth.login_title')}</h1>
          <p className="text-zinc-500 text-sm mt-2">{t('auth.login_welcome')}</p>
        </div>

        <div className="space-y-3">
          <button onClick={() => handleSocialLogin('google')} className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] shadow-lg">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google_login')}
          </button>
          <button onClick={() => handleSocialLogin('apple')} className="w-full flex items-center justify-center gap-3 bg-white/10 text-white py-4 rounded-2xl font-bold text-sm border border-white/10 transition-all active:scale-[0.98]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {t('auth.apple_login')}
          </button>
          <button onClick={() => handleSocialLogin('kakao')} className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#191919] py-4 rounded-2xl font-bold text-sm transition-all active:scale-[0.98]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#191919">
              <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.67 1.77 5.02 4.44 6.38l-1.13 4.12 4.78-3.15c.6.08 1.24.15 1.91.15 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
            </svg>
            {t('auth.kakao_login')}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('auth.or_continue')}</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('auth.email_label')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="example@email.com" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('auth.password_label')}</label>
              <button type="button" className="text-[10px] text-emerald-400 font-bold hover:underline">{t('auth.forgot_password')}</button>
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]">
            {t('auth.login_button')}
          </button>
        </form>

        <div className="text-center">
          <button onClick={onNavigateToSignUp} className="text-zinc-500 text-xs hover:text-white transition-colors">
            {t('auth.no_account')} <span className="text-emerald-400 font-bold">{t('auth.signup_link')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export const SignUpScreen = ({ onSignUp, onNavigateToLogin }: { onSignUp: (email: string) => void, onNavigateToLogin: () => void }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password && password === confirmPassword) {
      onSignUp(email);
    } else if (password !== confirmPassword) {
      alert(t('auth.password_mismatch'));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-0 h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-white z-50"
    >
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <Scan className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('auth.signup_title')}</h1>
          <p className="text-zinc-500 text-sm mt-2">{t('auth.signup_welcome')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('auth.email_label')}</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="example@email.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('auth.password_label')}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="••••••••" required />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">{t('auth.password_confirm_label')}</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all" placeholder="••••••••" required />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]">
            {t('auth.signup_button')}
          </button>
        </form>

        <div className="text-center">
          <button onClick={onNavigateToLogin} className="text-zinc-500 text-xs hover:text-white transition-colors">
            {t('auth.has_account')} <span className="text-emerald-400 font-bold">{t('auth.login_link')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
