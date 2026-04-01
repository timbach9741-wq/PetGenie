import React from 'react';
import { useTranslation } from 'react-i18next';
import { User } from 'lucide-react';
import vetImage from '../../assets/images/ai-vet-character.png';

const DrSilvermanHeader = () => {
  const { t } = useTranslation();
  
  // This uses a placeholder fallback if the image doesn't load.
  const [imgError, setImgError] = React.useState(false);

  return (
    <header className="flex items-center gap-3 p-4 bg-emerald-900/40 border-b border-emerald-500/20">
      {!imgError ? (
        <img 
          src={vetImage} 
          alt="Dr. Silverman" 
          className="w-12 h-12 rounded-full border-2 border-emerald-400 object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400 bg-emerald-800 flex items-center justify-center">
          <User className="w-6 h-6 text-emerald-400" />
        </div>
      )}
      <div>
        <h2 className="font-bold text-white text-base leading-tight">
          {t('persona.name')}
        </h2>
        <p className="text-[11px] text-emerald-400 mt-0.5">
          {t('persona.role')}
        </p>
      </div>
    </header>
  );
};

export default DrSilvermanHeader;
