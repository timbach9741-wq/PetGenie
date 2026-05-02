import React, { useState, useEffect } from 'react';
import { X, Bell, User, MessageCircle, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserNotifications, markNotificationAsRead, AppNotification } from '../../services/notificationService';
import { auth } from '../../lib/firebase';
import { formatRelativeTime } from '../../services/communityService';
import { cn } from '../../lib/utils';

interface NotificationListModalProps {
  onClose: () => void;
  onNavigateToPost: (postId: string) => void;
}

export function NotificationListModal({ onClose, onNavigateToPost }: NotificationListModalProps) {
  const { t, i18n } = useTranslation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const notifs = await getUserNotifications(user.uid);
        setNotifications(notifs);
      } catch (error) {
        console.error('알림 로드 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadNotifications();
  }, []);

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read) {
      await markNotificationAsRead(notif.id);
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    onNavigateToPost(notif.postId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white w-full sm:w-[400px] h-[80vh] sm:h-[600px] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col animate-slide-up sm:animate-fade-in overflow-hidden">
        
        {/* 헤더 */}
        <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-zinc-900">{t('community.notifications', '알림')}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t('common.close', '닫기')}
            className="p-2 -mr-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto bg-zinc-50">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 gap-3">
              <Bell className="w-12 h-12 text-zinc-200" />
              <p>{t('community.no_notifications', '새로운 알림이 없습니다.')}</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-zinc-100 transition-colors flex gap-3 items-start",
                    !notif.read ? "bg-white" : "bg-zinc-50 opacity-70"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1",
                    notif.type === 'like' ? "bg-rose-100 text-rose-500" : "bg-emerald-100 text-emerald-500"
                  )}>
                    {notif.type === 'like' ? <Heart className="w-5 h-5 fill-current" /> : <MessageCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900">
                      <span className="font-bold">{notif.senderName}</span>
                      {notif.type === 'like' ? 
                        t('community.notif_like', '님이 회원님의 게시글을 좋아합니다.') : 
                        t('community.notif_comment', '님이 회원님의 게시글에 댓글을 남겼습니다.')
                      }
                    </p>
                    {notif.message && notif.type === 'comment' && (
                      <p className="text-sm text-zinc-500 mt-1 truncate">"{notif.message}"</p>
                    )}
                    <p className="text-xs text-zinc-400 mt-1">
                      {formatRelativeTime(notif.createdAt, i18n.language)}
                    </p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
