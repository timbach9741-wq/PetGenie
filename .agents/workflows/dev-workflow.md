---
description: 강아지 앱 개발 워크플로우 - 빠르고 효율적인 작업을 위한 표준 절차
---
// turbo-all

# 🚀 강아지 앱 개발 워크플로우

## 1. 작업 시작 전 환경 점검

### 1-1. 중복 프로세스 정리
기존에 실행 중인 dev 서버가 있으면 먼저 모두 종료한다.
```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 1-2. dev 서버 실행 (단일 인스턴스만)
```powershell
cd "c:\Users\Tim\Desktop\강아지 앱\강아지-스켄 (1)" && npm run dev
```

### 1-3. Git 상태 확인
작업 시작 전 항상 현재 상태를 확인한다.
```powershell
cd "c:\Users\Tim\Desktop\강아지 앱\강아지-스켄 (1)" && git status && git log --oneline -3
```

---

## 2. 코드 수정 규칙

### 2-1. 대용량 파일 검색 시 PowerShell 사용
`App.tsx`(3972줄)는 인코딩 문제로 `grep_search`가 작동하지 않을 수 있음.
**반드시 PowerShell `Select-String`을 우선 사용:**
```powershell
Select-String -Path "src\App.tsx" -Pattern "검색어" | Select-Object -First 10
```

### 2-2. 파일 편집 전 반드시 해당 영역 view_file로 확인
- 편집 전 `view_file`로 정확한 줄번호와 내용을 확인
- 템플릿 리터럴(백틱 `` ` ``)이 포함된 영역은 `replace_file_content`가 실패할 수 있음
- 실패 시 PowerShell로 직접 수정하거나, 함수 전체를 `write_to_file`로 교체

### 2-3. 수정 후 즉시 커밋
**매 수정 후 반드시 커밋하여 코드 소실을 방지한다:**
```powershell
cd "c:\Users\Tim\Desktop\강아지 앱\강아지-스켄 (1)" && git add -A && git commit -m "작업 내용 요약"
```

---

## 3. 브라우저 검증

### 3-1. 빠른 검증
간단한 UI 변경이나 빌드 에러 확인은 콘솔 로그만 확인:
```
browser_subagent: localhost:3000 접속 → 콘솔 로그 캡처 → 스크린샷 1장
```

### 3-2. AI 분석 기능 테스트
사진 업로드 테스트 시, 구글 이미지 검색에서 강아지 사진 URL을 사용하지 말고 **파일 업로드 기능**을 사용한다.

---

## 4. Gemini AI 관련 주의사항

### 환경변수
- API 키는 `.env` 파일에 `VITE_GEMINI_API_KEY=...` 형태로 저장
- 코드에서는 `import.meta.env.VITE_GEMINI_API_KEY` 사용 (Vite 프로젝트)
- **절대 `process.env` 사용 금지** (Node.js 전용, 브라우저에서 작동 안 함)

### 모델 설정
- 모델명: `gemini-2.5-flash` (안정 버전)
- `thinkingConfig: { thinkingBudget: 0 }` 추가 (응답 속도 향상)
- 타임아웃: 60초 이상

---

## 5. 다국어(i18n) 수정 규칙

### 번역 키 추가 시 5개 파일 동시 수정
```
src/locales/ko.json
src/locales/en.json
src/locales/ja.json
src/locales/zh.json
src/locales/es.json
```
하나라도 빠뜨리면 해당 언어에서 키 이름이 그대로 표시됨.

### 하드코딩 텍스트 교체
모든 사용자 노출 텍스트는 `t('key.name')` 함수로 감싸야 함.

---

## 6. 프로젝트 경로 정보

| 항목 | 경로 |
|------|------|
| 프로젝트 루트 | `c:\Users\Tim\Desktop\강아지 앱\강아지-스켄 (1)` |
| 메인 엔트리 | `src/App.tsx` (3972줄, monolithic) |
| 컴포넌트 | `src/components/screens/`, `src/components/common/` |
| 번역 파일 | `src/locales/{ko,en,ja,zh,es}.json` |
| 환경변수 | `.env` |
| Vite 설정 | `vite.config.ts` |
