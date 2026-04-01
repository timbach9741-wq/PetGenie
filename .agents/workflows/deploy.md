---
description: Pet Genie 앱을 빌드하고 Google Play Store에 배포하는 자동화 워크플로우
---

# Pet Genie 빌드 & 배포

## 자동 배포 (원클릭)
// turbo
1. PowerShell에서 deploy.ps1 실행
```
powershell -ExecutionPolicy Bypass -File "c:\Users\Tim\Desktop\Pet App\pet scen 1\deploy.ps1"
```

이 스크립트가 자동으로 수행하는 작업:
- versionCode / versionName 자동 증가
- Vite 프로덕션 빌드
- Capacitor Android 동기화
- 서명된 AAB 빌드
- 바탕화면에 AAB 파일 복사
- Google Play Console 브라우저 오픈

## 수동 배포 (단계별)
1. `npx vite build`
2. `npx cap sync android`
3. `build.gradle`에서 versionCode +1
4. `$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"; .\gradlew.bat bundleRelease`
5. `android\app\build\outputs\bundle\release\app-release.aab` 를 Google Play Console에 업로드
