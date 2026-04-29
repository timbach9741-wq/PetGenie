import React from 'react';
import { ArrowLeft, Info, Shield, FileText, Code, ChevronRight, ExternalLink } from 'lucide-react';
import packageJson from '../../../package.json';
import { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } from './AuthScreens';

export default function AppInfoScreen({ onBack }: { onBack: () => void }) {
  const currentVersion = packageJson.version || '1.1.6';

  return (
    <div className="h-full bg-zinc-50 flex flex-col overflow-hidden">
      {/* ===== Header ===== */}
      <header className="bg-white px-6 pb-4 border-b border-zinc-100 pt-[calc(env(safe-area-inset-top,0px)+44px)] shrink-0 flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="뒤로가기"
          className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-zinc-900">앱 정보</h1>
      </header>

      {/* ===== Content ===== */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-[calc(80px+env(safe-area-inset-bottom,0px))]">
        
        {/* App Logo & Version */}
        <div className="flex flex-col items-center justify-center pt-8 pb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-xl shadow-emerald-900/20 flex items-center justify-center mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 blend-overlay mix-blend-overlay"></div>
            <span className="text-4xl">🐾</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Pet Genie</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">Version {currentVersion}</p>
          <span className="mt-3 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
            최신 버전입니다
          </span>
        </div>

        {/* App Description & Features */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <span className="text-emerald-500">✨</span> 펫지니 주요 기능
          </h3>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-500 text-sm">🤖</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-zinc-800">AI 수의사 상담</h4>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">반려동물의 증상이나 이상 행동을 입력하면 AI가 예상 원인과 대처법을 빠르게 분석하여 안내합니다.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-emerald-500 text-sm">🚶‍♂️</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-zinc-800">주간 산책 랭킹 커뮤니티</h4>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">동네 반려인들과 주간 산책 기록을 공유하고 랭킹을 확인하며 즐겁고 건강한 산책 습관을 만들어 보세요.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <div className="w-8 h-8 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-rose-500 text-sm">📊</span>
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-zinc-800">맞춤형 건강 리포트</h4>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">매일 기록된 데이터를 바탕으로 식사량, 활동량 변화를 분석해 우리 아이의 건강 상태를 한눈에 파악합니다.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Info Links List */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          
          <button 
            onClick={() => window.open(TERMS_OF_SERVICE_URL, '_blank')}
            className="w-full flex items-center gap-4 p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-50"
          >
            <div className="w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-zinc-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-bold text-zinc-900">이용약관</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">서비스 이용에 대한 기본 방침</p>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-300" />
          </button>

          <button 
            onClick={() => window.open(PRIVACY_POLICY_URL, '_blank')}
            className="w-full flex items-center gap-4 p-5 hover:bg-zinc-50 transition-colors border-b border-zinc-50"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-bold text-zinc-900">개인정보 처리방침</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">안전한 데이터 보호 및 취급 방침</p>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-300" />
          </button>

          <div className="w-full flex items-center gap-4 p-5 border-b border-zinc-50">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Code className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-bold text-zinc-900">오픈소스 라이선스</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">사용된 오픈소스 소프트웨어 정보</p>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </div>

          <div className="w-full flex items-center gap-4 p-5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm font-bold text-zinc-900">개발자 정보</h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">제작 및 배포: Dailyhousing Corp.</p>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="text-center pt-8 pb-4">
          <p className="text-xs text-zinc-400 font-medium">© {new Date().getFullYear()} Pet Genie. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
