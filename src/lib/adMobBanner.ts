import { AdMob } from '@capacitor-community/admob';
import type { BannerAdOptions } from '@capacitor-community/admob';

// 화면 전환마다 AdBanner가 mount/unmount 되면서 showBanner()와 removeBanner()가
// 비동기로 겹쳐 호출되면, 네이티브 플러그인이 이미 제거된 컨테이너에 배너 뷰를
// 붙이려다 NullPointerException(BannerExecutor.createNewAdView)이 발생한다.
// 모든 호출을 하나의 큐에서 순차 실행해 겹치지 않도록 한다.
let queue: Promise<void> = Promise.resolve();

export function queueShowBanner(options: BannerAdOptions) {
  queue = queue
    .then(() => AdMob.showBanner(options))
    .catch((err) => console.warn('AdMob banner load failed', err));
  return queue;
}

export function queueRemoveBanner() {
  queue = queue
    .then(() => AdMob.removeBanner())
    .catch(() => {});
  return queue;
}
