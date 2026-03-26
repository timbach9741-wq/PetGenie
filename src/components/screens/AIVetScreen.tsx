import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, Sparkles, User, AlertCircle, Loader2 } from 'lucide-react';
import { fetchVetAnalysis } from '../../services/geminiService';
import { PetProfile } from '../../types';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface AIVetScreenProps {
  onBack: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
  petProfile: PetProfile;
}

const AIVetScreen: React.FC<AIVetScreenProps> = ({ onBack, isPremium, onUpgrade, petProfile }) => {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: t('ai_vet.welcome_msg') }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // --- 메시지 전송 핸들러 ---
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText.trim();
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    setError(null);

    try {
      // 이전 대화 히스토리 구성
      const chatHistory = messages
        .map(m => `${m.role === 'user' ? '보호자' : '수의사'}: ${m.content}`)
        .join('\n');

      // 반려동물 정보 문자열
      const petInfo = `이름: ${petProfile?.name || '알 수 없음'}, 나이: ${petProfile?.age || '알 수 없음'}, 견종: ${petProfile?.breed || '알 수 없음'}, 성별: ${petProfile?.gender || '알 수 없음'}`;

      // i18next에서 현재 언어를 가져와 API 호출 시 인자로 전달
      const currentLang = i18n.language; // 'ko', 'en', 'ja', 'zh', 'es'

      // geminiService 호출
      const aiResponse = await fetchVetAnalysis(
        userMsg,
        undefined,       // imageBase64 (현재 텍스트 전용)
        currentLang,     // 다국어 적용
        petInfo,         // 반려동물 정보
        chatHistory      // 이전 대화 내역
      );

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (err: any) {
      console.error('AI Vet Error:', err);
      setError(t('ai_vet.error'));
    } finally {
      setIsLoading(false);
    }
  };

  // --- 제안 칩 클릭 핸들러 ---
  const handleSuggestionClick = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50 relative z-50">
      {/* Header */}
      <header className="px-6 py-4 flex items-center bg-white border-b border-zinc-100 sticky top-0 z-10 shrink-0">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-zinc-900 hover:bg-zinc-100 rounded-full transition-transform active:scale-90 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 text-sm">{t('ai_vet.title')}</h1>
            <p className="text-[10px] text-emerald-600 font-medium">Online • Dr. Joy</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.role === 'user' ? (
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-zinc-200 mt-1">
                  <User className="w-3 h-3 text-zinc-600" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl text-[13px] ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 text-white rounded-tr-sm'
                    : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-sm whitespace-pre-wrap leading-relaxed'
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] gap-2 flex-row">
              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="p-3 rounded-2xl text-[13px] bg-white border border-zinc-200 text-zinc-500 rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>{t('ai_vet.thinking', '답변을 작성하고 있어요...')}</span>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 제안 칩 */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 pb-2 pt-1 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0 bg-white shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.05)] z-10 relative">
          <button onClick={() => handleSuggestionClick(t('ai_vet.suggestion_diet'))} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-sm active:scale-95">
            {t('ai_vet.suggestion_diet')}
          </button>
          <button onClick={() => handleSuggestionClick(t('ai_vet.suggestion_health'))} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-sm active:scale-95">
            {t('ai_vet.suggestion_health')}
          </button>
          <button onClick={() => handleSuggestionClick(t('ai_vet.suggestion_behavior'))} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors whitespace-nowrap shadow-sm active:scale-95">
            {t('ai_vet.suggestion_behavior')}
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3 bg-white border-t border-zinc-100 shrink-0 relative z-20">
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full p-1 pl-4 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-zinc-900 placeholder-zinc-400 py-2"
            placeholder={t('ai_vet.input_placeholder')}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[9px] text-zinc-400 text-center mt-2 pb-1">
          {t('ai_vet.disclaimer', 'AI 수의사의 답변은 참고용이며, 정확한 진단을 대체할 수 없습니다.')}
        </p>
      </div>
    </div>
  );
};

export default AIVetScreen;
