import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';
import type { BannerAdOptions, AdMobBannerSize } from '@capacitor-community/admob';

// 화면 전환마다 AdBanner가 mount/unmount 되면서 showBanner()와 removeBanner()가
// 비동기로 겹쳐 호출되면, 네이티브 플러그인이 이미 제거된 컨테이너에 배너 뷰를
// 붙이려다 NullPointerException(BannerExecutor.createNewAdView)이 발생한다.
// 모든 호출을 하나의 큐에서 순차 실행해 겹치지 않도록 한다.
let queue: Promise<void> = Promise.resolve();

// removeBanner()는 배너 뷰를 완전히 파괴하고, 다시 보여줄 때 showBanner()로 새 광고를
// 네트워크에서 다시 요청해야 한다. 이 요청이 지연되거나 화면 전환과 타이밍이 겹치면
// 이전 배너 뷰가 파괴되지 않은 채 남아 로그인 화면 등 하단을 계속 가리는 문제가 있었다.
// hideBanner()/resumeBanner()는 이미 만들어진 뷰의 표시 여부만 즉시(동기적으로) 토글하므로
// 네트워크 재요청이 없어 훨씬 안전하다 — 최초 1회만 showBanner()로 생성하고, 이후에는
// hide/resume만 사용한다.
let bannerCreated = false;

// 한 화면에 AdBanner가 두 개 붙는 경우가 있다(메인 탭 하단 공용 배너 + 촬영 화면 자체 배너).
// 예전엔 하나가 unmount될 때마다 바로 숨기고 높이를 0으로 만들어, 다른 하나가 아직 배너를
// 원하는데도 상태가 어긋났다 — 배너는 떠 있는데 탭바는 0 높이 기준으로 내려와 배너 밑에
// 깔리는 문제가 실제 기기(9/29, 촬영 화면)에서 확인됨. 요청 수를 세서 0↔1 경계에서만 토글한다.
let requestCount = 0;

// resumeBanner()는 다시 보이게 한 직후의 뷰 높이를 보고하는데, 아직 레이아웃 전이면 0이 올 수 있다.
// 배너(ADAPTIVE_BANNER) 높이는 기기 폭에 따라 정해져 바뀌지 않으므로 마지막으로 받은 실제 높이를 기억해 쓴다.
let lastBannerHeight = 0;

const BANNER_HEIGHT_VAR = '--admob-banner-height';

function applyBannerHeightVar() {
  const cssPx = requestCount > 0 ? lastBannerHeight : 0;
  document.documentElement.style.setProperty(BANNER_HEIGHT_VAR, `${cssPx}px`);
}

let sizeListenerRegistered = false;
function ensureSizeListener() {
  if (sizeListenerRegistered) return;
  sizeListenerRegistered = true;
  // 네이티브 배너는 웹뷰 레이아웃 밖에 그려지는 오버레이라 하단 탭바를 가릴 수 있다.
  // 실제 배너 높이를 받아서 탭바를 그만큼 위로 밀어올려 겹치지 않게 한다.
  // 플러그인은 네이티브(디바이스) px 단위로 높이를 주므로 devicePixelRatio로 CSS px 환산.
  // hideBanner()가 보내는 0은 무시하고, 표시 여부는 requestCount로만 판단한다.
  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: AdMobBannerSize) => {
    if (info.height > 0) {
      const dpr = window.devicePixelRatio || 1;
      lastBannerHeight = info.height / dpr;
    }
    applyBannerHeightVar();
  });
}

export function queueShowBanner(options: BannerAdOptions) {
  ensureSizeListener();
  requestCount += 1;
  applyBannerHeightVar();
  if (requestCount > 1) return queue;
  queue = queue
    .then(() => (bannerCreated ? AdMob.resumeBanner() : AdMob.showBanner(options)))
    .then(() => { bannerCreated = true; })
    .catch((err) => console.warn('AdMob banner load failed', err));
  return queue;
}

export function queueRemoveBanner() {
  requestCount = Math.max(0, requestCount - 1);
  applyBannerHeightVar();
  if (requestCount > 0) return queue;
  // bannerCreated는 큐 안에서 확인해야 한다. 앱 시작 직후처럼 첫 showBanner()가 아직
  // 큐에서 끝나기 전에 화면이 바뀌면 이 시점엔 false라 숨김이 통째로 건너뛰어졌고,
  // 뒤이어 생성된 배너가 로그인 등 광고 없는 화면 하단을 계속 가렸다.
  queue = queue
    .then(() => (bannerCreated ? AdMob.hideBanner() : undefined))
    .catch(() => {});
  return queue;
}
