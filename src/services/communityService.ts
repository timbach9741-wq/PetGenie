/**
 * communityService — 커뮤니티 피드 + 산책 인증 Firestore 서비스
 * ============================================================
 * 왜 이 구조: Firestore를 직접 사용하여 게시글 CRUD, 좋아요, 댓글 기능을 제공.
 * Firebase Storage를 통해 이미지 업로드를 처리하고, 주간 산책 랭킹을 집계한다.
 * ============================================================
 */
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  where,
  startAfter,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import type { CommunityPost, Comment, WalkRankingEntry, PetProfile } from '../types';

// ── 컬렉션 참조 ──
const POSTS_COLLECTION = 'community_posts';
const COMMENTS_SUBCOLLECTION = 'comments';

// ── 헬퍼: Firestore 문서 → CommunityPost 변환 ──
function docToPost(docSnap: QueryDocumentSnapshot<DocumentData>): CommunityPost {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    authorId: data.authorId || '',
    authorEmail: data.authorEmail || '',
    authorName: data.authorName || '',
    petName: data.petName || '',
    petBreed: data.petBreed || '',
    type: data.type || 'photo',
    text: data.text || '',
    imageUrl: data.imageUrl || undefined,
    walkDuration: data.walkDuration || undefined,
    walkStreak: data.walkStreak || undefined,
    likes: data.likes || [],
    commentCount: data.commentCount || 0,
    createdAt: data.createdAt,
  };
}

// ── 헬퍼: Firestore 문서 → Comment 변환 ──
function docToComment(docSnap: QueryDocumentSnapshot<DocumentData>, postId: string): Comment {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    postId,
    authorId: data.authorId || '',
    authorName: data.authorName || '',
    text: data.text || '',
    createdAt: data.createdAt,
  };
}

/**
 * 이미지를 Firebase Storage에 업로드하고 다운로드 URL을 반환
 * @param imageFile - 업로드할 이미지 File 객체
 * @param userId - 업로드하는 유저의 UID (폴더 구분용)
 * @returns 다운로드 가능한 이미지 URL
 */
export async function uploadImage(imageFile: File, userId: string): Promise<string> {
  // 파일 크기 제한: 5MB
  const MAX_SIZE = 5 * 1024 * 1024;
  if (imageFile.size > MAX_SIZE) {
    throw new Error('이미지 크기는 5MB 이하만 가능합니다.');
  }

  const fileName = `community/${userId}/${Date.now()}_${imageFile.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, imageFile);
  return getDownloadURL(storageRef);
}

/**
 * 게시글 작성
 * @param postData - 게시글 데이터 (id, createdAt 제외)
 * @param imageFile - 선택적 이미지 파일
 * @returns 생성된 게시글 ID
 */
export async function createPost(
  postData: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'commentCount' | 'imageUrl'>,
  imageFile?: File | null,
): Promise<string> {
  let imageUrl: string | undefined;

  // 이미지가 있으면 Storage에 업로드
  if (imageFile) {
    imageUrl = await uploadImage(imageFile, postData.authorId);
  }

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
    ...postData,
    imageUrl: imageUrl || null,
    likes: [],
    commentCount: 0,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * 피드 조회 (페이지네이션 지원)
 * @param filter - 'all' | 'walk' - 전체 또는 산책 인증만
 * @param pageSize - 한 번에 가져올 게시글 수
 * @param lastDocument - 마지막으로 조회한 문서 (페이지네이션용)
 * @returns 게시글 배열과 마지막 문서
 */
export async function getPosts(
  filter: 'all' | 'walk' = 'all',
  pageSize: number = 20,
  lastDocument?: QueryDocumentSnapshot<DocumentData> | null,
): Promise<{
  posts: CommunityPost[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}> {
  let q;

  if (filter === 'walk') {
    // 산책 인증만 필터
    q = lastDocument
      ? query(
          collection(db, POSTS_COLLECTION),
          where('type', '==', 'walk'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDocument),
          limit(pageSize),
        )
      : query(
          collection(db, POSTS_COLLECTION),
          where('type', '==', 'walk'),
          orderBy('createdAt', 'desc'),
          limit(pageSize),
        );
  } else {
    // 전체 조회
    q = lastDocument
      ? query(
          collection(db, POSTS_COLLECTION),
          orderBy('createdAt', 'desc'),
          startAfter(lastDocument),
          limit(pageSize),
        )
      : query(
          collection(db, POSTS_COLLECTION),
          orderBy('createdAt', 'desc'),
          limit(pageSize),
        );
  }

  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map((d) => docToPost(d));
  const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { posts, lastDoc };
}

/**
 * 특정 게시글 단건 조회
 * @param postId - 게시글 ID
 * @returns 게시글 객체 또는 null
 */
export async function getPostById(postId: string): Promise<CommunityPost | null> {
  const docRef = doc(db, POSTS_COLLECTION, postId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return docToPost(docSnap);
  }
  return null;
}

/**
 * 좋아요 토글
 * @param postId - 게시글 ID
 * @param userId - 좋아요를 누르는 유저 UID
 * @param userName - 좋아요를 누르는 유저 이름 (알림용)
 * @param isCurrentlyLiked - 현재 좋아요 상태
 */
export async function toggleLike(
  postId: string,
  userId: string,
  userName: string,
  isCurrentlyLiked: boolean,
): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, postId);

  if (isCurrentlyLiked) {
    // 좋아요 취소
    await updateDoc(postRef, {
      likes: arrayRemove(userId),
    });
  } else {
    // 좋아요 추가
    await updateDoc(postRef, {
      likes: arrayUnion(userId),
    });
  }
}

/**
 * 댓글 추가
 * @param postId - 게시글 ID
 * @param commentData - 댓글 데이터
 * @returns 생성된 댓글 ID
 */
export async function addComment(
  postId: string,
  commentData: Omit<Comment, 'id' | 'postId' | 'createdAt'>,
): Promise<string> {
  // 서브컬렉션에 댓글 추가
  const commentsRef = collection(db, POSTS_COLLECTION, postId, COMMENTS_SUBCOLLECTION);
  const docRef = await addDoc(commentsRef, {
    ...commentData,
    createdAt: serverTimestamp(),
  });

  // 게시글의 commentCount 증가
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, {
    commentCount: increment(1),
  });

  return docRef.id;
}

/**
 * 댓글 목록 조회
 * @param postId - 게시글 ID
 * @returns 댓글 배열 (최신순)
 */
export async function getComments(postId: string): Promise<Comment[]> {
  const commentsRef = collection(db, POSTS_COLLECTION, postId, COMMENTS_SUBCOLLECTION);
  const q = query(commentsRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => docToComment(d, postId));
}

/**
 * 게시글 삭제 (본인만 가능)
 * @param postId - 삭제할 게시글 ID
 * @param userId - 삭제 요청자의 UID (권한 확인용)
 */
export async function deletePost(postId: string, userId: string): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postRef);

  if (!postSnap.exists()) {
    throw new Error('게시글을 찾을 수 없습니다.');
  }

  // 본인 게시글인지 확인
  if (postSnap.data().authorId !== userId) {
    throw new Error('본인 게시글만 삭제할 수 있습니다.');
  }

  await deleteDoc(postRef);
}

/**
 * 댓글 삭제 (본인만 가능)
 * @param postId - 게시글 ID
 * @param commentId - 삭제할 댓글 ID
 * @param userId - 삭제 요청자의 UID
 */
export async function deleteComment(postId: string, commentId: string, userId: string): Promise<void> {
  const commentRef = doc(db, POSTS_COLLECTION, postId, COMMENTS_SUBCOLLECTION, commentId);
  const commentSnap = await getDoc(commentRef);

  if (!commentSnap.exists()) {
    throw new Error('댓글을 찾을 수 없습니다.');
  }

  if (commentSnap.data().authorId !== userId) {
    throw new Error('본인 댓글만 삭제할 수 있습니다.');
  }

  // 댓글 삭제
  await deleteDoc(commentRef);

  // 게시글의 commentCount 감소 (0 이하로 내려가지 않도록 유의)
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists() && postSnap.data().commentCount > 0) {
    await updateDoc(postRef, {
      commentCount: increment(-1),
    });
  }
}

/**
 * 산책 기록을 커뮤니티 인증 게시글로 공유
 * @param walkDuration - 산책 시간 (초)
 * @param petProfile - 반려견 프로필 정보
 * @param user - 유저 정보
 * @returns 생성된 게시글 ID
 */
export async function shareWalkRecord(
  walkDuration: number,
  petProfile: PetProfile,
  user: { uid: string; email: string; displayName?: string },
): Promise<string> {
  // 연속 산책 일수 계산 (localStorage 기반)
  const streak = calculateWalkStreak();

  const postData = {
    authorId: user.uid,
    authorEmail: user.email,
    authorName: user.displayName || user.email.split('@')[0],
    petName: petProfile.name || '우리 강아지',
    petBreed: petProfile.breed || '',
    type: 'walk' as const,
    text: '', // 자동 생성될 메시지
    walkDuration,
    walkStreak: streak,
  };

  return createPost(postData);
}

/**
 * 연속 산책 일수 계산 (localStorage 기반)
 * 마지막 산책 날짜와 비교하여 스트릭을 유지/리셋
 */
function calculateWalkStreak(): number {
  try {
    const today = new Date().toDateString();
    const streakData = localStorage.getItem('petgenie_walk_streak');

    if (!streakData) {
      // 첫 산책
      localStorage.setItem('petgenie_walk_streak', JSON.stringify({ lastDate: today, count: 1 }));
      return 1;
    }

    const { lastDate, count } = JSON.parse(streakData);
    const lastWalkDate = new Date(lastDate);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastWalkDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // 오늘 이미 산책함 → 스트릭 유지
      return count;
    } else if (diffDays === 1) {
      // 어제 산책 → 스트릭 +1
      const newCount = count + 1;
      localStorage.setItem('petgenie_walk_streak', JSON.stringify({ lastDate: today, count: newCount }));
      return newCount;
    } else {
      // 2일 이상 건너뜀 → 스트릭 리셋
      localStorage.setItem('petgenie_walk_streak', JSON.stringify({ lastDate: today, count: 1 }));
      return 1;
    }
  } catch {
    return 1;
  }
}

/**
 * 이번 주 산책 랭킹 (실제 데이터 집계)
 * - 'walk' 타입의 최근 1주일 게시글들을 가져와서 유저별로 묶어 누적 산책시간 계산
 */
export async function getWeeklyRanking(): Promise<WalkRankingEntry[]> {
  try {
    // 최근 7일(일주일) 기준 시간
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const q = query(
      collection(db, POSTS_COLLECTION),
      where('createdAt', '>=', oneWeekAgo),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    // 유저 별로 walkDuration(초) 합산 및 가장 최근 기록 유지
    const userMap = new Map<string, WalkRankingEntry>();

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // 'walk' 타입만 자바스크립트 단에서 필터링 (복합 인덱스 오류 방지)
      if (data.type !== 'walk') return;
      
      const uId = data.authorId;
      if (!uId) return;

      if (!userMap.has(uId)) {
        userMap.set(uId, {
          userId: uId,
          userName: data.authorName || '이름 없음',
          petName: data.petName || '강아지',
          totalMinutes: 0,
          walkCount: 0,
          streak: data.walkStreak || 1, // 최신 게시글의 streak 값 가져옴
        });
      }
      const entry = userMap.get(uId)!;
      entry.totalMinutes += Math.round((data.walkDuration || 0) / 60);
      entry.walkCount += 1;
      
      // 최신의 streak을 유지하기 보다는 단순 합산이 주요하므로,
      // 가장 첫 번째(desc 정렬이니까 최신) streak 값으로 이미 초기화됨.
    });

    // totalMinutes 기준으로 내림차순 정렬
    const rankingArray = Array.from(userMap.values())
      .filter((entry) => entry.totalMinutes > 0)
      .sort((a, b) => b.totalMinutes - a.totalMinutes)
      .slice(0, 5); // 상위 5명만

    return rankingArray;
  } catch (error) {
    console.error('getWeeklyRanking error:', error);
    return [];
  }
}

/**
 * 상대 시간 포맷 (예: "2시간 전", "3일 전")
 * @param timestamp - Firestore Timestamp 또는 Date
 */
export function formatRelativeTime(timestamp: any, lang: string = 'ko'): string {
  if (!timestamp) return '';

  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (lang === 'ko') {
    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  }

  // 영어 및 기타 언어
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US');
}

/**
 * 콘텐츠 신고 (앱 심사 필수)
 * @param reporterId - 신고자 UID
 * @param targetType - 'post' 또는 'comment'
 * @param targetId - 신고 대상 ID
 * @param reason - 신고 사유
 */
export async function reportContent(
  reporterId: string,
  targetType: 'post' | 'comment',
  targetId: string,
  reason: string
): Promise<void> {
  const reportsRef = collection(db, 'reports');
  await addDoc(reportsRef, {
    reporterId,
    targetType,
    targetId,
    reason,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
}

/**
 * 사용자 차단 (앱 심사 필수)
 * @param blockerId - 차단하는 유저 UID
 * @param blockedId - 차단 대상 유저 UID
 */
export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  const userRef = doc(db, 'users', blockerId);
  await updateDoc(userRef, {
    blockedUsers: arrayUnion(blockedId)
  }).catch(async (error) => {
    // 문서가 없는 경우 새로 생성
    if (error.code === 'not-found') {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(userRef, { blockedUsers: [blockedId] }, { merge: true });
    } else {
      throw error;
    }
  });
}

/**
 * 내가 차단한 사용자 목록 조회
 * @param userId - 내 UID
 */
export async function getBlockedUsers(userId: string): Promise<string[]> {
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data().blockedUsers || [];
    }
    return [];
  } catch (error) {
    console.error('차단 목록 로드 실패:', error);
    return [];
  }
}

