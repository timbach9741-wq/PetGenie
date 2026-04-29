/**
 * AdminDashboard — Pet Genie 관리자 대시보드
 * =====================================================
 * 왜 필요한가:
 * - 앱 운영 현황(유저, 스캔, 매출)을 한눈에 파악
 * - 유저 관리 및 결제 내역 확인
 * - 유저 피드백 수집 및 관리
 *
 * 탭 구성:
 * 1. 대시보드 — 핵심 KPI 및 차트 (스캔 요약 지표 포함)
 * 2. 유저 관리 — 유저 목록, 검색, 결제 내역
 * 3. 피드백 — 유저 건의사항 관리
 * =====================================================
 */
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Search, Users, BarChart3, Scan,
  TrendingUp, DollarSign, Crown, Activity, ChevronDown, ChevronUp,
  Ban, CheckCircle2, XCircle, Clock, Star,
  CreditCard, RefreshCw, MessageSquare, AlertTriangle, Eye,
  Gift, Send, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAppUsers, filterUsersLocal,
  toggleUserStatus, getAppStats, ADMIN_EMAIL,
  getFeedbacks, updateFeedbackStatus,
  addAdminReply, grantReward
} from '../../services/adminService';
import type { AppUser, Feedback, Reward, AppStats } from '../../types';

// ── 탭 타입 ──
type AdminTab = 'dashboard' | 'users' | 'feedback';

// ── 멤버십 라벨 및 색상 ──
const MEMBERSHIP_STYLES = {
  free: { label: 'Free', bg: 'bg-zinc-100', text: 'text-zinc-500' },
  premium: { label: 'Premium', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  premium_plus: { label: 'Premium+', bg: 'bg-amber-50', text: 'text-amber-600' },
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
  const [isLoading, setIsLoading] = useState(true);
  
  // 전체 원본 데이터
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  
  // 화면 표시용 (검색/필터 적용)
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'free' | 'premium' | 'premium_plus'>('all');
  const [marketingFilter, setMarketingFilter] = useState<'all' | 'agreed' | 'disagreed'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  
  const [stats, setStats] = useState<AppStats | null>(null);

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

// ── 초기 데이터 로딩 ──
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const fetchedUsers = await getAppUsers();
      const fetchedFeedbacks = await getFeedbacks();
      const derivedStats = await getAppStats(fetchedUsers);
      
      setAllUsers(fetchedUsers);
      setUsers(fetchedUsers);
      setFeedbacks(fetchedFeedbacks);
      setStats(derivedStats);
      setIsLoading(false);
    }
    loadData();
  }, []);

  // ── 유저 검색 & 필터 ──
  useEffect(() => {
    let filtered = filterUsersLocal(allUsers, searchTerm, membershipFilter);
    if (marketingFilter !== 'all') {
      filtered = filtered.filter(u => 
        marketingFilter === 'agreed' ? u.marketingConsent === true : u.marketingConsent !== true
      );
    }
    setUsers(filtered);
  }, [searchTerm, membershipFilter, marketingFilter, allUsers]);

  const handleSearch = useCallback(() => {
    // useEffect에서 자동 처리됨
  }, []);

  const handleFilterChange = useCallback((filter: typeof membershipFilter) => {
    setMembershipFilter(filter);
    setSearchTerm('');
  }, []);

  // ── 유저 상태 토글 ──
  const handleToggleStatus = useCallback(async (uid: string) => {
    const user = allUsers.find(u => u.uid === uid);
    if (!user) return;
    const updated = await toggleUserStatus(uid, user.status);
    if (updated) {
      setAllUsers(prev => prev.map(u => u.uid === uid ? updated : u));
    }
  }, [allUsers]);

  // ── 결제 총액 계산 헬퍼 ──
  const getTotalPayment = (user: AppUser) => {
    return user.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  // ── 구독 정보 계산 헬퍼 (Mock) ──
  const getSubscriptionInfo = useCallback((user: AppUser) => {
    if (!user.isPremium || user.payments.length === 0) return null;
    
    const latestPayment = [...user.payments]
      .filter(p => p.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (!latestPayment) return null;

    const paymentDate = new Date(latestPayment.date);
    const expiryDate = new Date(paymentDate);

    if (latestPayment.product.includes('연간')) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    } else if (latestPayment.product.includes('주간')) {
      expiryDate.setDate(expiryDate.getDate() + 7);
    } else {
      // 기본은 월간으로 취급
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    const isExpired = expiryDate < new Date();

    return {
      product: latestPayment.product,
      expiryDate: expiryDate.toISOString().split('T')[0],
      isExpired
    };
  }, []);

  // ── 피드백 상태 토글 ──
  const handleToggleFeedbackStatus = useCallback(async (id: string, currentStatus: Feedback['status']) => {
    const nextStatus = currentStatus === 'pending' ? 'reviewed' :
                       currentStatus === 'reviewed' ? 'implemented' : 'pending';
    const updated = await updateFeedbackStatus(id, nextStatus as Feedback['status']);
    if (updated) {
      setFeedbacks(prev => prev.map(f => f.id === id ? updated : f));
    }
  }, []);

  // ── 관리자 답변 ──
  const handleAdminReply = useCallback(async (id: string, reply: string) => {
    const updated = await addAdminReply(id, reply);
    if (updated) {
      setFeedbacks(prev => prev.map(f => f.id === id ? updated : f));
      setSelectedFeedback(updated);
    }
  }, []);

  // ── 보상 지급 ──
  const handleGrantReward = useCallback(async (feedbackId: string, type: Reward['type'], label: string, value: number) => {
    if (window.confirm(`"${label}" 보상을 지급하시겠습니까?`)) {
      const updated = await grantReward(feedbackId, type, label, value);
      if (updated) {
        setFeedbacks(prev => prev.map(f => f.id === feedbackId ? updated : f));
        setSelectedFeedback(updated);
      }
    }
  }, []);

  // ── 피드백 상태 직접 설정 ──
  const handleSetFeedbackStatus = useCallback(async (id: string, status: Feedback['status']) => {
    const updated = await updateFeedbackStatus(id, status);
    if (updated) {
      setFeedbacks(prev => prev.map(f => f.id === id ? updated : f));
      setSelectedFeedback(updated);
    }
  }, []);

  // ── 탭 정보 ──
  const tabs = [
    { id: 'dashboard' as const, label: '대시보드', icon: BarChart3 },
    { id: 'users' as const, label: '유저 관리', icon: Users },
    { id: 'feedback' as const, label: '피드백', icon: MessageSquare },
  ];

  return (
    <div className="h-full bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* ===== 헤더 ===== */}
      <header
        className="shrink-0 bg-zinc-900/80 backdrop-blur-xl border-b border-white/5 px-5 flex items-center gap-3 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3"
      >
        <button
          onClick={onBack}
          title="뒤로가기"
          aria-label="뒤로가기"
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
      <div className="flex-1 overflow-y-auto no-scrollbar relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
            <p className="text-zinc-400 text-sm font-bold">데이터를 갱신 중입니다...</p>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'dashboard' && stats && <DashboardTab stats={stats} />}
            {activeTab === 'users' && (
              <UsersTab
                users={users}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onSearch={handleSearch}
                membershipFilter={membershipFilter}
                onFilterChange={handleFilterChange}
                marketingFilter={marketingFilter}
                onMarketingFilterChange={setMarketingFilter}
                expandedUser={expandedUser}
                onToggleExpand={(uid) => setExpandedUser(expandedUser === uid ? null : uid)}
                onToggleStatus={handleToggleStatus}
                getTotalPayment={getTotalPayment}
                getSubscriptionInfo={getSubscriptionInfo}
              />
            )}

            {activeTab === 'feedback' && (
              <FeedbackTab
                feedbacks={feedbacks}
                onToggleStatus={handleToggleFeedbackStatus}
                onSelectFeedback={setSelectedFeedback}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===== 피드백 상세 드로어 ===== */}
      <AnimatePresence>
        {selectedFeedback && (
          <FeedbackDetailDrawer
            key={selectedFeedback.id}
            feedback={selectedFeedback}
            onClose={() => setSelectedFeedback(null)}
            onReply={handleAdminReply}
            onReward={handleGrantReward}
            onSetStatus={handleSetFeedbackStatus}
          />
        )}
      </AnimatePresence>
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
          sub={`오늘 신규 +${stats.newUsersToday}명 / 7일 +${stats.newUsersLast7d}명`}
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
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.dailyActiveUsers / stats.totalUsers) * 100}%` }}
            transition={{ duration: 1 }}
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
                <motion.div 
                  className="w-full bg-zinc-800 rounded-xl relative overflow-hidden min-h-[4px]" 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-xl" />
                </motion.div>
                <span className="text-[8px] text-zinc-600 font-bold">{day.date}</span>
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
          <motion.div
            className="h-full bg-zinc-500"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.freeUsers / stats.totalUsers) * 100}%` }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(stats.premiumUsers / stats.totalUsers) * 100}%` }}
            transition={{ duration: 1 }}
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
  membershipFilter, onFilterChange, marketingFilter, onMarketingFilterChange, expandedUser, onToggleExpand,
  onToggleStatus, getTotalPayment, getSubscriptionInfo,
}: {
  users: AppUser[];
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onSearch: () => void;
  membershipFilter: 'all' | 'free' | 'premium' | 'premium_plus';
  onFilterChange: (v: 'all' | 'free' | 'premium' | 'premium_plus') => void;
  marketingFilter: 'all' | 'agreed' | 'disagreed';
  onMarketingFilterChange: (v: 'all' | 'agreed' | 'disagreed') => void;
  expandedUser: string | null;
  onToggleExpand: (uid: string) => void;
  onToggleStatus: (uid: string) => void;
  getTotalPayment: (user: AppUser) => number;
  getSubscriptionInfo: (user: AppUser) => { product: string; expiryDate: string; isExpired: boolean } | null;
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

      {/* 멤버십 및 마케팅 필터 */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {([
            { key: 'all' as const, label: '멤버십 전체' },
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
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {([
            { key: 'all' as const, label: '마케팅 동의 전체' },
            { key: 'agreed' as const, label: '동의함' },
            { key: 'disagreed' as const, label: '미동의' },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => onMarketingFilterChange(f.key)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all shrink-0 ${
                marketingFilter === f.key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-zinc-900 text-zinc-500 border-white/5 hover:border-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 유저 수 표시 */}
      <p className="text-[10px] text-zinc-600 font-bold px-1">{users.length}명의 유저</p>

      {/* 유저 목록 */}
      <div className="space-y-2">
        {users.map(user => {
          const memStyle = MEMBERSHIP_STYLES[user.membershipType];
          const isExpanded = expandedUser === user.uid;
          const totalPaid = getTotalPayment(user);
          const subInfo = getSubscriptionInfo(user);

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
                    {user.marketingConsent && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-400">
                        마케팅 O
                      </span>
                    )}
                    {user.status === 'suspended' && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400">정지</span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-600 truncate">{user.email}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-zinc-600">🐾 {user.petName} · {user.petBreed}</span>
                    {subInfo ? (
                      <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        {subInfo.isExpired ? '구독 만료' : '구독 중'}
                      </span>
                    ) : totalPaid > 0 ? (
                      <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        결제 ₩{totalPaid.toLocaleString()}
                      </span>
                    ) : null}
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
                        {subInfo ? (
                          <>
                            <InfoItem label="구독 현황" value={subInfo.product} />
                            <InfoItem label="만료일" value={`${subInfo.expiryDate} (${subInfo.isExpired ? '만료' : '유효'})`} />
                          </>
                        ) : (
                          <>
                            <InfoItem label="UID" value={user.uid} />
                            <InfoItem label="총 스캔" value={`${user.totalScans}회`} />
                          </>
                        )}
                        <InfoItem label="마케팅 수신동의" value={user.marketingConsent ? '동의함 (O)' : '미동의 (X)'} />
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
                      <div className="flex gap-2 pt-1 flex-wrap">
                        <button
                          onClick={() => {
                            if (window.confirm(`${user.displayName}님의 최근 결제 환불을 진행하시겠습니까?`)) {
                              alert(`[Mock 액션] ${user.displayName}님의 결제가 성공적으로 환불되었습니다.`);
                            }
                          }}
                          className="flex-1 min-w-[30%] py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        >
                          <RefreshCw className="w-3 h-3" /> 결제 환불
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`${user.displayName}님의 구독 +7일 연장을 진행하시겠습니까?`)) {
                              alert(`[Mock 액션] ${user.displayName}님의 구독이 7일 연장되었습니다.`);
                            }
                          }}
                          className="flex-1 min-w-[30%] py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        >
                          <Clock className="w-3 h-3" /> 구독 +7일
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(user.status === 'active' ? `${user.displayName}님의 계정을 정지하시겠습니까?` : `${user.displayName}님의 계정 정지를 해제하시겠습니까?`)) {
                              onToggleStatus(user.uid);
                            }
                          }}
                          className={`flex-1 min-w-[30%] py-2.5 rounded-xl text-[10px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                            user.status === 'active'
                              ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-white/5'
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
// 4. 피드백 탭
// ═══════════════════════════════════════
function FeedbackTab({ feedbacks, onToggleStatus, onSelectFeedback }: {
  feedbacks: Feedback[];
  onToggleStatus: (id: string, current: string) => void;
  onSelectFeedback: (fb: Feedback) => void;
}) {
  const getStatusStyle = (status: Feedback['status']) => {
    switch (status) {
      case 'pending': return { label: '대기중', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' };
      case 'reviewed': return { label: '확인됨', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' };
      case 'implemented': return { label: '해결됨', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
      case 'rejected': return { label: '반려됨', icon: XCircle, color: 'text-zinc-400', bg: 'bg-zinc-400/10' };
    }
  };

  const getCategoryStyle = (category: Feedback['category']) => {
    switch (category) {
      case 'bug': return { label: '버그', icon: AlertTriangle, color: 'text-rose-400' };
      case 'feature': return { label: '기능요청', icon: Star, color: 'text-violet-400' };
      case 'improvement': return { label: '개선', icon: TrendingUp, color: 'text-cyan-400' };
      case 'other': return { label: '기타', icon: MessageSquare, color: 'text-zinc-400' };
    }
  };

  return (
    <div className="p-5 space-y-4 pb-20">
      <p className="text-[10px] text-zinc-600 font-bold px-1 mb-2">총 {feedbacks.length}개의 유저 피드백</p>
      <div className="space-y-3">
        {feedbacks.map(fb => {
          const statusStyle = getStatusStyle(fb.status);
          const catStyle = getCategoryStyle(fb.category);

          return (
            <div
              key={fb.id}
              className={`bg-zinc-900 rounded-2xl border transition-all cursor-pointer hover:border-zinc-600 active:scale-[0.99] ${fb.status === 'implemented' ? 'border-emerald-500/20 opacity-70' : 'border-white/5'}`}
              onClick={() => onSelectFeedback(fb)}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex items-center gap-2 shrink-0">
                    <catStyle.icon className={`w-3.5 h-3.5 ${catStyle.color}`} />
                    <span className={`text-[9px] font-bold ${catStyle.color} uppercase tracking-wider`}>{catStyle.label}</span>
                  </div>
                  <button
                    onClick={() => onToggleStatus(fb.id, fb.status)}
                    className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md shrink-0 transition-colors ${statusStyle.bg} ${statusStyle.color} hover:bg-opacity-20`}
                  >
                    <statusStyle.icon className="w-3 h-3" />
                    {statusStyle.label}
                  </button>
                </div>
                
                <h4 className="font-bold text-sm text-white mb-2">{fb.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-3">{fb.content}</p>
                
                <div className="flex justify-between items-end mt-2 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px] font-bold">
                      {fb.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-300">{fb.userName}</p>
                      <p className="text-[8px] text-zinc-600">{fb.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fb.rewards && fb.rewards.length > 0 && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-pink-400 bg-pink-400/10 px-1.5 py-0.5 rounded-md">
                        <Gift className="w-2.5 h-2.5" /> {fb.rewards.length}
                      </span>
                    )}
                    {fb.adminReply && (
                      <span className="flex items-center gap-0.5 text-[9px] font-bold text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded-md">
                        <MessageSquare className="w-2.5 h-2.5" /> 답변
                      </span>
                    )}
                    <span className="text-[9px] text-zinc-600">상세 보기 ›</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 5. 피드백 상세 드로어 (검토 + 보상 지급)
// ═══════════════════════════════════════
function FeedbackDetailDrawer({
  feedback, onClose, onReply, onReward, onSetStatus,
}: {
  feedback: Feedback;
  onClose: () => void;
  onReply: (id: string, reply: string) => void;
  onReward: (fbId: string, type: Reward['type'], label: string, value: number) => void;
  onSetStatus: (id: string, status: Feedback['status']) => void;
}) {
  const [replyText, setReplyText] = useState(feedback.adminReply || '');
  const [showReplyInput, setShowReplyInput] = useState(!feedback.adminReply);

  // 카테고리·상태 스타일 (FeedbackTab과 동일)
  const catStyles: Record<Feedback['category'], { label: string; icon: typeof Star; color: string; bg: string }> = {
    bug: { label: '버그', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10' },
    feature: { label: '기능요청', icon: Star, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    improvement: { label: '개선', icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    other: { label: '기타', icon: MessageSquare, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  };
  const statusStyles: Record<Feedback['status'], { label: string; icon: typeof Clock; color: string; bg: string }> = {
    pending: { label: '대기중', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    reviewed: { label: '확인됨', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    implemented: { label: '해결됨', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    rejected: { label: '반려됨', icon: XCircle, color: 'text-zinc-400', bg: 'bg-zinc-400/10' },
  };

  const cat = catStyles[feedback.category];
  const st = statusStyles[feedback.status];

  // 보상 프리셋
  const REWARD_PRESETS: { type: Reward['type']; label: string; value: number; icon: typeof Gift; color: string; bg: string; desc: string }[] = [
    { type: 'premium_days', label: '프리미엄 7일', value: 7, icon: Crown, color: 'text-amber-400', bg: 'bg-amber-400/10', desc: '7일 무료 프리미엄 제공' },
    { type: 'premium_days', label: '프리미엄 30일', value: 30, icon: Crown, color: 'text-violet-400', bg: 'bg-violet-400/10', desc: '30일 무료 프리미엄 제공' },
    { type: 'scan_credits', label: '스캔 +5회', value: 5, icon: Scan, color: 'text-cyan-400', bg: 'bg-cyan-400/10', desc: '무료 스캔 5회 추가' },
    { type: 'scan_credits', label: '스캔 +10회', value: 10, icon: Scan, color: 'text-emerald-400', bg: 'bg-emerald-400/10', desc: '무료 스캔 10회 추가' },
    { type: 'coupon', label: '할인 쿠폰 20%', value: 20, icon: Gift, color: 'text-pink-400', bg: 'bg-pink-400/10', desc: '구독 20% 할인 쿠폰' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-zinc-900 rounded-t-3xl overflow-hidden border-t border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        <div className="overflow-y-auto max-h-[calc(92vh-16px)] pb-10 no-scrollbar">
          {/* ─── 헤더 ─── */}
          <div className="px-5 pt-2 pb-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg ${cat.bg} ${cat.color}`}>
                  <cat.icon className="w-3 h-3" />
                  {cat.label}
                </span>
                <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg ${st.bg} ${st.color}`}>
                  <st.icon className="w-3 h-3" />
                  {st.label}
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="닫기"
                title="닫기"
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            <h2 className="text-lg font-black text-white leading-tight">{feedback.title}</h2>
          </div>

          {/* ─── 피드백 본문 ─── */}
          <div className="px-5 mb-5">
            <div className="bg-zinc-800/50 rounded-2xl p-4 border border-white/5">
              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{feedback.content}</p>
            </div>
            <div className="flex items-center gap-2 mt-3 px-1">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-[10px] font-bold ring-1 ring-white/5">
                {feedback.userName.charAt(0)}
              </div>
              <div>
                <p className="text-[11px] font-bold text-zinc-300">{feedback.userName}</p>
                <p className="text-[9px] text-zinc-600">{feedback.createdAt} · ID: {feedback.id}</p>
              </div>
            </div>
          </div>

          {/* ─── 🎁 보상 지급 ─── */}
          <div className="px-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-pink-400 uppercase tracking-wider">보상 지급</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {REWARD_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => onReward(feedback.id, preset.type, preset.label, preset.value)}
                  className={`${preset.bg} rounded-xl p-3 border border-white/5 text-left transition-all active:scale-[0.97] hover:border-white/10`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <preset.icon className={`w-3.5 h-3.5 ${preset.color}`} />
                    <span className={`text-[11px] font-bold ${preset.color}`}>{preset.label}</span>
                  </div>
                  <p className="text-[9px] text-zinc-500">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* ─── 지급 내역 ─── */}
          {feedback.rewards && feedback.rewards.length > 0 && (
            <div className="px-5 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">지급 내역</span>
                <span className="text-[10px] text-zinc-500 ml-auto">{feedback.rewards.length}건</span>
              </div>
              <div className="space-y-1.5">
                {feedback.rewards.map(r => (
                  <div key={r.id} className="bg-emerald-500/5 rounded-xl px-3 py-2.5 flex items-center justify-between border border-emerald-500/10">
                    <div className="flex items-center gap-2">
                      <Gift className="w-3 h-3 text-emerald-400" />
                      <span className="text-[11px] font-bold text-emerald-300">{r.label}</span>
                    </div>
                    <span className="text-[9px] text-zinc-500">{r.grantedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── 관리자 답변 ─── */}
          <div className="px-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">관리자 답변</span>
            </div>
            {feedback.adminReply && !showReplyInput ? (
              <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
                <p className="text-xs text-zinc-300 leading-relaxed">{feedback.adminReply}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[9px] text-zinc-600">{feedback.repliedAt} 작성</p>
                  <button
                    onClick={() => setShowReplyInput(true)}
                    className="text-[10px] text-blue-400 font-bold hover:text-blue-300"
                  >
                    수정
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="유저에게 전달할 답변을 작성하세요..."
                  className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 border border-white/5 focus:border-blue-500/30 outline-none resize-none min-h-[80px]"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (replyText.trim()) {
                        onReply(feedback.id, replyText.trim());
                        setShowReplyInput(false);
                      }
                    }}
                    disabled={!replyText.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-[0.97] bg-blue-600 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3 h-3" />
                    답변 저장
                  </button>
                  {feedback.adminReply && (
                    <button
                      onClick={() => { setReplyText(feedback.adminReply || ''); setShowReplyInput(false); }}
                      className="px-4 py-2.5 rounded-xl text-[11px] font-bold bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ─── 상태 변경 ─── */}
          <div className="px-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">상태 변경</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['pending', 'reviewed', 'implemented', 'rejected'] as const).map(s => {
                const style = statusStyles[s];
                const isActive = feedback.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => { if (!isActive) onSetStatus(feedback.id, s); }}
                    disabled={isActive}
                    className={`flex items-center gap-1 text-[10px] font-bold px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? `${style.bg} ${style.color} ring-1 ring-current`
                        : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <style.icon className="w-3 h-3" />
                    {style.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
