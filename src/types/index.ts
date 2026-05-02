// --- Types ---
export type Screen = 'onboarding' | 'login' | 'signup' | 'camera' | 'pet-dashboard' | 'health-report' | 'membership' | 'diet-guide' | 'exercise-plan' | 'care-guide' | 'history' | 'privacy' | 'profile' | 'ai-vet' | 'admin' | 'emergency-guide' | 'walk-timer' | 'vaccination' | 'weight-tracker' | 'breed-info' | 'community' | 'community-post' | 'post-detail' | 'app-info';

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
  iconType?: string; // localStorage 저장/복원 시 아이콘 매핑용
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
  marketingConsent?: boolean;
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
  arpu: number;
  dailyActiveUsers: number;
  retentionRate30d: number;
  topBreeds: { breed: string; count: number }[];
  scansByDay: { date: string; count: number }[];
  newUsersToday: number;
  newUsersLast7d: number;
  newUsersLast30d: number;
}

// --- 커뮤니티 관련 타입 ---

/** 커뮤니티 게시글 */
export interface CommunityPost {
  id: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  petName: string;
  petBreed: string;
  type: 'photo' | 'walk'; // 일반 사진 게시글 vs 산책 인증
  text: string;
  imageUrl?: string; // Firebase Storage URL
  walkDuration?: number; // 산책 시간 (초)
  walkStreak?: number; // 연속 산책 일수
  likes: string[]; // 좋아요 누른 유저 UID 배열
  commentCount: number;
  createdAt: any; // Firestore Timestamp
}

/** 댓글 */
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any; // Firestore Timestamp
  parentId?: string; // 대댓글 지원용
}

/** 산책 랭킹 항목 */
export interface WalkRankingEntry {
  userId: string;
  userName: string;
  petName: string;
  totalMinutes: number;
  walkCount: number;
  streak: number;
}
