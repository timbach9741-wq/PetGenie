import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

/**
 * Gemini API를 클라이언트에서 직접 호출하지 않고 Cloud Functions(geminiProxy)를 거쳐 호출한다.
 * 이유: 클라이언트 번들에 API 키를 직접 넣으면 앱을 뜯어봤을 때 키가 그대로 노출되어
 * 구글이 유출된 키로 자동 차단한 사고가 실제로 있었음(2026-09-18). 키는 서버(Secret Manager)에만 둔다.
 */
export async function callGemini(model: string, body: unknown): Promise<any> {
  const proxy = httpsCallable(functions, 'geminiProxy', { timeout: 60000 });
  const result = await proxy({ model, body });
  return result.data;
}
