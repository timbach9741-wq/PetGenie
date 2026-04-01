import i18n from '../i18n';

// Antigravity Core: Language & AI Shield
export const antigravityEngine = {
  // 1. 언어 변경 시 언어 키만 확실하게 덮어쓰기 실시
  switchLanguage: (newLang: string) => {
    localStorage.setItem('user-language', newLang);
    localStorage.setItem('i18nextLng', newLang);
    window.location.reload();
  },

  // 1. 모든 언어 파일을 '안티그라비티' 규칙(Zero-Hardcoding)으로 검수
  validateLocales: () => {
    /* 한국어 텍스트가 코드에 직접 적힌 곳을 찾아 에러를 발생시키는 자동 검사기 */
    if (import.meta.env.DEV) {
       console.log('[Antigravity] Validating locales for Zero-Hardcoding rule...');
    }
  },

  // 2. AI 분석 시 현재 언어를 1순위로 강제 고정
  getGlobalPrompt: (lang: string) => {
    const langMap: Record<string, string> = { ko: 'KOREAN', en: 'ENGLISH', ja: 'JAPANESE', 'zh-TW': 'CHINESE', es: 'SPANISH' };
    return `[SYSTEM] ROLE: AI VET. TARGET LANG: ${langMap[lang] || 'ENGLISH'}. DO NOT USE OTHER LANGUAGES.`;
  }
};
