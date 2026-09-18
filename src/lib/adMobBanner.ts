import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';
import type { BannerAdOptions, AdMobBannerSize } from '@capacitor-community/admob';

// 화면 전환마다 AdBanner가 mount/unmount 되면서 showBanner()와 removeBanner()가
// 비동기로 겹쳐 호출되면, 네이티브 플러그인이 이미 제거된 컨테이너에 배너 뷰를
// 붙이려다 NullPointerException(BannerExecutor.createNewAdView)이 발생한다.
// 모든 호출을 하나의 큐에서 순차 실행해 겹치지 않도록 한다.
let queue: Promise<void> = Promise.resolve();

const BANNER_HEIGHT_VAR = '--admob-banner-height';

function setBannerHeightVar(cssPx: number) {
  document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, `${cssPx}px`);
}

let sizeListenerRegistered = false;
function ensureSizeListener() {
  if (sizeListenerRegistered) return;
  sizeListenerRegistered = true;
  // 네이티브 배너는 웹뷰 레이아웃 밖에 그려지는 오버레이라 하단 탭바를 가릴 수 있다.
  // 실제 배너 높이를 받아서 탭바를 그만큼 위로 밀어올려 겹치지 않게 한다.
  // 플러그인은 네이티브(디바이스) px 단위로 높이를 주므로 devicePixelRatio로 CSS px 환산.
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: AdMobBannerSize) => {
    const dpr = window.devicePixelRatio || 1;
    setBannerHeightVar(info.height / dpr);
  });
}

export function queueShowBanner(options: BannerAdOptions) {
  ensureSizeListener();
  queue = queue
    .then(() => AdMob.showBanner(options))
    .catch((err) => console.warn('AdMob banner load failed', err));
  return queue;
}

export function queueRemoveBanner() {
  setBannerHeightVar(0);
  queue = queue
    .then(() => AdMob.removeBanner())
    .catch(() => {});
  return queue;
}
