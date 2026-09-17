import { InAppReview } from '@capacitor-community/in-app-review';
import { Capacitor } from '@capacitor/core';

// 스토어 리뷰 요청 조건을 로컬에 저장해서, 같은 기기에서 너무 자주 뜨지 않게 합니다.
const STORAGE_KEY = 'petgenie_review_prompt_state';
const MIN_POSITIVE_ACTIONS_BEFORE_PROMPT = 2;
const MIN_DAYS_BETWEEN_PROMPTS = 90;

interface ReviewPromptState {
  positiveActionCount: number;
  lastPromptedAt: number | null;
}

const loadState = (): ReviewPromptState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('리뷰 요청 상태 로드 실패:', error);
  }
  return { positiveActionCount: 0, lastPromptedAt: null };
};

const saveState = (state: ReviewPromptState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('리뷰 요청 상태 저장 실패:', error);
  }
};

// 건강 리포트 저장, 스캔 완료 등 "긍정적 행동" 직후에 호출합니다.
// Google Play In-App Review API는 실제로 팝업을 띄울지 여부를 자체 판단하므로,
// 여기서는 "너무 자주 요청하지 않기"만 로컬에서 통제합니다.
export const maybeRequestReview = async () => {
  if (Capacitor.getPlatform() === 'web') {
    return;
  }

  const state = loadState();
  state.positiveActionCount += 1;

  const daysSinceLastPrompt = state.lastPromptedAt
    ? (Date.now() - state.lastPromptedAt) / (1000 * 60 * 60 * 24)
    : Infinity;

  const shouldPrompt =
    state.positiveActionCount >= MIN_POSITIVE_ACTIONS_BEFORE_PROMPT &&
    daysSinceLastPrompt >= MIN_DAYS_BETWEEN_PROMPTS;

  if (shouldPrompt) {
    try {
      await InAppReview.requestReview();
      state.lastPromptedAt = Date.now();
    } catch (error) {
      console.warn('인앱 리뷰 요청 실패:', error);
    }
  }

  saveState(state);
};
