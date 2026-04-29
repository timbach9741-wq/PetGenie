import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Scan } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

// 실제 운영 환경의 법적 고지 페이지 주소
export const TERMS_OF_SERVICE_URL = "https://dandy-prose-390.notion.site/Pet-Genie-Privacy-Policy-33001a34a2ba80edb9d5c7d121135e9c"; // TODO: 실제 이용약관 주소로 변경 필요
export const PRIVACY_POLICY_URL = "https://dandy-prose-390.notion.site/Pet-Genie-Privacy-Policy-33001a34a2ba80edb9d5c7d121135e9c";

export const LoginScreen = ({ onLogin, onNavigateToSignUp }: { onLogin: (email: string, uid: string, agreeMarketing: boolean) => void, onNavigateToSignUp: () => void }) => {
  const { t } = useTranslation();
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const isAllAgreed = agreeTerms && agreeMarketing;

  const handleAgreeAll = (checked: boolean) => {
    setAgreeTerms(checked);
    setAgreeMarketing(checked);
  };

  const handleGoogleLogin = async () => {
    if (!agreeTerms) {
      alert(t('auth.terms_required', '서비스 이용을 위해 필수 약관에 동의해주세요.'));
      return;
    }
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await FirebaseAuthentication.signInWithGoogle();
        if (result.user?.email && result.user?.uid) {
          onLogin(result.user.email, result.user.uid, agreeMarketing);
        } else {
          alert('구글 로그인에 실패했습니다. (이메일 또는 UID 정보 없음)');
        }
      } else {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user?.email && result.user?.uid) {
          onLogin(result.user.email, result.user.uid, agreeMarketing);
        } else {
          alert(t('auth.login_failed') || '로그인에 실패했습니다. (이메일 없음)');
        }
      }
    } catch (error: any) {
      console.error("Google Auth Error", error);
      alert(t('auth.login_failed') || `구글 로그인 중 에러가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="absolute inset-0 h-full bg-zinc-950 flex flex-col items-center justify-center p-8 text-white z-50 overflow-y-auto no-scrollbar"
    >
      <div className="w-full max-w-sm space-y-10">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <Scan className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('auth.login_title')}</h1>
          <p className="text-zinc-500 text-sm mt-2">{t('auth.login_welcome')}</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            {/* 전체 동의 */}
            <div className="flex items-start gap-3 pb-4 border-b border-white/10">
              <input 
                type="checkbox" 
                id="agree-all-login"
                checked={isAllAgreed}
                onChange={(e) => handleAgreeAll(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
              />
              <label htmlFor="agree-all-login" className="text-sm font-bold text-white leading-tight cursor-pointer">
                {t('auth.agree_all', '전체 약관에 동의합니다.')}
              </label>
            </div>

            {/* 필수 약관 동의 */}
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms-consent-login"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
              />
              <label htmlFor="terms-consent-login" className="text-xs text-zinc-300 leading-tight cursor-pointer">
                <span className="text-emerald-400 font-bold">[{t('auth.required', '필수')}]</span>{' '}
                <a href={TERMS_OF_SERVICE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 transition-colors" onClick={(e) => e.stopPropagation()}>{t('auth.terms_link', '이용약관')}</a> {t('auth.terms_and', '및')} <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 transition-colors" onClick={(e) => e.stopPropagation()}>{t('auth.privacy_link', '개인정보 처리방침')}</a> {t('auth.consent', '동의')}
              </label>
            </div>

            {/* 선택 마케팅 동의 */}
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="marketing-consent-login"
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
              />
              <label htmlFor="marketing-consent-login" className="text-xs text-zinc-400 leading-tight cursor-pointer">
                <span className="text-zinc-500 font-bold">[{t('auth.optional', '선택')}]</span>{' '}
                {t('auth.marketing_consent', '이메일 론칭 혜택 등 마케팅 수신 동의')}
              </label>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            disabled={!agreeTerms}
            className={`w-full flex items-center justify-center gap-3 bg-white text-zinc-900 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${!agreeTerms ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98] hover:bg-zinc-100'}`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t('auth.google_login')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Sign up and Login are the same for Google Authentication
export const SignUpScreen = ({ onSignUp, onNavigateToLogin }: { onSignUp: (email: string, uid: string, agreeMarketing: boolean) => void, onNavigateToLogin: () => void }) => {
  return <LoginScreen onLogin={onSignUp} onNavigateToSignUp={onNavigateToLogin} />;
};
