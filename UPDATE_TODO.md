# 🚀 Pet Genie v1.1 업데이트 목록 (승인 후 배포)

> **작성일**: 2026-04-06
> **현재 상태**: Google Play 승인 대기 중 → 승인 후 아래 항목 반영하여 v1.1 업데이트 배포
> **우선순위**: 🔴 Critical (앱 기능 오류) / 🟡 Important (UX/i18n) / 🟢 Enhancement (개선사항)

---

## 🔴 Critical — 앱 기능 버그

### 1. ✅ [수정완료] AI 수의사 한국어 질문 → 영어 답변 버그

- **파일**: `src/services/geminiService.ts`
- **원인**: `getSystemInstruction(targetLang, petInfo)` ← 이미 변환된 `"Korean"` 문자열을 넘겨서 내부 `langMap` 매칭 실패 → 기본값 `ENGLISH`로 폴백
- **추가 원인**: 시스템 프롬프트에 `NO KOREAN`이 하드코딩 되어 한국어 설정에서도 한국어 사용 금지
- **수정 내용**: `currentLang` (원본 코드 `"ko"`) 전달 + 한국어일 때 전용 한국어 프롬프트 분기
- **상태**: ✅ 코드 수정 완료 & 빌드 성공 (배포 미반영)

---

## 🟡 Important — 다국어(i18n) 하드코딩 텍스트

> 아래 항목들은 하드코딩된 텍스트를 `t()` 함수로 교체하고, 5개 언어 locale 파일에 번역을 추가한 항목입니다.

### 2. ✅ [수정완료] AuthScreens.tsx — 약관/마케팅 동의 i18n

- **파일**: `src/components/screens/AuthScreens.tsx`
- **수정 내용**:
  - 로그인/회원가입 양쪽 `"I agree to receive launch benefits via email"` → `t('auth.marketing_consent')`
  - `"By continuing, you agree to Pet Genie's Terms and Privacy Policy"` → `t('auth.terms_prefix')`, `t('auth.terms_link')`, `t('auth.privacy_link')`
- **locale 파일**: 5개 언어 (`ko/en/ja/zh/es`) — `marketing_consent`, `terms_prefix`, `terms_link`, `terms_and`, `privacy_link` 키 추가 완료
- **상태**: ✅ 코드 수정 완료 & locale 반영 완료

### 3. ✅ [수정완료] ProfileScreen.tsx — "Admin Dashboard" i18n

- **파일**: `src/components/screens/ProfileScreen.tsx`
- **수정 내용**: `"Admin Dashboard"` → `t('profile.admin_dashboard')`
- **locale 파일**: 5개 언어 — `admin_dashboard` 키 추가 완료
- **상태**: ✅ 코드 수정 완료

### 4. ✅ [수정완료] CameraScreen.tsx — 카메라 UI i18n

- **파일**: `src/components/screens/CameraScreen.tsx`
- **수정 내용**:
  - `"AI Vision Active"` → `t('camera.ai_vision_active')`
  - `"Align Subject"` → `t('camera.align_subject')`
- **참고**: "Pet Genie" (187번줄)는 브랜드명이므로 번역 불필요
- **상태**: ✅ 코드 수정 완료 (locale에 이미 키 존재)

### 5. ✅ [수정완료] MembershipScreen.tsx — 요금제/프로모션 텍스트 i18n

- **파일**: `src/components/screens/MembershipScreen.tsx`
- **수정 내용**:
  - 프로모션 배너 (`런칭 기념 사전 헤택`, `6월 전까지는 Pro 플랜...`) → `t('membership.promo_title')`, `t('membership.promo_desc')`
  - Basic 플랜 설명/버튼 → `t('membership.basic_desc')`, `t('membership.current_plan')` 등
  - Silverman Pro 설명/혜택 → `t('membership.pro_desc')`, `t('membership.pro_no_ads')` 등
  - Single Deep Scan 설명 → `t('membership.scan_desc')`, `t('membership.scan_no_ad')` 등
  - Coming Soon 버튼 → `t('membership.coming_soon')`
  - 요금제 이름(Basic, Silverman Pro, Single Deep Scan)은 브랜드명이므로 영어 유지
- **locale 파일**: `ko.json`, `en.json`, `ja.json`, `zh.json`, `es.json` — 18개 키 추가 완료
- **상태**: ✅ 코드 수정 완료 & locale 5개 언어 반영 완료

### 6. ✅ [수정완료] HealthReport.tsx — 분석 리포트 서브타이틀 i18n

- **파일**: `src/components/screens/HealthReport.tsx`
- **수정 내용**:
  - `"Premium"` → `t('common.premium')`
  - `"Identification Basis"` → `t('report.identification_basis_sub')`
  - `"Genetic Health Screening"` → `t('report.genetic_screening_sub')`
  - `"Critical Risk"` / `"Moderate Risk"` / `"Low Risk"` → `t('report.risk_critical')` 등
  - `"AI-Powered Recommendations"` → `t('report.ai_recommendations_sub')`
  - `"Advanced DNA Mapping"` → `t('report.dna_mapping_sub')`
- **locale 파일**: 5개 언어 — 8개 키 추가 완료
- **상태**: ✅ 코드 수정 완료

### 7. ✅ [수정완료] AIVetScreen.tsx — 에러/광고 팝업 i18n (9곳)

- **파일**: `src/components/screens/AIVetScreen.tsx`
- **수정 내용**:
  - `'보호자'` / `'수의사'` → `t('ai_vet.role_owner')` / `t('ai_vet.role_vet')`
  - `'이름:', '나이:', '견종:', '성별:', '알 수 없음'` → `t()` 키로 교체
  - `'오류가 발생했습니다:'` → `t('ai_vet.error_occurred')`
  - `'네트워크 또는 서버 할당량 오류'` → `t('ai_vet.network_error')`
  - `'다시 시도하기'` → `t('ai_vet.retry')`
  - `'상담 한도 소진'` / `'일일 무료 상담...'` → `t('ai_vet.quota_exhausted')`, `t('ai_vet.quota_desc')`, `t('ai_vet.quota_ask')`
  - `'취소(Cancel)'` → `t('common.cancel')`
  - `'광고 보기'` → `t('ai_vet.watch_ad')`
- **locale 파일**: 5개 언어 — 9개 키 추가 완료 + `common.unknown`, `common.premium` 추가
- **상태**: ✅ 코드 수정 완료

### 8. ✅ [수정완료] 6월 무료 프로모션 — 다국어 지원

- **관련 파일**: `MembershipScreen.tsx`, 5개 locale 파일
- **수정 내용**:
  - 프로모션 문구 18개 키를 `t()` 함수로 교체
  - 5개 언어(한국어/영어/일본어/중국어/스페인어) 번역 완료
  - "6월 출시 예정" → 각 언어로 자연스럽게 번역
- **상태**: ✅ 코드 수정 완료

---

## 🟡 Important — 인증/보안

### 9. 카카오 로그인 Mock 상태

- **파일**: `src/components/screens/AuthScreens.tsx`
- **문제**: 34번줄 `handleSocialLogin('kakao')` → `onLogin('kakao@user.com')` 으로 임시 처리
- **상태**: 구글 로그인은 Firebase 연동 완료, 카카오는 Mock
- **필요 작업**: 카카오 SDK 연동 또는 카카오 버튼 비활성화/제거 결정
- **참고**: `AUTH_TODO.md` 문서 참조

### 10. 이메일/비밀번호 로그인 — Firebase Auth 미연동

- **파일**: `src/components/screens/AuthScreens.tsx`
- **문제**: `handleSubmit`에서 `onLogin(email)` 만 호출 → 실제 Firebase `signInWithEmailAndPassword` 미사용
- **리스크**: 비밀번호 검증 없이 이메일만으로 로그인 가능한 상태

---

## 🟢 Enhancement — UX/기능 개선

### 11. 버전 표시 하드코딩

- **파일**: `src/components/screens/ProfileScreen.tsx`
- **문제**: 205번줄 `1.0.0` 하드코딩 → `package.json`에서 동적으로 가져오거나, 업데이트 시 같이 수정

### 12. AdMob 보상형 광고 — 실제 연동

- **파일**: `src/components/screens/AIVetScreen.tsx`
- **현재**: `handleWatchAd`가 `setTimeout`으로 시뮬레이션 (30% 실패 확률도 임의)
- **필요**: 실제 AdMob Rewarded Ad 연동

---

## 📋 업데이트 실행 순서 (승인 후)

1. `android/app/build.gradle` → `versionCode` +1, `versionName` 변경
2. `deploy.ps1` 실행 → AAB 빌드
3. Google Play Console에서 새 AAB 업로드 (프로덕션 or 단계적 출시)

---

## ⚡ 수정 완료 항목 요약

| #  | 항목                                       | 상태                              |
| -- | ------------------------------------------ | --------------------------------- |
| 1  | AI 수의사 언어 버그 (`geminiService.ts`)    | ✅ 코드 수정 완료                 |
| 2  | AuthScreens 약관/마케팅 동의 i18n          | ✅ 코드 + 5개 언어 locale 완료    |
| 3  | ProfileScreen Admin Dashboard i18n         | ✅ 코드 + 5개 언어 locale 완료    |
| 4  | CameraScreen 카메라 UI i18n                | ✅ 코드 수정 완료                 |
| 5  | MembershipScreen 요금제/프로모션 i18n      | ✅ 코드 + 5개 언어 locale 완료    |
| 6  | HealthReport 서브타이틀 i18n               | ✅ 코드 + 5개 언어 locale 완료    |
| 7  | AIVetScreen 에러/광고 팝업 i18n (9곳)      | ✅ 코드 + 5개 언어 locale 완료    |
| 8  | 6월 무료 프로모션 다국어 지원              | ✅ 코드 + 5개 언어 locale 완료    |

---

> 💡 **참고**: i18n 관련 항목은 모두 수정 완료. 남은 항목은 카카오 로그인 처리(#9), Firebase Auth 연동(#10), 버전 표시(#11), AdMob 연동(#12)입니다.
