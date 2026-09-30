import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

export type UsageKind = 'scan' | 'vet';
export type UsageInfo = { kind: UsageKind; used: number; limit: number };

// 무료 한도를 다 썼을 때 서버(geminiProxy)가 permission-denied + details.reason='quota'로 거절한다.
export class QuotaExceededError extends Error {
  constructor(public kind: UsageKind, public used: number, public limit: number) {
    super('무료 사용 한도를 모두 사용했습니다.');
    this.name = 'QuotaExceededError';
  }
}

// 서버가 응답에 붙여주는 _usage(이번 기간 사용 횟수)를 화면에 알리기 위한 구독.
const usageListeners = new Set<(u: UsageInfo) => void>();
export function onUsage(listener: (u: UsageInfo) => void) {
  usageListeners.add(listener);
  return () => { usageListeners.delete(listener); };
}

/**
 * Gemini API를 클라이언트에서 직접 호출하지 않고 Cloud Functions(geminiProxy)를 거쳐 호출한다.
 * 이유: 클라이언트 번들에 API 키를 직접 넣으면 앱을 뜯어봤을 때 키가 그대로 노출되어
 * 구글이 유출된 키로 자동 차단한 사고가 실제로 있었음(2026-09-18). 키는 서버(Secret Manager)에만 둔다.
 * usage를 주면 서버가 무료 회원 한도(스캔 월 3회, 상담 하루 3회)를 세고 초과 시 거절한다.
 */
export async function callGemini(model: string, body: unknown, usage?: UsageKind): Promise<any> {
  const proxy = httpsCallable(functions, 'geminiProxy', { timeout: 60000 });
  try {
    const result = await proxy({ model, body, usage });
    const data: any = result.data;
    if (data?._usage) usageListeners.forEach((listener) => listener(data._usage));
    return data;
  } catch (err: any) {
    const details = err?.details;
    if (err?.code === 'functions/permission-denied' && details?.reason === 'quota') {
      throw new QuotaExceededError(details.kind, details.used, details.limit);
    }
    throw err;
  }
}

// AI 수의사 보상형 광고 시청 후 오늘 상담 1회 추가 (서버가 하루 최대 3회로 제한)
export async function grantVetAdBonus(): Promise<void> {
  await httpsCallable(functions, 'grantVetAdBonus')();
}
