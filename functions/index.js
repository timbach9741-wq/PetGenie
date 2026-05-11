const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

/**
 * 게시글에 좋아요가 추가되었을 때 알림 생성
 * 트리거: community_posts/{postId} 문서 업데이트
 */
exports.onPostLiked = functions.firestore
  .document('community_posts/{postId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    const beforeLikes = beforeData.likes || [];
    const afterLikes = afterData.likes || [];

    // 좋아요가 새로 추가된 유저들 찾기
    const newLikes = afterLikes.filter(userId => !beforeLikes.includes(userId));

    if (newLikes.length === 0) {
      return null;
    }

    const postId = context.params.postId;
    const authorId = afterData.authorId;

    // 여러 명이 동시에 좋아요를 누를 수도 있으므로 각각 처리
    const promises = newLikes.map(async (likerId) => {
      // 본인이 본인 글에 좋아요 누른 경우는 제외
      if (likerId === authorId) return null;

      // 유저 정보 가져오기 (알림에 이름을 표시하기 위함)
      const userSnap = await db.collection('users').doc(likerId).get();
      const likerName = userSnap.exists ? (userSnap.data().displayName || '사용자') : '사용자';

      // 알림 문서 생성
      return db.collection('notifications').add({
        recipientId: authorId,
        senderId: likerId,
        senderName: likerName,
        type: 'like',
        targetId: postId,
        message: '회원님의 게시글을 좋아합니다.',
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    return Promise.all(promises);
  });

/**
 * 게시글에 댓글이 작성되었을 때 알림 생성
 * 트리거: community_posts/{postId}/comments/{commentId} 문서 생성
 */
exports.onCommentAdded = functions.firestore
  .document('community_posts/{postId}/comments/{commentId}')
  .onCreate(async (snap, context) => {
    const commentData = snap.data();
    const postId = context.params.postId;

    const senderId = commentData.authorId;
    const senderName = commentData.authorName || '사용자';
    const text = commentData.text || '';

    // 게시글 정보 가져오기 (작성자 ID 필요)
    const postSnap = await db.collection('community_posts').doc(postId).get();
    
    if (!postSnap.exists) {
      return null;
    }

    const postData = postSnap.data();
    const recipientId = postData.authorId;

    // 본인이 본인 글에 댓글을 작성한 경우는 제외
    if (senderId === recipientId) {
      return null;
    }

    const truncatedText = text.length > 20 ? text.substring(0, 20) + '...' : text;

    // 알림 문서 생성
    return db.collection('notifications').add({
      recipientId: recipientId,
      senderId: senderId,
      senderName: senderName,
      type: 'comment',
      targetId: postId,
      message: `댓글을 남겼습니다: ${truncatedText}`,
      isRead: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

/**
 * 새 유저가 가입했을 때 텔레그램으로 알림 전송
 * 트리거: functions.auth.user().onCreate()
 */
exports.onUserCreated = functions.auth.user().onCreate((user) => {
  // 환경변수(.env)에서 텔레그램 봇 토큰과 채팅방 ID를 가져옵니다.
  const botToken = process.env.TELEGRAM_BOT_TOKEN || (functions.config().telegram && functions.config().telegram.token);
  const chatId = process.env.TELEGRAM_CHAT_ID || (functions.config().telegram && functions.config().telegram.chatid);

  if (!botToken || !chatId) {
    console.log("텔레그램 봇 토큰 또는 채팅방 ID가 설정되지 않았습니다.");
    return null;
  }

  const email = user.email || '이메일 없음';
  const displayName = user.displayName || '이름 없음';
  const provider = user.providerData && user.providerData.length > 0 
    ? user.providerData[0].providerId 
    : '알 수 없음';

  const message = `🚀 [펫지니] 신규 가입 알림\n\n👤 이름: ${displayName}\n📧 이메일: ${email}\n🔑 가입경로: ${provider}\n🆔 UID: ${user.uid}`;

  const https = require('https');
  const data = JSON.stringify({
    chat_id: chatId,
    text: message,
  });

  const options = {
    hostname: 'api.telegram.org',
    port: 443,
    path: `/bot${botToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log("텔레그램 알림 전송 성공");
          resolve('Success');
        } else {
          console.error("텔레그램 API 에러:", responseBody);
          reject(new Error(`API Error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error("텔레그램 전송 중 오류 발생:", e);
      reject(e);
    });

    req.write(data);
    req.end();
  });
});
