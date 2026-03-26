import { useTranslation, Trans } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';


// --- Components ---

const PrivacyPolicyScreen = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="h-full bg-white overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header className="px-6 pb-6 flex items-center justify-between bg-white border-b border-zinc-100 sticky top-0 z-50" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">{t('privacy.title')}</h1>
        <div className="w-9" />
      </header>

      <div className="p-8 space-y-8 text-zinc-600">
        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section1_title')}</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {t('privacy.section1_content')}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section2_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('privacy.section2_content')}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section3_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('privacy.section3_content')}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t('privacy.section4_title')}</h2>
          <p className="text-sm leading-relaxed">
            {t('privacy.section4_content')}
          </p>
        </section>

        <div className="pt-8 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-400">{t('privacy.last_updated')}</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
