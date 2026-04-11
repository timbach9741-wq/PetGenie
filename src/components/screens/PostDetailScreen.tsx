/**
 * PostDetailScreen — 게시글 상세 + 댓글 화면
 * ============================================
 * 왜 이 구조: 게시글의 전체 내용과 댓글 리스트를 보여주고,
 * 하단 고정 입력바로 실시간 댓글 작성을 지원.
 * 본인 게시글이면 삭제 버튼 표시.
 * ============================================
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Heart, MessageCircle, Trash2, Send,
  PawPrint, Flame, Clock, Loader2, AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import {
  toggleLike,
  addComment,
  getComments,
  deletePost,
  formatRelativeTime,
} from '../../services/communityService';
import type { CommunityPost, Comment } from '../../types';

interface PostDetailScreenProps {
  post: CommunityPost;
  onBack: () => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onPostDeleted?: () => void; // 삭제 후 콜백
}

const PostDetailScreen = ({ post, onBack, isLoggedIn, onLogin, onPostDeleted }: PostDetailScreenProps) => {
  const { t, i18n } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // 좋아요 상태를 로컬에서 관리 (낙관적 UI)
  const [localLikes, setLocalLikes] = useState<string[]>(post.likes);
  const [likeAnimation, setLikeAnimation] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);

  const currentUserId = auth.currentUser?.uid;
  const isAuthor = currentUserId === post.authorId;
  const isLiked = currentUserId ? localLikes.includes(currentUserId) : false;

  // 댓글 로드
  useEffect(() => {
    const loadComments = async () => {
      try {
        const result = await getComments(post.id);
        setComments(result);
      } catch (error) {
        console.error('댓글 로드 실패:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };
    loadComments();
  }, [post.id]);

  // 좋아요 핸들러
  const handleLike = async () => {
    if (!isLoggedIn) {
      onLogin();
      return;
    }
    if (!currentUserId) return;

    // 낙관적 UI 업데이트
    setLocalLikes(prev =>
      isLiked ? prev.filter(id => id !== currentUserId) : [...prev, currentUserId],
    );

    if (!isLiked) {
      setLikeAnimation(true);
      setTimeout(() => setLikeAnimation(false), 600);
    }

    try {
      await toggleLike(post.id, currentUserId, isLiked);
    } catch (error) {
      // 롤백
      console.error('좋아요 실패:', error);
      setLocalLikes(post.likes);
    }
  };

  // 댓글 작성
  const handleSendComment = async () => {
    if (!commentText.trim() || !isLoggedIn) return;

    const user = auth.currentUser;
    if (!user) return;

    setIsSendingComment(true);
    try {
      await addComment(post.id, {
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || '익명',
        text: commentText.trim(),
      });

      // 댓글 목록 갱신
      const updatedComments = await getComments(post.id);
      setComments(updatedComments);
      setCommentText('');
    } catch (error) {
      console.error('댓글 작성 실패:', error);
    } finally {
      setIsSendingComment(false);
    }
  };

  // 게시글 삭제
  const handleDelete = async () => {
    if (!currentUserId) return;

    setIsDeleting(true);
    try {
      await deletePost(post.id, currentUserId);
      onPostDeleted?.();
      onBack();
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert(t('community.delete_failed', '삭제에 실패했습니다.'));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // 산책 시간 포맷
  const formatWalkDuration = (seconds?: number) => {
    if (!seconds) return '0분';
    const mins = Math.round(seconds / 60);
    return `${mins}${i18n.language === 'ko' ? '분' : 'min'}`;
  };

  const isWalkPost = post.type === 'walk';

  return (
    <div className="h-full flex flex-col bg-zinc-50">
      {/* ── 헤더 ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors"
          title={t('common.back', '뒤로')}
          aria-label={t('common.back', '뒤로')}
        >
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="font-bold text-zinc-900">{t('community.post_detail', '게시글')}</h1>
        {/* 본인 게시글이면 삭제 버튼 */}
        {isAuthor ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 -mr-2 rounded-xl hover:bg-rose-50 transition-colors"
            title={t('community.delete', '삭제')}
            aria-label={t('community.delete', '삭제')}
          >
            <Trash2 className="w-5 h-5 text-rose-500" />
          </button>
        ) : (
          <div className="w-9" /> // 정렬용 빈 공간
        )}
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className={cn(
          "mx-0",
          isWalkPost ? "bg-gradient-to-br from-emerald-900 to-teal-900" : "bg-white",
        )}>
          {/* 게시글 헤더 */}
          <div className="flex items-center gap-3 p-5 pb-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center font-bold text-base",
              isWalkPost ? "bg-emerald-700 text-emerald-200" : "bg-emerald-100 text-emerald-700",
            )}>
              {(post.petName || post.authorName || '?')[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={cn("font-bold", isWalkPost ? "text-white" : "text-zinc-900")}>
                  {post.petName || post.authorName}
                </span>
                {post.petBreed && (
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-lg",
                    isWalkPost ? "bg-emerald-700/50 text-emerald-300" : "bg-zinc-100 text-zinc-500",
                  )}>
                    {post.petBreed}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Clock className={cn("w-3.5 h-3.5", isWalkPost ? "text-emerald-400" : "text-zinc-400")} />
                <span className={cn("text-xs", isWalkPost ? "text-emerald-400" : "text-zinc-400")}>
                  {formatRelativeTime(post.createdAt, i18n.language)}
                </span>
              </div>
            </div>
          </div>

          {/* 이미지 */}
          {post.imageUrl && (
            <div className="px-5 pb-3">
              <img
                src={post.imageUrl}
                alt="pet photo"
                className="w-full rounded-2xl object-cover"
              />
            </div>
          )}

          {/* 산책 인증 카드 */}
          {isWalkPost && (
            <div className="px-5 pb-3">
              <div className="bg-emerald-800/50 rounded-2xl p-6 border border-emerald-600/30 text-center">
                <PawPrint className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <div className="text-3xl font-black text-white mb-1">
                  {formatWalkDuration(post.walkDuration)}
                </div>
                <div className="text-emerald-400 text-sm font-bold">
                  {t('community.walked_for_label', '산책 완료!')}
                </div>
                {(post.walkStreak ?? 0) > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-3">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-300 text-sm font-bold">
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
              "px-5 pb-4 text-base leading-relaxed",
              isWalkPost ? "text-emerald-100" : "text-zinc-800",
            )}>
              {post.text}
            </p>
          )}

          {/* 좋아요 / 댓글 액션 바 */}
          <div className={cn(
            "flex items-center gap-5 px-5 py-4 border-t",
            isWalkPost ? "border-emerald-700/30" : "border-zinc-100",
          )}>
            <button
              onClick={handleLike}
              className="flex items-center gap-2 relative"
              title={t('community.like', '좋아요')}
              aria-label={t('community.like', '좋아요')}
            >
              <AnimatePresence>
                {likeAnimation && (
                  <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                  </motion.div>
                )}
              </AnimatePresence>
              <Heart
                className={cn(
                  "w-6 h-6 transition-colors",
                  isLiked ? "text-rose-500 fill-rose-500" : (isWalkPost ? "text-emerald-400" : "text-zinc-400"),
                )}
              />
              <span className={cn(
                "text-base font-bold",
                isLiked ? "text-rose-500" : (isWalkPost ? "text-emerald-400" : "text-zinc-400"),
              )}>
                {localLikes.length}
              </span>
            </button>
            <div className="flex items-center gap-2">
              <MessageCircle className={cn("w-6 h-6", isWalkPost ? "text-emerald-400" : "text-zinc-400")} />
              <span className={cn("text-base font-bold", isWalkPost ? "text-emerald-400" : "text-zinc-400")}>
                {comments.length}
              </span>
            </div>
          </div>
        </div>

        {/* ── 댓글 섹션 ── */}
        <div className="bg-white mt-2">
          <div className="px-5 py-3 border-b border-zinc-100">
            <h2 className="font-bold text-sm text-zinc-700">
              {t('community.comments', '댓글 {{count}}개', { count: comments.length })}
            </h2>
          </div>

          {isLoadingComments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-8 text-center">
              <MessageCircle className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
              <p className="text-sm text-zinc-400">{t('community.no_comments', '아직 댓글이 없습니다')}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {comments.map((comment) => (
                <div key={comment.id} className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-zinc-500">
                        {(comment.authorName || '?')[0]}
                      </span>
                    </div>
                    <span className="font-bold text-sm text-zinc-800">{comment.authorName}</span>
                    <span className="text-xs text-zinc-400">
                      {formatRelativeTime(comment.createdAt, i18n.language)}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 mt-1 ml-9 leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 댓글 입력 (하단 고정) ── */}
      <div className="sticky bottom-0 bg-white border-t border-zinc-100 px-4 py-3 flex items-center gap-2 z-20">
        {isLoggedIn ? (
          <>
            <input
              ref={commentInputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              placeholder={t('community.comment_placeholder', '댓글을 입력해주세요...')}
              className="flex-1 bg-zinc-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 placeholder:text-zinc-400"
              maxLength={200}
            />
            <button
              onClick={handleSendComment}
              disabled={!commentText.trim() || isSendingComment}
              className={cn(
                "p-2.5 rounded-xl transition-all",
                commentText.trim()
                  ? "bg-emerald-600 text-white hover:bg-emerald-500"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed",
              )}
              title={t('community.send', '전송')}
              aria-label={t('community.send', '전송')}
            >
              {isSendingComment ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onLogin}
            className="w-full text-center text-sm text-emerald-600 font-bold py-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            {t('community.login_to_comment', '로그인하고 댓글 남기기')}
          </button>
        )}
      </div>

      {/* ── 삭제 확인 모달 ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-xs text-center shadow-xl"
            >
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-zinc-900 mb-2">
                {t('community.delete_confirm', '게시글을 삭제할까요?')}
              </h3>
              <p className="text-sm text-zinc-500 mb-5">
                {t('community.delete_warn', '삭제된 게시글은 복구할 수 없습니다.')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-zinc-100 text-zinc-700 py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors"
                >
                  {t('common.cancel', '취소')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold text-sm hover:bg-rose-400 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? t('community.deleting', '삭제 중...') : t('community.delete', '삭제')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostDetailScreen;
