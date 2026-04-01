/**
 * AdminDashboard — Pet Genie 관리자 대시보드
 * =====================================================
 * 왜 필요한가:
 * - 앱 운영 현황(유저, 스캔, 매출)을 한눈에 파악
 * - 유저 관리 및 결제 내역 확인
 * - AI 스캔 품질 모니터링
 * - 유저 피드백 수집 및 관리
 *
 * 탭 구성:
 * 1. 대시보드 — 핵심 KPI 및 차트
 * 2. 유저 관리 — 유저 목록, 검색, 결제 내역
 * 3. 스캔 기록 — AI 분석 로그
 * 4. 피드백 — 유저 건의사항 관리
 * =====================================================
 */
import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Search, Users, BarChart3, MessageSquare, Scan,
  TrendingUp, DollarSign, Crown, Activity, ChevronDown, ChevronUp,
  Shield, Ban, CheckCircle2, XCircle, Clock, Star, PawPrint,
  CreditCard, RefreshCw, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAppUsers, searchAppUsers, filterUsersByMembership,
  toggleUserStatus, getScanLogs, getFeedbacks,
  updateFeedbackStatus, getAppStats, ADMIN_EMAIL
} from '../../services/adminService';
import type { AppUser, ScanLog, Feedback, AppStats } from '../../types';

// ── 탭 타입 ──
type AdminTab = 'dashboard' | 'users' | 'scans' | 'feedback';

// ── 멤버십 라벨 및 색상 ──
const MEMBERSHIP_STYLES = {
  free: { label: 'Free', bg: 'bg-zinc-100', text: 'text-zinc-500' },
  premium: { label: 'Premium', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  premium_plus: { label: 'Premium+', bg: 'bg-amber-50', text: 'text-amber-600' },
} as const;

// ── 피드백 카테고리 라벨 ──
const CATEGORY_LABELS = {
  bug: { label: '버그', icon: '🐛', color: 'text-rose-500 bg-rose-50' },
  feature: { label: '기능 요청', icon: '✨', color: 'text-violet-500 bg-violet-50' },
  improvement: { label: '개선', icon: '🔧', color: 'text-blue-500 bg-blue-50' },
  other: { label: '기타', icon: '💬', color: 'text-zinc-500 bg-zinc-100' },
} as const;

// ── 피드백 상태 라벨 ──
const STATUS_LABELS = {
  pending: { label: '대기', color: 'bg-yellow-50 text-yellow-600' },
  reviewed: { label: '검토 중', color: 'bg-blue-50 text-blue-600' },
  implemented: { label: '반영 완료', color: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: '기각', color: 'bg-zinc-100 text-zinc-500' },
} as const;

// ── 결제 상태 스타일 ──
const PAYMENT_STATUS = {
  completed: { label: '완료', color: 'text-emerald-600 bg-emerald-50' },
  refunded: { label: '환불', color: 'text-rose-500 bg-rose-50' },
  pending: { label: '대기', color: 'text-yellow-600 bg-yellow-50' },
} as const;

export default function AdminDashboard({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();

  // ── 상태 관리 ──
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [users, setUsers] = useState<AppUser[]>(getAppUsers());
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'free' | 'premium' | 'premium_plus'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [scanLogs] = useState<ScanLog[]>(getScanLogs());
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(getFeedbacks());
  const [stats] = useState<AppStats>(getAppStats());

  // ── 유저 검색 ──
  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setUsers(filterUsersByMembership(membershipFilter));
      return;
    }
    const results = searchAppUsers(searchTerm);
    setUsers(results);
  }, [searchTerm, membershipFilter]);

  // ── 멤버십 필터 ──
  const handleFilterChange = useCallback((filter: typeof membershipFilter) => {
    setMembershipFilter(filter);
    setSearchTerm('');
    setUsers(filterUsersByMembership(filter));
  }, []);

  // ── 유저 상태 토글 ──
  const handleToggleStatus = useCallback((uid: string) => {
    const updated = toggleUserStatus(uid);
    if (updated) {
      setUsers(prev => prev.map(u => u.uid === uid ? updated : u));
    }
  }, []);

  // ── 피드백 상태 변경 ──
  const handleFeedbackStatus = useCallback((id: string, status: Feedback['status']) => {
    const updated = updateFeedbackStatus(id, status);
    if (updated) {
      setFeedbacks(prev => prev.map(f => f.id === id ? updated : f));
    }
  }, []);

  // ── 결제 총액 계산 헬퍼 ──
  const getTotalPayment = (user: AppUser) => {
    return user.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  // ── 탭 정보 ──
  const tabs = [
    { id: 'dashboard' as const, label: '대시보드', icon: BarChart3 },
    { id: 'users' as const, label: '유저 관리', icon: Users },
    { id: 'scans' as const, label: '스캔 기록', icon: Scan },
    { id: 'feedback' as const, label: '피드백', icon: MessageSquare },
  ];

  return (
    <div className="h-full bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* ===== 헤더 ===== */}
      <header
        className="shrink-0 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 px-5 flex items-center gap-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', paddingBottom: '12px' }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-base tracking-tight">Pet Genie Admin</h1>
          <p className="text-[10px] text-zinc-500">운영자 대시보드</p>
        </div>
        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-2.5 py-1 rounded-full font-bold tracking-wider uppercase">
          🟢 ADMIN
        </span>
      </header>

      {/* ===== 탭 메뉴 ===== */}
      <div className="shrink-0 flex border-b border-white/5 px-4 gap-1 bg-zinc-900/40">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 border-b-2 transition-all text-[10px] font-bold ${
              activeTab === tab.id
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== 콘텐츠 영역 ===== */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'users' && (
              <UsersTab
                users={users}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={handleSearch}
                membershipFilter={membershipFilter}
                onFilterChange={handleFilterChange}
                expandedUser={expandedUser}
                onToggleExpand={(uid) => setExpandedUser(expandedUser === uid ? null : uid)}
                onToggleStatus={handleToggleStatus}
                getTotalPayment={getTotalPayment}
              />
            )}
            {activeTab === 'scans' && <ScansTab logs={scanLogs} />}
            {activeTab === 'feedback' && (
              <FeedbackTab
                feedbacks={feedbacks}
                onStatusChange={handleFeedbackStatus}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 1. 대시보드 탭
// ═══════════════════════════════════════
function DashboardTab({ stats }: { stats: AppStats }) {
  return (
    <div className="p-5 space-y-5 pb-20">
      {/* 핵심 KPI 그리드 */}
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          icon={<Users className="w-4 h-4" />}
          label="총 유저"
          value={stats.totalUsers.toLocaleString()}
          sub={`+${stats.newUsersLast7d} (7일)`}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <KPICard
          icon={<Crown className="w-4 h-4" />}
          label="프리미엄"
          value={`${stats.premiumUsers}명`}
          sub={`전환율 ${stats.premiumConversionRate}%`}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <KPICard
          icon={<Scan className="w-4 h-4" />}
          label="총 스캔"
          value={stats.totalScans.toLocaleString()}
          sub={`오늘 ${stats.scansToday}건`}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <KPICard
          icon={<DollarSign className="w-4 h-4" />}
          label="총 매출"
          value={`₩${stats.totalRevenue.toLocaleString()}`}
          sub={`이번 달 ₩${stats.revenueThisMonth.toLocaleString()}`}
          color="text-violet-400"
          bgColor="bg-violet-500/10"
        />
      </div>

      {/* DAU 카드 */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl p-5 border border-emerald-500/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">일간 활성 유저 (DAU)</span>
          </div>
          <span className="text-2xl font-black text-emerald-400">{stats.dailyActiveUsers}</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
            style={{ width: `${(stats.dailyActiveUsers / stats.totalUsers) * 100}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-500 mt-2">
          전체 유저 대비 {Math.round((stats.dailyActiveUsers / stats.totalUsers) * 100)}% 활성
        </p>
      </div>

      {/* 스캔 추이 (7일) */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-white/5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> 7일 스캔 추이
        </h3>
        <div className="flex items-end justify-between gap-1.5 h-28">
          {stats.scansByDay.map((day, i) => {
            const maxCount = Math.max(...stats.scansByDay.map(d => d.count));
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[9px] font-bold text-emerald-400">{day.count}</span>
                <div className="w-full bg-zinc-800 rounded-xl relative overflow-hidden" style={{ height: `${height}%`, minHeight: 4 }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-xl" />
                </div>
                <span className="text-[8px] text-zinc-600 font-bold">{day.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 인기 품종 Top 5 */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-white/5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <PawPrint className="w-4 h-4" /> 인기 품종 TOP 5
        </h3>
        <div className="space-y-3">
          {stats.topBreeds.map((item, i) => {
            const maxCount = stats.topBreeds[0]?.count || 1;
            return (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <span className="text-sm">{['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i]}</span>
                    {item.breed}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-bold">{item.count}회 스캔</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 멤버십 분포 */}
      <div className="bg-zinc-900 rounded-3xl p-5 border border-white/5">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Crown className="w-4 h-4" /> 멤버십 분포
        </h3>
        <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden mb-4 bg-zinc-800">
          <div
            className="h-full bg-zinc-500 transition-all duration-1000"
            style={{ width: `${(stats.freeUsers / stats.totalUsers) * 100}%` }}
          />
          <div
            className="h-full bg-emerald-500 transition-all duration-1000"
            style={{ width: `${(stats.premiumUsers / stats.totalUsers) * 100}%` }}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-lg font-black text-zinc-400">{stats.freeUsers}</p>
            <p className="text-[9px] font-bold text-zinc-600 uppercase">Free</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-emerald-400">{stats.premiumUsers}</p>
            <p className="text-[9px] font-bold text-emerald-600 uppercase">Premium</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-amber-400">{stats.premiumConversionRate}%</p>
            <p className="text-[9px] font-bold text-amber-600 uppercase">전환율</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KPI 카드 서브 컴포넌트 ──
function KPICard({ icon, label, value, sub, color, bgColor }: {
  icon: React.ReactNode; label: string; value: string; sub: string; color: string; bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-2xl p-4 border border-white/5 space-y-2`}>
      <div className={`w-8 h-8 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
        <p className="text-[10px] text-zinc-600 font-bold mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 2. 유저 관리 탭
// ═══════════════════════════════════════
function UsersTab({
  users, searchTerm, onSearchChange, onSearch,
  membershipFilter, onFilterChange, expandedUser, onToggleExpand,
  onToggleStatus, getTotalPayment,
}: {
  users: AppUser[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onSearch: () => void;
  membershipFilter: 'all' | 'free' | 'premium' | 'premium_plus';
  onFilterChange: (v: 'all' | 'free' | 'premium' | 'premium_plus') => void;
  expandedUser: string | null;
  onToggleExpand: (uid: string) => void;
  onToggleStatus: (uid: string) => void;
  getTotalPayment: (user: AppUser) => number;
}) {
  return (
    <div className="p-5 space-y-4 pb-20">
      {/* 검색 바 */}
      <div className="bg-zinc-900 rounded-2xl flex items-center gap-2 px-4 py-2.5 border border-white/5">
        <Search className="w-4 h-4 text-zinc-600" />
        <input
          type="text"
          placeholder="이름, 이메일, 반려동물 이름 검색..."
          className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-zinc-600"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <button
          onClick={onSearch}
          className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shrink-0"
        >
          검색
        </button>
      </div>

      {/* 멤버십 필터 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {([
          { key: 'all' as const, label: '전체' },
          { key: 'free' as const, label: 'Free' },
          { key: 'premium' as const, label: 'Premium' },
          { key: 'premium_plus' as const, label: 'Premium+' },
        ]).map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all shrink-0 ${
              membershipFilter === f.key
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-zinc-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 유저 수 표시 */}
      <p className="text-[10px] text-zinc-600 font-bold px-1">{users.length}명의 유저</p>

      {/* 유저 목록 */}
      <div className="space-y-2">
        {users.map(user => {
          const memStyle = MEMBERSHIP_STYLES[user.membershipType];
          const isExpanded = expandedUser === user.uid;
          const totalPaid = getTotalPayment(user);

          return (
            <div
              key={user.uid}
              className={`bg-zinc-900 rounded-2xl border transition-all ${
                isExpanded ? 'border-emerald-500/30' : 'border-white/5'
              }`}
            >
              {/* 유저 헤더 */}
              <button
                onClick={() => onToggleExpand(user.uid)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                {/* 아바타 */}
                <div className="relative shrink-0">
                  <div className="w-11 h-11 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-sm font-bold ring-2 ring-white/5">
                    {user.displayName.charAt(0)}
                  </div>
                  {user.status === 'suspended' && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
                      <Ban className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-white truncate">{user.displayName}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${memStyle.bg} ${memStyle.text}`}>
                      {memStyle.label}
                    </span>
                    {user.status === 'suspended' && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400">정지</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600 truncate">{user.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-zinc-600">🐾 {user.petName} · {user.petBreed}</span>
                    {totalPaid > 0 && (
                      <span className="text-[9px] text-emerald-500 font-bold">₩{totalPaid.toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right mr-1">
                    <p className="text-xs font-bold text-zinc-400">{user.totalScans}</p>
                    <p className="text-[8px] text-zinc-700 uppercase">스캔</p>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-4 h-4 text-zinc-600" />
                    : <ChevronDown className="w-4 h-4 text-zinc-600" />
                  }
                </div>
              </button>

              {/* 확장 상세 영역 */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                      {/* 유저 상세 정보 */}
                      <div className="grid grid-cols-2 gap-3">
                        <InfoItem label="가입일" value={user.joinDate} />
                        <InfoItem label="최근 접속" value={user.lastActive} />
                        <InfoItem label="UID" value={user.uid} />
                        <InfoItem label="총 스캔" value={`${user.totalScans}회`} />
                      </div>

                      {/* 결제 내역 */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">결제 내역</span>
                          {totalPaid > 0 && (
                            <span className="text-[10px] font-bold text-emerald-500 ml-auto">
                              총 ₩{totalPaid.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {user.payments.length === 0 ? (
                          <p className="text-[10px] text-zinc-700 italic py-2 text-center">결제 내역이 없습니다</p>
                        ) : (
                          <div className="space-y-1.5">
                            {user.payments.map(pay => {
                              const payStyle = PAYMENT_STATUS[pay.status];
                              return (
                                <div key={pay.id} className="bg-zinc-800/50 rounded-xl p-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-zinc-300">{pay.product}</p>
                                    <p className="text-[9px] text-zinc-600">{pay.date} · {pay.platform === 'google_play' ? 'Google Play' : 'App Store'}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold text-zinc-300">₩{pay.amount.toLocaleString()}</p>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${payStyle.color}`}>
                                      {payStyle.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => onToggleStatus(user.uid)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                            user.status === 'active'
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <><Ban className="w-3 h-3" /> 계정 정지</>
                          ) : (
                            <><CheckCircle2 className="w-3 h-3" /> 정지 해제</>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 유저 상세 정보 아이템 ──
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-800/30 rounded-xl px-3 py-2">
      <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-wider">{label}</p>
      <p className="text-[11px] font-bold text-zinc-400 mt-0.5 break-all">{value}</p>
    </div>
  );
}

// ═══════════════════════════════════════
// 3. 스캔 기록 탭
// ═══════════════════════════════════════
function ScansTab({ logs }: { logs: ScanLog[] }) {
  return (
    <div className="p-5 space-y-3 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">최근 AI 분석 기록</h3>
        <span className="text-[10px] text-zinc-600 font-bold">{logs.length}건</span>
      </div>

      {logs.map(log => (
        <div key={log.id} className="bg-zinc-900 rounded-2xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <PawPrint className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{log.userName}</p>
                <p className="text-[9px] text-zinc-600">{log.petBreed} · {log.scanDate}</p>
              </div>
            </div>
            <div className="text-right">
              <HealthBadge score={log.healthScore} />
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-800/50 rounded-xl p-3">
            {log.resultSummary}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── 건강 점수 배지 ──
function HealthBadge({ score }: { score: number }) {
  let color = 'text-emerald-400 bg-emerald-500/10';
  if (score < 80) color = 'text-yellow-400 bg-yellow-500/10';
  if (score < 70) color = 'text-rose-400 bg-rose-500/10';

  return (
    <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${color}`}>
      {score}점
    </span>
  );
}

// ═══════════════════════════════════════
// 4. 피드백 탭
// ═══════════════════════════════════════
function FeedbackTab({
  feedbacks, onStatusChange,
}: {
  feedbacks: Feedback[];
  onStatusChange: (id: string, status: Feedback['status']) => void;
}) {
  const pendingCount = feedbacks.filter(f => f.status === 'pending').length;

  return (
    <div className="p-5 space-y-3 pb-20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">유저 피드백</h3>
        {pendingCount > 0 && (
          <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-full font-bold">
            {pendingCount}건 대기
          </span>
        )}
      </div>

      {feedbacks.map(fb => {
        const catStyle = CATEGORY_LABELS[fb.category];
        const statusStyle = STATUS_LABELS[fb.status];

        return (
          <div key={fb.id} className="bg-zinc-900 rounded-2xl p-4 border border-white/5 space-y-3">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${catStyle.color}`}>
                  {catStyle.icon} {catStyle.label}
                </span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${statusStyle.color}`}>
                  {statusStyle.label}
                </span>
              </div>
              <span className="text-[9px] text-zinc-700">{fb.createdAt}</span>
            </div>

            {/* 내용 */}
            <div>
              <h4 className="text-sm font-bold text-white">{fb.title}</h4>
              <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{fb.content}</p>
            </div>

            {/* 작성자 + 액션 */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <p className="text-[10px] text-zinc-700">작성자: {fb.userName}</p>
              {fb.status === 'pending' && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onStatusChange(fb.id, 'reviewed')}
                    className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-[9px] font-bold hover:bg-blue-500/20 transition-all active:scale-95"
                  >
                    검토 완료
                  </button>
                  <button
                    onClick={() => onStatusChange(fb.id, 'implemented')}
                    className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-bold hover:bg-emerald-500/20 transition-all active:scale-95"
                  >
                    반영 완료
                  </button>
                </div>
              )}
              {fb.status === 'reviewed' && (
                <button
                  onClick={() => onStatusChange(fb.id, 'implemented')}
                  className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-bold hover:bg-emerald-500/20 transition-all active:scale-95"
                >
                  반영 완료
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
