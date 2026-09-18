/**
 * adminService — Pet Genie 관리자 대시보드용 데이터 서비스
 * =====================================================
 * Firestore 기반 실제 통신으로 전면 개편되었습니다.
 * =====================================================
 */
import { collection, getDocs, doc, updateDoc, query, orderBy, limit, getDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { AppUser, Feedback, Reward, AppStats } from '../types';

// ── 관리자 이메일 ──
export const ADMIN_EMAIL = 'timbach@naver.com';

/** 전체 유저 목록 조회 - (페이지네이션 없이 최근 200명 제한) */
export async function getAppUsers(): Promise<AppUser[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, limit(200));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as AppUser));
  } catch (error) {
    console.error('getAppUsers error:', error);
    return [];
  }
}

/** 모조 필터/검색용 헬퍼 (클라이언트에서 필터링 권장) */
export function filterUsersLocal(allUsers: AppUser[], term: string, membershipType: string): AppUser[] {
  const lower = term.toLowerCase();
  return allUsers.filter(u => {
    const matchTerm = 
      (u.displayName || '').toLowerCase().includes(lower) ||
      (u.email || '').toLowerCase().includes(lower) ||
      (u.petName || '').toLowerCase().includes(lower);
    const matchMem = membershipType === 'all' || u.membershipType === membershipType;
    return matchTerm && matchMem;
  });
}

/** 유저 상태 토글 (활성 ↔ 정지) */
export async function toggleUserStatus(uid: string, currentStatus: string): Promise<AppUser | null> {
  const userRef = doc(db, 'users', uid);
  const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
  await updateDoc(userRef, { status: nextStatus });
  
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;
  return { uid: userSnap.id, ...userSnap.data() } as AppUser;
}

/** 피드백 목록 조회 */
export async function getFeedbacks(): Promise<Feedback[]> {
  try {
    const fbCol = collection(db, 'feedbacks');
    // where 없이 orderBy+limit만 쓰는 단일 필드 정렬이라 별도 복합 인덱스가 필요 없음
    const q = query(fbCol, orderBy('createdAt', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback));
  } catch(error) {
    console.error('getFeedbacks error:', error);
    return [];
  }
}

/** 피드백 상태 업데이트 */
export async function updateFeedbackStatus(id: string, status: Feedback['status']): Promise<Feedback | null> {
  const fbRef = doc(db, 'feedbacks', id);
  await updateDoc(fbRef, { status });
  
  const fbSnap = await getDoc(fbRef);
  if (!fbSnap.exists()) return null;
  return { id: fbSnap.id, ...fbSnap.data() } as Feedback;
}

/** 관리자 답변 추가 */
export async function addAdminReply(id: string, reply: string): Promise<Feedback | null> {
  const fbRef = doc(db, 'feedbacks', id);
  const repliedAt = new Date().toISOString().split('T')[0];
  
  await updateDoc(fbRef, { 
      adminReply: reply,
      repliedAt,
      status: 'reviewed' // 답변 시 자동으로 확인됨 상태로 변경
  });
  
  const fbSnap = await getDoc(fbRef);
  if (!fbSnap.exists()) return null;
  return { id: fbSnap.id, ...fbSnap.data() } as Feedback;
}

/** 보상 지급 */
export async function grantReward(feedbackId: string, type: Reward['type'], label: string, value: number): Promise<Feedback | null> {
  const fbRef = doc(db, 'feedbacks', feedbackId);
  const reward: Reward = {
    id: `r_${Date.now()}`,
    type,
    label,
    value,
    grantedAt: new Date().toISOString().split('T')[0],
    grantedBy: ADMIN_EMAIL,
  };

  await updateDoc(fbRef, {
      rewards: arrayUnion(reward)
  });

  const fbSnap = await getDoc(fbRef);
  if (!fbSnap.exists()) return null;
  return { id: fbSnap.id, ...fbSnap.data() } as Feedback;
}

/** 시스템 통계 조회 (Cloud Functions 연동 전 오버뷰 데이터 생성) */
export async function getAppStats(users: AppUser[]): Promise<AppStats> {
  const premiumUsers = users.filter(u => u.isPremium).length;
  // 결제 데이터는 현재 각 유저 문서 내 배열로 구성되어 있다 가정
  const allPayments = users.flatMap(u => (u.payments || [])).filter(p => p.status === 'completed');
  const totalRevenue = allPayments.reduce((sum, p) => sum + p.amount, 0);

  const thirtyDaysAgo = Date.now() - 30 * 86400000;
  const usersJoinedMoreThan30d = users.filter(u => u.joinDate && new Date(u.joinDate).getTime() <= thirtyDaysAgo);
  const activeUsersFromCohort = usersJoinedMoreThan30d.filter(u => u.lastActive && new Date(u.lastActive).getTime() > thirtyDaysAgo);
  const retentionRate30d = usersJoinedMoreThan30d.length > 0 ? Math.round((activeUsersFromCohort.length / usersJoinedMoreThan30d.length) * 100) : 0;

  const breedsMap = new Map<string, number>();
  users.forEach(u => {
    const b = u.petBreed || '기타';
    breedsMap.set(b, (breedsMap.get(b) || 0) + 1);
  });
  const topBreeds = Array.from(breedsMap.entries())
    .map(([breed, count]) => ({ breed, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalUsers: users.length,
    premiumUsers,
    freeUsers: users.length - premiumUsers,
    premiumConversionRate: users.length > 0 ? Math.round((premiumUsers / users.length) * 100) : 0,
    totalScans: users.reduce((sum, u) => sum + (u.totalScans || 0), 0),
    scansToday: 0, // 구체적인 스캔 로그가 없으므로 임시 0
    scansThisWeek: 0,
    totalRevenue,
    revenueThisMonth: totalRevenue, // 더 정교한 계산을 위해서는 payment의 date를 확인해야 함
    arpu: users.length > 0 ? Math.round(totalRevenue / users.length) : 0,
    dailyActiveUsers: users.filter(u => u.lastActive && new Date(u.lastActive).getTime() > Date.now() - 86400000).length,
    retentionRate30d,
    topBreeds: topBreeds.length > 0 ? topBreeds : [{ breed: '기타', count: users.length }],
    scansByDay: [
      { date: '오늘', count: 5 },
    ], // 임시 (스캔 로그 컬렉션이 없으므로)
    newUsersToday: users.filter(u => u.joinDate && new Date(u.joinDate).getTime() > Date.now() - 86400000).length,
    newUsersLast7d: users.filter(u => u.joinDate && new Date(u.joinDate).getTime() > Date.now() - 7 * 86400000).length,
    newUsersLast30d: users.filter(u => u.joinDate && new Date(u.joinDate).getTime() > Date.now() - 30 * 86400000).length,
  };
}
