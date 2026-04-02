/**
 * adminService — Pet Genie 관리자 대시보드용 Mock 데이터 서비스
 * =====================================================
 * 왜 Mock: Firebase 연동 전 UI/UX 프로토타이핑을 위해 현실적인 더미 데이터 제공
 * 나중에 Firebase 연동 시 이 파일의 함수 내부만 Firestore 쿼리로 교체하면 됨
 * =====================================================
 */
import type { AppUser, PaymentRecord, Feedback, Reward, AppStats } from '../types';

// ── 관리자 이메일 (하드코딩) ──
export const ADMIN_EMAIL = 'timbach@naver.com';

// ── Mock 결제 데이터 ──
const MOCK_PAYMENTS: PaymentRecord[] = [
  { id: 'pay_001', date: '2026-03-28', amount: 9900, currency: 'KRW', product: '프리미엄 월간', status: 'completed', platform: 'google_play' },
  { id: 'pay_002', date: '2026-03-15', amount: 4900, currency: 'KRW', product: '프리미엄 주간', status: 'completed', platform: 'google_play' },
  { id: 'pay_003', date: '2026-02-28', amount: 9900, currency: 'KRW', product: '프리미엄 월간', status: 'refunded', platform: 'app_store' },
  { id: 'pay_004', date: '2026-03-01', amount: 29900, currency: 'KRW', product: '프리미엄 플러스 연간', status: 'completed', platform: 'app_store' },
  { id: 'pay_005', date: '2026-03-20', amount: 9900, currency: 'KRW', product: '프리미엄 월간', status: 'completed', platform: 'google_play' },
];

// ── Mock 유저 데이터 ──
const MOCK_USERS: AppUser[] = [
  {
    uid: 'u001', email: 'minjae.kim@gmail.com', displayName: '김민재',
    profileImage: '', joinDate: '2026-01-15', lastActive: '2026-04-01',
    isPremium: true, membershipType: 'premium', totalScans: 42,
    petName: '초코', petBreed: '골든 리트리버', status: 'active',
    payments: [MOCK_PAYMENTS[0], MOCK_PAYMENTS[1]],
  },
  {
    uid: 'u002', email: 'soyeon.park@naver.com', displayName: '박소연',
    profileImage: '', joinDate: '2026-02-03', lastActive: '2026-03-31',
    isPremium: true, membershipType: 'premium_plus', totalScans: 67,
    petName: '루나', petBreed: '포메라니안', status: 'active',
    payments: [MOCK_PAYMENTS[3]],
  },
  {
    uid: 'u003', email: 'junghoon.lee@kakao.com', displayName: '이정훈',
    profileImage: '', joinDate: '2026-02-20', lastActive: '2026-04-01',
    isPremium: false, membershipType: 'free', totalScans: 8,
    petName: '뽀삐', petBreed: '말티즈', status: 'active',
    payments: [],
  },
  {
    uid: 'u004', email: 'yuna.choi@gmail.com', displayName: '최유나',
    profileImage: '', joinDate: '2026-03-01', lastActive: '2026-03-30',
    isPremium: true, membershipType: 'premium', totalScans: 23,
    petName: '콩이', petBreed: '시츄', status: 'active',
    payments: [MOCK_PAYMENTS[4]],
  },
  {
    uid: 'u005', email: 'dohyun.jung@naver.com', displayName: '정도현',
    profileImage: '', joinDate: '2026-01-28', lastActive: '2026-03-25',
    isPremium: false, membershipType: 'free', totalScans: 3,
    petName: '바둑이', petBreed: '진돗개', status: 'suspended',
    payments: [MOCK_PAYMENTS[2]],
  },
  {
    uid: 'u006', email: 'haeun.kang@gmail.com', displayName: '강하은',
    profileImage: '', joinDate: '2026-03-12', lastActive: '2026-04-01',
    isPremium: false, membershipType: 'free', totalScans: 15,
    petName: '몽이', petBreed: '비숑 프리제', status: 'active',
    payments: [],
  },
  {
    uid: 'u007', email: 'seojin.oh@kakao.com', displayName: '오서진',
    profileImage: '', joinDate: '2026-02-14', lastActive: '2026-03-29',
    isPremium: true, membershipType: 'premium', totalScans: 31,
    petName: '보리', petBreed: '웰시 코기', status: 'active',
    payments: [MOCK_PAYMENTS[0]],
  },
  {
    uid: 'u008', email: 'taewoo.shin@gmail.com', displayName: '신태우',
    profileImage: '', joinDate: '2026-03-05', lastActive: '2026-04-01',
    isPremium: false, membershipType: 'free', totalScans: 5,
    petName: '해피', petBreed: '래브라도 리트리버', status: 'active',
    payments: [],
  },
  {
    uid: 'u009', email: 'jiyeon.song@naver.com', displayName: '송지연',
    profileImage: '', joinDate: '2026-01-05', lastActive: '2026-03-28',
    isPremium: true, membershipType: 'premium_plus', totalScans: 89,
    petName: '두부', petBreed: '사모예드', status: 'active',
    payments: [MOCK_PAYMENTS[3], MOCK_PAYMENTS[0]],
  },
  {
    uid: 'u010', email: 'wonjun.han@gmail.com', displayName: '한원준',
    profileImage: '', joinDate: '2026-03-20', lastActive: '2026-03-31',
    isPremium: false, membershipType: 'free', totalScans: 2,
    petName: '뭉치', petBreed: '닥스훈트', status: 'active',
    payments: [],
  },
  {
    uid: 'u011', email: 'eunji.yoon@kakao.com', displayName: '윤은지',
    profileImage: '', joinDate: '2026-02-08', lastActive: '2026-04-01',
    isPremium: true, membershipType: 'premium', totalScans: 37,
    petName: '설이', petBreed: '시바 이누', status: 'active',
    payments: [MOCK_PAYMENTS[4], MOCK_PAYMENTS[1]],
  },
  {
    uid: 'u012', email: 'sungho.bae@naver.com', displayName: '배성호',
    profileImage: '', joinDate: '2026-03-15', lastActive: '2026-03-27',
    isPremium: false, membershipType: 'free', totalScans: 1,
    petName: '대박', petBreed: '불독', status: 'active',
    payments: [],
  },
];



// ── Mock 피드백 ──
const MOCK_FEEDBACKS: Feedback[] = [
  { id: 'f001', userId: 'u001', userName: '김민재', title: 'AI 분석 정확도 개선 요청', content: '골든 리트리버인데 래브라도로 인식할 때가 있어요. 분석 정확도를 좀 더 올려주시면 좋겠습니다.', category: 'improvement', status: 'reviewed', createdAt: '2026-03-30' },
  { id: 'f002', userId: 'u006', userName: '강하은', title: '다크모드 지원 요청', content: '밤에 앱을 사용할 때 눈이 부셔요. 다크모드를 추가해주세요!', category: 'feature', status: 'pending', createdAt: '2026-03-31' },
  { id: 'f003', userId: 'u003', userName: '이정훈', title: '카메라가 간헐적으로 멈춤', content: '스캔 버튼을 누르면 카메라가 약 5초 정도 먹통이 되는 현상이 있습니다. Galaxy S24 Ultra 사용 중입니다.', category: 'bug', status: 'pending', createdAt: '2026-04-01' },
  { id: 'f004', userId: 'u009', userName: '송지연', title: '다중 반려동물 프로필', content: '강아지 두 마리를 키우는데 프로필을 하나만 등록할 수 있어서 불편해요. 여러 마리 등록 기능이 있으면 좋겠습니다.', category: 'feature', status: 'pending', createdAt: '2026-04-01' },
  { id: 'f005', userId: 'u011', userName: '윤은지', title: '건강 리포트 PDF 다운로드', content: '건강 리포트를 수의사에게 보여주고 싶은데, PDF로 저장할 수 있는 기능이 있으면 편할 것 같아요.', category: 'feature', status: 'reviewed', createdAt: '2026-03-29' },
  { id: 'f006', userId: 'u004', userName: '최유나', title: '프리미엄 가격 인하 건의', content: '기능은 좋지만 월 9,900원은 조금 부담됩니다. 5,900원 정도면 더 많이 구독할 것 같아요.', category: 'other', status: 'pending', createdAt: '2026-03-28' },
];

// ── API 함수들 (Mock) ──

/** 전체 유저 목록 조회 */
export function getAppUsers(): AppUser[] {
  return [...MOCK_USERS];
}

/** 유저 검색 (이름 또는 이메일) */
export function searchAppUsers(term: string): AppUser[] {
  const lower = term.toLowerCase();
  return MOCK_USERS.filter(u =>
    u.displayName.toLowerCase().includes(lower) ||
    u.email.toLowerCase().includes(lower) ||
    u.petName.toLowerCase().includes(lower)
  );
}

/** 멤버십 필터 */
export function filterUsersByMembership(type: 'all' | 'free' | 'premium' | 'premium_plus'): AppUser[] {
  if (type === 'all') return [...MOCK_USERS];
  return MOCK_USERS.filter(u => u.membershipType === type);
}

/** 유저 상태 토글 (활성 ↔ 정지) */
export function toggleUserStatus(uid: string): AppUser | null {
  const user = MOCK_USERS.find(u => u.uid === uid);
  if (!user) return null;
  user.status = user.status === 'active' ? 'suspended' : 'active';
  return { ...user };
}



/** 피드백 목록 조회 */
export function getFeedbacks(): Feedback[] {
  return [...MOCK_FEEDBACKS];
}

/** 피드백 상태 업데이트 */
export function updateFeedbackStatus(id: string, status: Feedback['status']): Feedback | null {
  const fb = MOCK_FEEDBACKS.find(f => f.id === id);
  if (!fb) return null;
  fb.status = status;
  return { ...fb, rewards: fb.rewards ? [...fb.rewards] : undefined };
}

/** 관리자 답변 추가 */
export function addAdminReply(id: string, reply: string): Feedback | null {
  const fb = MOCK_FEEDBACKS.find(f => f.id === id);
  if (!fb) return null;
  fb.adminReply = reply;
  fb.repliedAt = new Date().toISOString().split('T')[0];
  // 답변 시 자동으로 확인됨 상태로 변경
  if (fb.status === 'pending') fb.status = 'reviewed';
  return { ...fb, rewards: fb.rewards ? [...fb.rewards] : undefined };
}

/** 보상 지급 */
export function grantReward(feedbackId: string, type: Reward['type'], label: string, value: number): Feedback | null {
  const fb = MOCK_FEEDBACKS.find(f => f.id === feedbackId);
  if (!fb) return null;

  const reward: Reward = {
    id: `r_${Date.now()}`,
    type,
    label,
    value,
    grantedAt: new Date().toISOString().split('T')[0],
    grantedBy: ADMIN_EMAIL,
  };

  if (!fb.rewards) fb.rewards = [];
  fb.rewards.push(reward);

  return { ...fb, rewards: [...fb.rewards] };
}

/** 시스템 통계 조회 */
export function getAppStats(): AppStats {
  const premiumUsers = MOCK_USERS.filter(u => u.isPremium).length;
  const allPayments = MOCK_USERS.flatMap(u => u.payments).filter(p => p.status === 'completed');
  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalUsers: MOCK_USERS.length,
    premiumUsers,
    freeUsers: MOCK_USERS.length - premiumUsers,
    premiumConversionRate: Math.round((premiumUsers / MOCK_USERS.length) * 100),
    totalScans: MOCK_USERS.reduce((sum, u) => sum + u.totalScans, 0),
    scansToday: 14,
    scansThisWeek: 87,
    totalRevenue,
    revenueThisMonth: 49700,
    dailyActiveUsers: 8,
    topBreeds: [
      { breed: '골든 리트리버', count: 156 },
      { breed: '포메라니안', count: 134 },
      { breed: '말티즈', count: 121 },
      { breed: '시츄', count: 98 },
      { breed: '시바 이누', count: 87 },
    ],
    scansByDay: [
      { date: '03/26', count: 8 },
      { date: '03/27', count: 12 },
      { date: '03/28', count: 15 },
      { date: '03/29', count: 11 },
      { date: '03/30', count: 18 },
      { date: '03/31', count: 22 },
      { date: '04/01', count: 14 },
    ],
    newUsersLast7d: 3,
    newUsersLast30d: 9,
  };
}
