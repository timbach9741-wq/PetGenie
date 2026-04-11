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
 * 좋아요 토글
 * @param postId - 게시글 ID
 * @param userId - 좋아요를 누르는 유저 UID
 * @param isCurrentlyLiked - 현재 좋아요 상태
 */
export async function toggleLike(
  postId: string,
  userId: string,
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
 * 주간 산책 랭킹 (Mock 데이터 — 실제 서비스 시 Firestore 집계로 교체)
 * 왜 Mock: 초기 출시 시 유저 데이터가 부족하므로, 동기 부여용 샘플 랭킹 제공
 */
export function getWeeklyRanking(): WalkRankingEntry[] {
  return [
    { userId: 'mock_1', userName: '루나맘', petName: '루나', totalMinutes: 420, walkCount: 14, streak: 7 },
    { userId: 'mock_2', userName: '초코아빠', petName: '초코', totalMinutes: 350, walkCount: 12, streak: 6 },
    { userId: 'mock_3', userName: '뭉치주인', petName: '뭉치', totalMinutes: 280, walkCount: 10, streak: 5 },
    { userId: 'mock_4', userName: '보리사랑', petName: '보리', totalMinutes: 210, walkCount: 8, streak: 4 },
    { userId: 'mock_5', userName: '콩이맘', petName: '콩이', totalMinutes: 180, walkCount: 7, streak: 3 },
  ];
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
