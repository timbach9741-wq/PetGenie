import { PushNotifications, Token, ActionPerformed, PushNotificationSchema } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { db, auth } from '../lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';

export interface AppNotification {
  id: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: 'comment' | 'like';
  postId: string;
  postTitle?: string;
  message: string;
  read: boolean;
  createdAt: any;
}

// FCM 토큰을 기기에서 발급받아 Firestore에 저장합니다.
export const registerPushNotifications = async () => {
  if (Capacitor.getPlatform() === 'web') {
    console.log('Web environment: Push notifications are only fully supported on physical Android/iOS devices.');
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    // 권한 요청
    let permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.warn('사용자가 푸시 알림 권한을 거부했습니다.');
      return;
    }

    // 채널 생성 (Android 8.0 이상 필수)
    if (Capacitor.getPlatform() === 'android') {
      await PushNotifications.createChannel({
        id: 'default',
        name: 'Default',
        description: '기본 알림 채널',
        importance: 4,
        vibration: true,
      });
    }

    // 리스너 등록
    PushNotifications.addListener('registration', async (token: Token) => {
      console.log('FCM Token generated:', token.value);
      // Firestore users 컬렉션에 토큰 저장
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        fcmToken: token.value,
        updatedAt: serverTimestamp()
      }, { merge: true });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('FCM Token generation error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received in foreground:', notification);
      // 여기서 앱 내 토스트 알림을 띄우거나 상태를 업데이트 할 수 있습니다.
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed:', action);
      // 알림 클릭 시 특정 화면으로 이동하는 로직을 추가할 수 있습니다.
    });

    // FCM 등록 실행
    await PushNotifications.register();
  } catch (error) {
    console.error('푸시 알림 초기화 중 오류 발생:', error);
  }
};

// 알림 내역 생성 (Firestore) - Cloud Functions가 없을 경우 클라이언트에서 기록용으로 사용
export const createNotification = async (
  recipientId: string,
  senderId: string,
  senderName: string,
  type: 'comment' | 'like',
  postId: string,
  message: string
) => {
  if (recipientId === senderId) return; // 자기 자신에게는 알림을 보내지 않음
  try {
    const notifRef = collection(db, 'notifications');
    await addDoc(notifRef, {
      recipientId,
      senderId,
      senderName,
      type,
      postId,
      message,
      read: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('알림 생성 실패:', error);
  }
};

// 유저의 알림 목록 가져오기
export const getUserNotifications = async (userId: string): Promise<AppNotification[]> => {
  try {
    const notifRef = collection(db, 'notifications');
    const q = query(
      notifRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AppNotification[];
  } catch (error) {
    console.error('알림 목록 조회 실패:', error);
    return [];
  }
};

// 알림 읽음 처리
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
  } catch (error) {
    console.error('알림 읽음 처리 실패:', error);
  }
};

// 읽지 않은 알림 개수 실시간 구독
export const subscribeToUnreadNotificationsCount = (userId: string, callback: (count: number) => void) => {
  const notifRef = collection(db, 'notifications');
  const q = query(
    notifRef,
    where('recipientId', '==', userId),
    where('read', '==', false)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  }, (error) => {
    console.error('읽지 않은 알림 개수 구독 실패:', error);
    callback(0);
  });
};
