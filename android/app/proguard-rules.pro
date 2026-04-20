# ==============================================================
# Pet Genie - ProGuard / R8 규칙
# ==============================================================
# 목적: 코드 난독화(mapping.txt 생성)를 활성화하면서,
#       Capacitor WebView 앱이 정상 작동하도록 필수 클래스 보존.
# ==============================================================

# --- 디버깅용 라인 넘버 보존 (크래시 리포트 분석 시 필수) ---
-keepattributes SourceFile,LineNumberTable

# 원본 소스 파일명 숨기기 (보안 강화)
-renamesourcefileattribute SourceFile

# --- Capacitor / WebView 관련 필수 보존 ---
# Capacitor 플러그인의 JavaScript 인터페이스 보존
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Capacitor 코어 클래스 보존
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.** { *; }
-keep class io.capawesome.** { *; }
-dontwarn io.capawesome.**

# WebView 클래스 보존
-keep class android.webkit.** { *; }

# --- AndroidX 관련 보존 ---
-keep class androidx.** { *; }
-dontwarn androidx.**

# --- Google Play Services / AdMob 관련 보존 ---
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# --- Firebase 관련 보존 ---
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# --- Kotlin / Coroutine 관련 경고 무시 ---
-dontwarn kotlin.**
-dontwarn kotlinx.**

# --- 기타 일반 규칙 ---
# Serialization을 위한 enum 보존
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Parcelable 구현체 보존
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# R 클래스 보존
-keepclassmembers class **.R$* {
    public static <fields>;
}
