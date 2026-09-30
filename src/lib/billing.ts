import { Capacitor } from '@capacitor/core';
import { NativePurchases, PURCHASE_TYPE } from '@capgo/native-purchases';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

// Google Play Console에 등록할 구독 상품: 상품 1개 + 기간별 기본 요금제 4개.
// ID는 Play Console 등록 값과 정확히 같아야 한다(functions/index.js SUBSCRIPTION_PRODUCT_ID도 동일).
export const SUBSCRIPTION_PRODUCT_ID = 'petgenie_premium';
export const BASE_PLAN_IDS: Record<string, string> = {
  '1m': 'p1m',
  '3m': 'p3m',
  '6m': 'p6m',
  '12m': 'p12m',
};

const functions = getFunctions(app);

export const isBillingAvailable = () => Capacitor.getPlatform() === 'android';

// 구매 토큰을 서버에 보내 구글 확인 → users/{uid}.premiumUntil 갱신. 확인(acknowledge)도 서버가 한다.
async function verifyOnServer(purchaseToken: string): Promise<{ active: boolean; premiumUntil: string }> {
  const verify = httpsCallable(functions, 'verifyPlaySubscription', { timeout: 30000 });
  const result = await verify({ purchaseToken });
  return result.data as { active: boolean; premiumUntil: string };
}

/**
 * 선택한 기간 요금제로 구독 결제. 무료 체험 혜택이 있으면 그 혜택으로 결제한다.
 * 결제창에서 사용자가 취소하면 예외가 난다(호출한 쪽에서 조용히 무시).
 */
export async function purchasePlan(planId: string, uid: string) {
  const basePlanId = BASE_PLAN_IDS[planId];
  if (!basePlanId) throw new Error(`알 수 없는 요금제: ${planId}`);

  // 구독 상품은 혜택(무료 체험 등)마다 한 항목씩 온다: identifier=기본 요금제 ID, offerId=혜택 ID
  const { products } = await NativePurchases.getProducts({
    productIdentifiers: [SUBSCRIPTION_PRODUCT_ID],
    productType: PURCHASE_TYPE.SUBS,
  });
  const offers = products.filter((p) => p.identifier === basePlanId);
  const offer = offers.find((p) => p.offerId) || offers[0];

  const transaction = await NativePurchases.purchaseProduct({
    productIdentifier: SUBSCRIPTION_PRODUCT_ID,
    planIdentifier: basePlanId,
    offerToken: offer?.offerToken,
    productType: PURCHASE_TYPE.SUBS,
    appAccountToken: uid, // 서버가 구매 계정과 로그인 계정이 같은지 확인하는 데 쓴다
    autoAcknowledgePurchases: false,
  });
  if (!transaction.purchaseToken) throw new Error('구매 토큰을 받지 못했습니다.');
  return verifyOnServer(transaction.purchaseToken);
}

/**
 * 이 기기의 구글 계정에 있는 구독을 서버에 다시 확인한다.
 * 앱 재설치·기기 변경 후 복원, 그리고 결제 직후 서버 확인이 실패했던 구매를 마저 처리하는 데 쓴다.
 */
export async function restorePurchases(uid: string): Promise<boolean> {
  const { purchases } = await NativePurchases.getPurchases({ productType: PURCHASE_TYPE.SUBS });
  let active = false;
  for (const p of purchases) {
    if (!p.purchaseToken || p.productIdentifier !== SUBSCRIPTION_PRODUCT_ID) continue;
    try {
      active = (await verifyOnServer(p.purchaseToken)).active || active;
    } catch (err) {
      console.warn('Subscription restore failed', err);
    }
  }
  return active;
}

export const manageSubscriptions = () => NativePurchases.manageSubscriptions();
