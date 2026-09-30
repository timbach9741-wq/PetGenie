const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { GoogleAuth } = require('google-auth-library');

admin.initializeApp();
const db = admin.firestore();

/**
 * 클라이언트가 Gemini API를 직접 호출하면 앱 번들에 키가 그대로 노출되어
 * 구글 자동 스캐너에 유출로 탐지·차단되는 사고가 실제로 있었음(2026-09-18).
 * 로그인한 사용자만 이 프록시를 거쳐 Gemini를 호출하도록 하여 키를 서버(Secret Manager)에만 둔다.
 *
 * v2(onCall, Cloud Run 기반) 대신 v1 스타일을 쓰는 이유: v2로 배포했을 때 Cloud Run의
 * 공개 호출 IAM(allUsers invoker)이 자동으로 안 붙어 "Empty Authorization header" 오류가
 * 계속 발생했음(조직 정책 등으로 추정). v1 콜러블은 Cloud Functions Gen1 인프라라
 * 이 문제 없이 기본적으로 정상 동작함.
 */
// 요청 모델이 바쁠 때(503/429) 순서대로 대신 시도할 모델. "latest" 별칭은 계정 종류와 상관없이 항상 유효하다.
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash'];

// ── 무료 사용 한도 ──
// 앱(App.tsx)의 FREE_FOR_ALL_END_DATE와 같은 값이어야 한다. 이 날짜 전에는 모두 무제한(성장 단계 무료 개방).
// 결제 기능 출시일에 양쪽을 함께 바꾼다.
const FREE_FOR_ALL_END = new Date('2027-01-01T00:00:00+09:00');
// 무료 회원 한도: 사진 스캔 월 3회, AI 수의사 하루 3회(+광고 시청 보너스 하루 최대 3회).
const FREE_LIMITS = { scan: 3, vet: 3 };
const MAX_AD_BONUS_PER_DAY = 3;

// 한국 시간 기준 기간 키 (스캔은 월, 상담은 일 단위로 초기화)
function periodKey(kind, now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString();
  return kind === 'scan' ? `scan-${kst.slice(0, 7)}` : `vet-${kst.slice(0, 10)}`;
}

// ── Google Play 구독 확인 ──
// 서버(이 함수의 서비스 계정)가 Google Play Developer API로 구매 토큰을 직접 확인한다.
// Play Console > 사용자 및 권한에 이 프로젝트의 App Engine 기본 서비스 계정을 "재무 데이터 보기, 주문 및 구독 관리" 권한으로 추가해야 동작한다.
const PACKAGE_NAME = 'com.petgenie.official';
const SUBSCRIPTION_PRODUCT_ID = 'petgenie_premium';
// 해지 예약(CANCELED)이어도 만료일까지는 이용 가능
const ENTITLED_STATES = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD', 'SUBSCRIPTION_STATE_CANCELED'];

const playAuth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/androidpublisher'] });
async function playApi(path, method = 'GET') {
  const client = await playAuth.getClient();
  const res = await client.request({
    url: `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE_NAME}/${path}`,
    method,
  });
  return res.data;
}

const tokenDocId = (purchaseToken) => crypto.createHash('sha256').update(purchaseToken).digest('hex');

/**
 * 구매 토큰을 구글에 확인하고 users/{uid}.premiumUntil을 만료일로 갱신한다.
 * 같은 토큰을 다른 계정이 쓰려 하면 거절한다(구매 공유·도용 방지).
 */
async function syncSubscription(uid, purchaseToken) {
  const sub = await playApi(`purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`);
  const owner = sub.externalAccountIdentifiers && sub.externalAccountIdentifiers.obfuscatedExternalAccountId;
  if (owner && owner !== uid) {
    throw new functions.https.HttpsError('permission-denied', '다른 계정으로 구매한 구독입니다.');
  }
  const item = (sub.lineItems || []).find((li) => li.productId === SUBSCRIPTION_PRODUCT_ID);
  if (!item || !item.expiryTime) {
    throw new functions.https.HttpsError('invalid-argument', '펫지니 구독 구매가 아닙니다.');
  }
  const expiry = new Date(item.expiryTime);
  const active = ENTITLED_STATES.includes(sub.subscriptionState) && expiry.getTime() > Date.now();

  const tokenRef = db.collection('subscriptions').doc(tokenDocId(purchaseToken));
  const userRef = db.collection('users').doc(uid);
  await db.runTransaction(async (tx) => {
    const [tokenSnap, userSnap] = await Promise.all([tx.get(tokenRef), tx.get(userRef)]);
    if (tokenSnap.exists && tokenSnap.data().uid !== uid) {
      throw new functions.https.HttpsError('permission-denied', '다른 계정에 연결된 구독입니다.');
    }
    tx.set(tokenRef, {
      uid,
      purchaseToken,
      basePlanId: (item.offerDetails && item.offerDetails.basePlanId) || null,
      state: sub.subscriptionState,
      expiryTime: admin.firestore.Timestamp.fromDate(expiry),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    const userUpdate = { subscriptionTokenId: tokenRef.id };
    if (active) {
      // 기존 사용자 무료 기간(premiumUntil 12/31) 같은 더 긴 기간이 있으면 줄이지 않는다.
      const current = userSnap.exists && userSnap.data().premiumUntil ? userSnap.data().premiumUntil.toDate() : null;
      if (!current || current.getTime() < expiry.getTime()) {
        userUpdate.premiumUntil = admin.firestore.Timestamp.fromDate(expiry);
      }
    }
    tx.set(userRef, userUpdate, { merge: true });
  });

  // 3일 안에 확인(acknowledge)하지 않으면 구글이 자동 환불한다.
  if (sub.acknowledgementState === 'ACKNOWLEDGEMENT_STATE_PENDING') {
    await playApi(`purchases/subscriptions/${SUBSCRIPTION_PRODUCT_ID}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, 'POST');
  }
  return { active, expiry };
}

// 실제 결제 회원 여부. premiumUntil은 결제 확인 후 서버만 기록한다(firestore.rules protectedUserFields).
// 만료일이 지났지만 연결된 구독이 있으면 구글에 다시 확인한다(자동 갱신 반영).
async function isPaidMember(uid) {
  const snap = await db.collection('users').doc(uid).get();
  const data = snap.exists ? snap.data() : {};
  if (data.premiumUntil && data.premiumUntil.toDate().getTime() > Date.now()) return true;
  if (!data.subscriptionTokenId) return false;
  try {
    const tokenSnap = await db.collection('subscriptions').doc(data.subscriptionTokenId).get();
    if (!tokenSnap.exists) return false;
    return (await syncSubscription(uid, tokenSnap.data().purchaseToken)).active;
  } catch (err) {
    console.error('구독 재확인 실패', uid, err.message);
    return false;
  }
}

/**
 * 앱에서 구독 결제 직후(또는 앱 시작 시 구매 복원) 호출. 구매 토큰을 확인하고 결제 회원으로 등록한다.
 */
exports.verifyPlaySubscription = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }
  const purchaseToken = data && data.purchaseToken;
  if (!purchaseToken || typeof purchaseToken !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'purchaseToken이 필요합니다.');
  }
  try {
    const { active, expiry } = await syncSubscription(context.auth.uid, purchaseToken);
    return { active, premiumUntil: expiry.toISOString() };
  } catch (err) {
    if (err instanceof functions.https.HttpsError) throw err;
    console.error('verifyPlaySubscription 실패', err.message);
    throw new functions.https.HttpsError('internal', '구독 확인에 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
});

// 한도 확인. 무제한이면 null, 아니면 { ref, used, limit } 를 돌려준다(초과 시 예외).
async function checkQuota(uid, kind) {
  if (Date.now() < FREE_FOR_ALL_END.getTime()) return null;
  if (await isPaidMember(uid)) return null;
  const ref = db.collection('users').doc(uid).collection('usage').doc(periodKey(kind));
  const snap = await ref.get();
  const used = snap.exists ? snap.data().count || 0 : 0;
  const limit = FREE_LIMITS[kind] + (kind === 'vet' && snap.exists ? snap.data().bonus || 0 : 0);
  if (used >= limit) {
    throw new functions.https.HttpsError('permission-denied', '무료 사용 한도를 모두 사용했습니다.', { reason: 'quota', kind, used, limit });
  }
  return { ref, used, limit };
}

exports.geminiProxy = functions
  .runWith({ secrets: ['GEMINI_API_KEY'], timeoutSeconds: 60 })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const { model, body, usage } = data || {};
    if (!model || typeof model !== 'string' || !body) {
      throw new functions.https.HttpsError('invalid-argument', 'model, body가 필요합니다.');
    }

    // 스캔·AI 수의사만 무료 한도를 센다. (usage를 보내지 않는 1.1.18 이하 앱은 한도 없이 통과)
    const kind = usage === 'scan' || usage === 'vet' ? usage : null;
    const quota = kind ? await checkQuota(context.auth.uid, kind) : null;

    // 요청한 모델이 "high demand"(503)나 한도 초과(429)로 거절하면 사용자에게 바로 오류를 보이지 않고
    // 다른 모델로 한 번 더 시도한다 (2026-09-29 웹에서 gemini-flash-latest 503 실제 발생).
    const models = [...new Set([model, ...FALLBACK_MODELS])];
    let lastStatus = 0;
    let lastJson = null;
    for (const m of models) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(m)}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (res.ok) {
        // 성공한 호출만 센다. 앱은 _usage로 남은 횟수를 표시한다.
        if (quota) {
          await quota.ref.set({ count: admin.firestore.FieldValue.increment(1) }, { merge: true });
          json._usage = { kind, used: quota.used + 1, limit: quota.limit };
        }
        return json;
      }
      console.error(`geminiProxy ${m} → ${res.status}: ${json?.error?.message || ''}`);
      lastStatus = res.status;
      lastJson = json;
      if (res.status !== 503 && res.status !== 429) break; // 요청 자체 문제는 다른 모델로 바꿔도 같으므로 중단
    }

    if (lastStatus === 429) {
      throw new functions.https.HttpsError('resource-exhausted', lastJson?.error?.message || 'Gemini API 요금제 한도 초과');
    }
    throw new functions.https.HttpsError('internal', lastJson?.error?.message || `Gemini API error: ${lastStatus}`);
  });

/**
 * AI 수의사 보상형 광고 시청 후 오늘 상담 1회 추가.
 * 광고 시청 자체는 서버에서 검증하지 않으므로(SSV 미사용) 하루 최대 MAX_AD_BONUS_PER_DAY회로 묶어 남용을 막는다.
 */
exports.grantVetAdBonus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '로그인이 필요합니다.');
  }
  const ref = db.collection('users').doc(context.auth.uid).collection('usage').doc(periodKey('vet'));
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const bonus = snap.exists ? snap.data().bonus || 0 : 0;
    if (bonus >= MAX_AD_BONUS_PER_DAY) {
      throw new functions.https.HttpsError('permission-denied', '오늘 받을 수 있는 광고 보너스를 모두 받았습니다.', { reason: 'bonus-limit' });
    }
    tx.set(ref, { bonus: bonus + 1 }, { merge: true });
    return { bonus: bonus + 1 };
  });
});

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
