import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getPerformance } from 'firebase/performance';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// 커뮤니티 기능을 위한 Firestore & Storage 인스턴스
const db = getFirestore(app);
const storage = getStorage(app);

// 웹 환경에서 성능 모니터링 초기화 (지원되는 경우)
let perf = null;
if (typeof window !== 'undefined') {
  try {
    perf = getPerformance(app);
  } catch (error) {
    console.warn("Firebase Performance is not supported in this environment.", error);
  }
}

export { app, auth, googleProvider, db, storage, perf };
