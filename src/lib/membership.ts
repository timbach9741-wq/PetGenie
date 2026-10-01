import { doc, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, db } from './firebase';

// 유료화 시작 시각은 Firestore config/billing.paidLaunchAt 하나로 앱과 서버(functions/index.js)가 함께 따른다.
// 문서가 없거나 읽지 못하면 원래 무료 개방 종료일을 쓴다(서버의 DEFAULT_PAID_LAUNCH와 같은 값).
const DEFAULT_PAID_LAUNCH = new Date('2027-01-01T00:00:00+09:00');
// 유료화 전부터 쓰던 사용자의 무료 기간 끝(서버의 LEGACY_FREE_UNTIL과 같은 값).
export const LEGACY_FREE_UNTIL = new Date('2027-01-01T00:00:00+09:00');

// 이 버전을 처음 실행할 때 이미 온보딩을 본 기기 = 유료화 전부터 앱을 쓰던 기기.
// 앱이 시작되며 온보딩 표시를 새로 쓰기 전에 판단해야 하므로 모듈을 불러올 때 한 번 기록한다.
const COHORT_KEY = 'petgenie_cohort';
function detectLegacyDevice(): boolean {
  try {
    let cohort = localStorage.getItem(COHORT_KEY);
    if (!cohort) {
      cohort = localStorage.getItem('petgenie_onboarding') === 'true' ? 'legacy' : 'new';
      localStorage.setItem(COHORT_KEY, cohort);
    }
    return cohort === 'legacy';
  } catch {
    return false;
  }
}
export const isLegacyDevice = detectLegacyDevice();

export const legacyFreeActive = () => Date.now() < LEGACY_FREE_UNTIL.getTime();

export async function fetchPaidLaunchAt(): Promise<Date> {
  try {
    const snap = await getDoc(doc(db, 'config', 'billing'));
    return snap.data()?.paidLaunchAt?.toDate?.() || DEFAULT_PAID_LAUNCH;
  } catch (err) {
    console.warn('config/billing read failed', err);
    return DEFAULT_PAID_LAUNCH;
  }
}

/** 기존 사용자(유료화 전 계정 또는 기기)면 서버가 12/31까지 무료로 등록하고 그 날짜를 돌려준다. */
export async function claimLegacyFree(): Promise<boolean> {
  const claim = httpsCallable(getFunctions(app), 'claimLegacyFree');
  const result = await claim({ legacyDevice: isLegacyDevice });
  return !!(result.data as { freeUntil: string | null }).freeUntil;
}
