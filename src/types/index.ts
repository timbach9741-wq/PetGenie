// --- Types ---
export type Screen = 'onboarding' | 'login' | 'signup' | 'camera' | 'pet-dashboard' | 'health-report' | 'membership' | 'diet-guide' | 'exercise-plan' | 'care-guide' | 'history' | 'privacy' | 'profile' | 'ai-vet' | 'admin';

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

// --- 관리자 대시보드 관련 타입 ---

/** 앱 유저 정보 (관리자 조회용) */
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  profileImage: string;
  joinDate: string;
  lastActive: string;
  isPremium: boolean;
  membershipType: 'free' | 'premium' | 'premium_plus';
  totalScans: number;
  petName: string;
  petBreed: string;
  status: 'active' | 'suspended';
  payments: PaymentRecord[];
}

/** 결제 내역 */
export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  currency: string;
  product: string;
  status: 'completed' | 'refunded' | 'pending';
  platform: 'google_play' | 'app_store' | 'web';
}

/** 보상 기록 */
export interface Reward {
  id: string;
  type: 'premium_days' | 'scan_credits' | 'coupon';
  label: string;
  value: number;
  grantedAt: string;
  grantedBy: string;
}

/** 유저 피드백 */
export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  title: string;
  content: string;
  category: 'bug' | 'feature' | 'improvement' | 'other';
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  createdAt: string;
  adminReply?: string;
  repliedAt?: string;
  rewards?: Reward[];
}

/** 시스템 통계 */
export interface AppStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  premiumConversionRate: number;
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  totalRevenue: number;
  revenueThisMonth: number;
  dailyActiveUsers: number;
  topBreeds: { breed: string; count: number }[];
  scansByDay: { date: string; count: number }[];
  newUsersLast7d: number;
  newUsersLast30d: number;
}
