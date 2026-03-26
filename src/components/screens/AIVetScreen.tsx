import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, User, AlertCircle, Loader2 } from 'lucide-react';
import { fetchVetAnalysis } from '../../services/geminiService';
import { PetProfile } from '../../types';

// 실제 수의사 사진 (Unsplash)
const VET_PHOTO = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(true);
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
    setShowProfile(false);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);
    setError(null);

    try {
      // 이전 대화 히스토리 구성
      const chatHistory = messages
        .map(m => `${m.role === 'user' ? '보호자' : '수의사'}: ${m.content}`)
        .join('\n');

      // 반려동물 정보
      const petInfo = `이름: ${petProfile?.name || '알 수 없음'}, 나이: ${petProfile?.age || '알 수 없음'}, 견종: ${petProfile?.breed || '알 수 없음'}, 성별: ${petProfile?.gender || '알 수 없음'}`;

      // i18next 현재 언어 전달
      const currentLang = i18n.language;

      // Gemini API 호출
      const aiResponse = await fetchVetAnalysis(userMsg, undefined, currentLang, petInfo, chatHistory);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (err: any) {
      console.error('AI Vet Error:', err);
      setError(t('ai_vet.error', '오류가 발생했습니다. 다시 시도해주세요.'));
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-emerald-200 shadow-sm">
              <img src={VET_PHOTO} alt="AI Vet" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 text-sm">{t('nav_ai_vet', 'AI 수의사')}</h1>
            <p className="text-[10px] text-emerald-600 font-medium">Online • Dr. Joy</p>
          </div>
        </div>
      </header>

      {/* Profile Hero (첫 진입 시만 표시) */}
      {showProfile && messages.length === 0 && (
        <div className="bg-white p-6 flex flex-col items-center border-b border-zinc-100">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 mb-3 shadow-lg">
            <img src={VET_PHOTO} alt="AI Vet" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h2 className="font-bold text-lg text-zinc-800">{t('nav_ai_vet', 'AI 수의사')}</h2>
          <p className="text-sm text-zinc-500 text-center px-4 mt-2 leading-relaxed">
            {t('ai_vet_welcome', '안녕하세요! AI 수의사입니다. 오늘 아이의 상태는 어떤가요?')}
          </p>
        </div>
      )}

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
                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 border border-emerald-200">
                  <img src={VET_PHOTO} alt="AI Vet" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 mt-1 border border-emerald-200">
                <img src={VET_PHOTO} alt="AI Vet" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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
      {messages.length <= 1 && !isLoading && (
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
            placeholder={t('ai_vet.input_placeholder', '증상이나 궁금한 점을 입력하세요...')}
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
          {t('ai_vet_disclaimer', 'AI 수의사의 답변은 참고용이며, 정확한 진단을 대체할 수 없습니다.')}
        </p>
      </div>
    </div>
  );
};

export default AIVetScreen;
