import { useTranslation } from 'react-i18next';

export const getMockPet = (t: any) => ({
  name: t('dashboard.default_pet_name'),
  type: t('dashboard.default_pet_breed'),
  breedMatch: 99,
  primaryBreed: t('dashboard.default_pet_breed'),
  primaryPercentage: 70,
  secondaryBreed: t('hardcoded.secondary_breed_default'),
  secondaryPercentage: 30,
  weight: 24.2,
  lastScan: t('hardcoded.last_scan_time'),
  activityLevel: t('dashboard.activity_normal'),
  recommendations: [
    t('dashboard.tip1'),
    t('dashboard.tip2'),
    t('dashboard.tip3')
  ]
});

export const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷', short: 'KO' },
  { code: 'en', label: 'English', flag: '🇺🇸', short: 'EN' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
  { code: 'zh', label: '中文', flag: '🇨🇳', short: 'ZH' },
  { code: 'es', label: 'Español', flag: '🇪🇸', short: 'ES' },
] as const;
