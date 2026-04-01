import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      // 매뉴얼 청크 분리로 초기 로딩 최적화
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['motion/react'],
            'vendor-i18n': ['react-i18next', 'i18next'],
            'vendor-icons': ['lucide-react'],
          },
        },
      },
      // 청크 크기 경고 제한
      chunkSizeWarningLimit: 600,
      // 소스맵 비활성화 (프로덕션 빌드 크기 감소)
      sourcemap: false,
      // CSS 코드 스플리팅
      cssCodeSplit: true,
      // 최소화 옵션
      minify: 'esbuild',
      target: 'es2020',
    },
    // 의존성 사전 번들링 최적화
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-i18next',
        'i18next',
        'motion/react',
        'lucide-react',
      ],
    },
  };
});
