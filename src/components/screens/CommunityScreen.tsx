/**
 * CommunityScreen — 커뮤니티 피드 메인 화면
 * ============================================
 * 왜 이 구조: 인스타그램 스타일의 카드형 피드로, 반려견 사진 공유 + 산책 인증을 한 곳에서 볼 수 있음.
 * 비로그인 유저도 열람 가능하되, 글쓰기/좋아요는 로그인 필요.
 * ============================================
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PenSquare, Heart, MessageCircle, Trophy, PawPrint,
  Flame, Clock, ArrowLeft, RefreshCw, LogIn, MoreVertical, ShieldAlert, Ban, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import {
  getPosts,
  getPostById,
  toggleLike,
  getWeeklyRanking,
  formatRelativeTime,
  getBlockedUsers,
  blockUser,
  reportContent,
} from '../../services/communityService';
import { subscribeToUnreadNotificationsCount } from '../../services/notificationService';
import type { Screen, CommunityPost, WalkRankingEntry } from '../../types';
import { NotificationListModal } from '../modals/NotificationListModal';

interface CommunityScreenProps {
  onNavigate: (screen: Screen) => void;
  onSelectPost: (post: CommunityPost) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onBack: () => void;
}

const CommunityScreen = ({ onNavigate, onSelectPost, isLoggedIn, onLogin, onBack }: CommunityScreenProps) => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<'all' | 'walk'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [ranking, setRanking] = useState<WalkRankingEntry[]>([]);
  // 좋아요 애니메이션 상태 (postId → boolean)
  const [likeAnimations, setLikeAnimations] = useState<Record<string, boolean>>({});
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 피드 데이터 로드
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUserId = auth.currentUser?.uid;
      let blocks: string[] = [];
      if (currentUserId) {
        blocks = await getBlockedUsers(currentUserId);
        setBlockedUsers(blocks);
      }

      const { posts: newPosts } = await getPosts(filter, 20);
      setPosts(newPosts.filter(p => !blocks.includes(p.authorId)));
    } catch (error) {
      console.error('커뮤니티 피드 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadPosts();
    // 랭킹은 비동기로드
    const loadRanking = async () => {
      const data = await getWeeklyRanking();
      setRanking(data);
    };
    loadRanking();
  }, [loadPosts]);

  // 안읽은 알림 구독
  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId || !isLoggedIn) return;

    const unsubscribe = subscribeToUnreadNotificationsCount(currentUserId, (count) => {
      setUnreadCount(count);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  // 좋아요 핸들러
  const handleLike = async (post: CommunityPost, e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지

    if (!isLoggedIn) {
      onLogin();
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const isLiked = post.likes.includes(userId);

    // 낙관적 UI 업데이트 (서버 응답 전에 즉시 반영)
    setPosts(prev =>
      prev.map(p =>
        p.id === post.id
          ? {
              ...p,
              likes: isLiked
                ? p.likes.filter(id => id !== userId)
                : [...p.likes, userId],
            }
          : p,
      ),
    );

    // 좋아요 애니메이션 트리거
    if (!isLiked) {
      setLikeAnimations(prev => ({ ...prev, [post.id]: true }));
      setTimeout(() => {
        setLikeAnimations(prev => ({ ...prev, [post.id]: false }));
      }, 600);
    }

    try {
      const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || '익명';
      await toggleLike(post.id, userId, userName, isLiked);
    } catch (error) {
      // 실패 시 롤백
      console.error('좋아요 토글 실패:', error);
      loadPosts();
    }
  };

  // 신고 핸들러
  const handleReport = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) return onLogin();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;
    
    const reason = window.prompt(t('community.report_reason', '신고 사유를 입력해주세요.'));
    if (!reason) return;

    try {
      await reportContent(currentUserId, 'post', postId, reason);
      alert(t('community.report_success', '신고가 접수되었습니다. 관리자 검토 후 조치됩니다.'));
      setActiveMenuPostId(null);
    } catch (error) {
      console.error('신고 실패:', error);
    }
  };

  // 차단 핸들러
  const handleBlock = async (authorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) return onLogin();
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    if (!window.confirm(t('community.block_confirm', '이 사용자를 차단하시겠습니까? 차단하면 이 사용자의 글이 더 이상 보이지 않습니다.'))) return;
    
    try {
      await blockUser(currentUserId, authorId);
      alert(t('community.block_success', '해당 사용자가 차단되었습니다.'));
      setActiveMenuPostId(null);
      loadPosts(); // 피드 리로드
    } catch (error) {
      console.error('차단 실패:', error);
    }
  };

  // 산책 시간 포맷 (초 → "XX분")
  const formatWalkDuration = (seconds?: number) => {
    if (!seconds) return '0분';
    const mins = Math.round(seconds / 60);
    return `${mins}${i18n.language === 'ko' ? '분' : 'min'}`;
  };

  const currentUserId = auth.currentUser?.uid;

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      {/* ── 헤더 ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-zinc-100 px-5 pt-[calc(env(safe-area-inset-top,0px)+44px)] pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              aria-label={t('common.back', '뒤로가기')}
              className="p-2 -ml-2 mr-1 text-zinc-900 hover:bg-zinc-100 rounded-full transition-transform active:scale-90"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <PawPrint className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-zinc-900">{t('community.title', '커뮤니티')}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* 새로고침 */}
            <button
              onClick={loadPosts}
              className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
              title={t('common.refresh', '새로고침')}
              aria-label={t('common.refresh', '새로고침')}
            >
              <RefreshCw className={cn("w-5 h-5 text-zinc-500", isLoading && "animate-spin")} />
            </button>
            {/* 알림 버튼 (로그인 시) */}
            {isLoggedIn && (
              <button
                onClick={() => setShowNotificationModal(true)}
                className="p-2 rounded-xl hover:bg-zinc-100 transition-colors relative"
                aria-label={t('community.notifications', '알림')}
              >
                <Bell className="w-5 h-5 text-zinc-600" />
                {/* 미확인 알림 배지 */}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                )}
              </button>
            )}
            {/* 글쓰기 */}
            {isLoggedIn && (
              <button
                onClick={() => onNavigate('community-post')}
                className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-sm font-bold hover:bg-emerald-500 transition-colors"
                title={t('community.new_post', '글쓰기')}
                aria-label={t('community.new_post', '글쓰기')}
              >
                <PenSquare className="w-4 h-4" />
                <span>{t('community.new_post', '글쓰기')}</span>
              </button>
            )}
          </div>
        </div>

        {/* ── 필터 탭 ── */}
        <div className="flex gap-2 mt-3">
          {(['all', 'walk'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                filter === f
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
              )}
            >
              {f === 'all' ? t('community.tab_all', '전체') : `🏃 ${t('community.tab_walk', '산책 인증')}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── 콘텐츠 영역 ── */}
      <div className="flex-1 overflow-y-auto">
        {/* ── 주간 산책 랭킹 배너 ── */}
        {ranking.length > 0 && filter === 'all' && (
          <div className="px-4 pt-4 pb-2">
            <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-2xl p-4 shadow-lg shadow-orange-200/50">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm">{t('community.ranking_title', '이번 주 산책왕 🏆')}</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {ranking.slice(0, 3).map((entry, i) => (
                  <div
                    key={entry.userId}
                    className="flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 min-w-[100px]"
                  >
                    <div className="text-white/80 text-xs font-bold">{['🥇', '🥈', '🥉'][i]}</div>
                    <div className="text-white font-bold text-sm mt-0.5">
                      {entry.petName}
                    </div>
                    <div className="text-white/90 text-xs">{entry.totalMinutes}{t('community.ranking_min', 'min')}</div>
                    {entry.streak >= 3 && (
                      <div className="flex items-center gap-0.5 mt-1">
                        <Flame className="w-3 h-3 text-yellow-200" />
                        <span className="text-yellow-200 text-[10px] font-bold">{entry.streak}{t('community.ranking_streak', 'd streak')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 비로그인 배너 ── */}
        {!isLoggedIn && (
          <div className="mx-4 mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-800">{t('community.login_required', '로그인이 필요합니다')}</p>
              <p className="text-xs text-emerald-600 mt-0.5">{t('community.login_required_desc', '커뮤니티를 이용하려면 로그인해주세요')}</p>
            </div>
            <button
              onClick={onLogin}
              className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('auth.login_button', '로그인')}</span>
            </button>
          </div>
        )}

        {/* ── 게시글 목록 ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-8">
            <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <PawPrint className="w-10 h-10 text-zinc-300" />
            </div>
            <p className="text-zinc-500 font-bold">{t('community.empty_title', '첫 번째 게시글을 작성해보세요!')}</p>
            <p className="text-zinc-400 text-sm mt-1">{t('community.empty_desc', '반려견 사진이나 산책 기록을 공유하세요')}</p>
            {isLoggedIn && (
              <button
                onClick={() => onNavigate('community-post')}
                className="mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-500 transition-colors"
              >
                {t('community.new_post', '글쓰기')}
              </button>
            )}
          </div>
        ) : (
          <div className="px-4 pt-3 pb-32 space-y-4">
            <AnimatePresence>
              {posts.map((post, index) => {
                const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
                const isWalkPost = post.type === 'walk';

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onSelectPost(post)}
                    className={cn(
                      "rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.98]",
                      isWalkPost
                        ? "bg-gradient-to-br from-emerald-900 to-teal-900 shadow-lg shadow-emerald-200/30"
                        : "bg-white shadow-sm border border-zinc-100",
                    )}
                  >
                    {/* 게시글 헤더 */}
                    <div className="flex items-center gap-3 p-4 pb-2">
                      {/* 프로필 아바타 (이니셜) */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                        isWalkPost ? "bg-emerald-700 text-emerald-200" : "bg-emerald-100 text-emerald-700",
                      )}>
                        {(post.petName || post.authorName || '?')[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "font-bold text-sm truncate",
                            isWalkPost ? "text-white" : "text-zinc-900",
                          )}>
                            {post.petName || post.authorName}
                          </span>
                          {post.petBreed && (
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded-md",
                              isWalkPost ? "bg-emerald-700/50 text-emerald-300" : "bg-zinc-100 text-zinc-500",
                            )}>
                              {post.petBreed}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className={cn("w-3 h-3", isWalkPost ? "text-emerald-400" : "text-zinc-400")} />
                          <span className={cn("text-xs", isWalkPost ? "text-emerald-400" : "text-zinc-400")}>
                            {formatRelativeTime(post.createdAt, i18n.language)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* 산책 인증 배지 */}
                        {isWalkPost && (
                          <div className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                            🏃 WALK
                          </div>
                        )}
                        {/* 더보기 메뉴 (본인 글이 아닐 때만) */}
                        {currentUserId && currentUserId !== post.authorId && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id);
                              }}
                              className="p-1 -mr-1 rounded-full hover:bg-zinc-100/20 transition-colors"
                            >
                              <MoreVertical className={cn("w-5 h-5", isWalkPost ? "text-emerald-100" : "text-zinc-400")} />
                            </button>
                            
                            <AnimatePresence>
                              {activeMenuPostId === post.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-zinc-100 z-50 overflow-hidden"
                                >
                                  <button
                                    onClick={(e) => handleReport(post.id, e)}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                                  >
                                    <ShieldAlert className="w-4 h-4" />
                                    <span>{t('community.report', '신고하기')}</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleBlock(post.authorId, e)}
                                    className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-zinc-600 hover:bg-zinc-50 transition-colors border-t border-zinc-100"
                                  >
                                    <Ban className="w-4 h-4" />
                                    <span>{t('community.block_user', '작성자 차단')}</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 이미지 영역 (일반 게시글만) */}
                    {post.imageUrl && (
                      <div className="px-4 pb-2">
                        <img
                          src={post.imageUrl}
                          alt="pet photo"
                          className="w-full aspect-square object-cover rounded-xl"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* 산책 인증 카드 (산책 게시글만) */}
                    {isWalkPost && (
                      <div className="px-4 pb-2">
                        <div className="bg-emerald-800/50 rounded-xl p-4 border border-emerald-600/30">
                          <div className="flex items-center justify-center gap-3">
                            <PawPrint className="w-8 h-8 text-emerald-400" />
                            <div className="text-center">
                              <div className="text-2xl font-black text-white">
                                {formatWalkDuration(post.walkDuration)}
                              </div>
                              <div className="text-emerald-400 text-xs font-bold mt-0.5">
                                {t('community.walked_for_label', '산책 완료!')}
                              </div>
                            </div>
                          </div>
                          {(post.walkStreak ?? 0) > 1 && (
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <Flame className="w-4 h-4 text-orange-400" />
                              <span className="text-orange-300 text-xs font-bold">
                                {t('community.streak', '연속 {{days}}일째 산책 중!', { days: post.walkStreak })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 텍스트 */}
                    {post.text && (
                      <p className={cn(
                        "px-4 pb-2 text-sm leading-relaxed",
                        isWalkPost ? "text-emerald-100" : "text-zinc-700",
                      )}>
                        {post.text}
                      </p>
                    )}

                    {/* 좋아요 / 댓글 액션 바 */}
                    <div className={cn(
                      "flex items-center gap-4 px-4 py-3 border-t",
                      isWalkPost ? "border-emerald-700/30" : "border-zinc-50",
                    )}>
                      {/* 좋아요 버튼 */}
                      <button
                        onClick={(e) => handleLike(post, e)}
                        className="flex items-center gap-1.5 relative"
                        title={t('community.like', '좋아요')}
                        aria-label={t('community.like', '좋아요')}
                      >
                        <AnimatePresence>
                          {likeAnimations[post.id] && (
                            <motion.div
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <Heart
                          className={cn(
                            "w-5 h-5 transition-colors",
                            isLiked ? "text-rose-500 fill-rose-500" : (isWalkPost ? "text-emerald-400" : "text-zinc-400"),
                          )}
                        />
                        <span className={cn(
                          "text-sm font-bold",
                          isLiked ? "text-rose-500" : (isWalkPost ? "text-emerald-400" : "text-zinc-400"),
                        )}>
                          {post.likes.length > 0 ? post.likes.length : ''}
                        </span>
                      </button>

                      {/* 댓글 */}
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className={cn("w-5 h-5", isWalkPost ? "text-emerald-400" : "text-zinc-400")} />
                        <span className={cn("text-sm font-bold", isWalkPost ? "text-emerald-400" : "text-zinc-400")}>
                          {post.commentCount > 0 ? post.commentCount : ''}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── 글쓰기 FAB (플로팅 버튼, 모바일용) ── */}
      {isLoggedIn && posts.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onNavigate('community-post')}
          className="fixed bottom-24 right-5 w-14 h-14 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-300/40 flex items-center justify-center z-30 [-webkit-tap-highlight-color:transparent]"
          title={t('community.new_post', '글쓰기')}
          aria-label={t('community.new_post', '글쓰기')}
        >
          <PenSquare className="w-6 h-6" />
        </motion.button>
      )}

      {/* --- 모달 영역 --- */}
      {showNotificationModal && (
        <NotificationListModal
          onClose={() => setShowNotificationModal(false)}
          onNavigateToPost={async (postId) => {
            let post = posts.find(p => p.id === postId);
            if (!post) {
              // 피드에 없는 옛날 게시글인 경우 DB에서 직접 조회
              post = await getPostById(postId) || undefined;
            }
            if (post) {
              onSelectPost(post);
              setShowNotificationModal(false);
            } else {
              alert(t('community.post_not_found', '해당 게시글을 찾을 수 없거나 삭제되었습니다.'));
            }
          }}
        />
      )}
    </div>
  );
};

export default CommunityScreen;
