// --- Types ---
export type Screen = 'onboarding' | 'login' | 'signup' | 'camera' | 'pet-dashboard' | 'health-report' | 'membership' | 'diet-guide' | 'exercise-plan' | 'care-guide' | 'history' | 'privacy' | 'profile' | 'ai-vet';

// --- Pet Profile Type ---
export interface PetProfile {
  name: string;
  breed: string;
  age: string;
  gender: 'male' | 'female' | '';
  weight: string;
}

// --- Daily Care Item ---
export interface CareItem {
  id: string;
  label: string;
  icon: any;
  completed: boolean;
}
