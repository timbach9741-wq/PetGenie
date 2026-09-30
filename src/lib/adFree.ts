import { createContext, useContext } from 'react';

// 광고 제거 여부. "기능 무료 개방(FREE_FOR_ALL)"과는 별개로, 실제 결제한 회원만 true.
// 무료 개방 기간에도 광고 수익은 필요하므로 무료 사용자에게는 광고를 계속 보여준다.
// 값의 근거는 Firestore users/{uid}.premiumUntil (서버가 결제 확인 후에만 기록, 클라이언트 수정 불가).
export const AdFreeContext = createContext(false);

export const useAdFree = () => useContext(AdFreeContext);
