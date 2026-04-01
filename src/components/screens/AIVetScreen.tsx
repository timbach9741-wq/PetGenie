import { ADMOB_IDS } from '../../config/ads';
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Send, User, AlertCircle, Loader2, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchVetAnalysis } from '../../services/geminiService';
import { PetProfile } from '../../types';
import vetImage from '../../assets/images/ai-vet-character.png';
import DrSilvermanHeader from '../common/DrSilvermanHeader';

const VET_PHOTO = vetImage;

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
  const [consultationTokens, setConsultationTokens] = useState(3);
  const [showAdPopup, setShowAdPopup] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
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

  const handleWatchAd = () => {
    setShowAdPopup(false);
    setIsAdLoading(true);
    // Simulate Ad Network Request
    setTimeout(() => {
      // Simulate 30% chance of Ad Load Failure
      const isFailed = Math.random() < 0.3;
      setIsAdLoading(false);
      
      if (isFailed) {
        // Fallback: Give 1 token anyway
        alert(t('ai_vet.ad_failed_fallback', '광고 로드에 실패했습니다. 예외적으로 1회 상담 기회를 시크릿 제공합니다!'));
        setConsultationTokens(1);
      } else {
        // Ad watched successfully
        alert(t('ai_vet.ad_reward_success', '광고 시청 혜택으로 1회 무료 상담이 충전되었습니다.'));
        setConsultationTokens(1);
      }
    }, 1500);
  };

  // --- 메시지 전송 핸들러 ---
  const handleSend = async () => {
    if (!isPremium && consultationTokens <= 0) {
      setShowAdPopup(true);
      return;
    }
    if (!inputText.trim() || isLoading) return;
    if (!isPremium && consultationTokens <= 0) return;
    if (!isPremium) setConsultationTokens(prev => prev - 1);

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

      const aiResponse = await fetchVetAnalysis(userMsg, undefined, currentLang, petInfo, chatHistory);
      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    } catch (err: any) {
      console.error('AI Vet Error:', err);
      // Fallback response for demonstration when API Quota defaults
      const fallbackMsg = i18n.language === 'ko' 
        ? "죄송합니다만, 현재 제가 너무 많은 진료 요청을 처리하고 있어 잠시 후 다시 질문해 주시면 감사하겠습니다. (Gemini API 일일 할당량 초과)"
        : "I apologize, but I am currently processing too many requests. Please try asking again in a few minutes. (Gemini API Quota Exceeded)";
      setMessages(prev => [...prev, { role: 'ai', content: fallbackMsg }]);
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
        <span className="font-bold text-zinc-900 text-sm ml-2">{t('nav.ai_vet', 'AI 수의사')}</span>
      </header>
      <DrSilvermanHeader />

      {/* Profile Hero (첫 진입 시만 표시) */}
      {showProfile && messages.length === 0 && (
        <div className="bg-white p-6 flex flex-col items-center border-b border-zinc-100">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 mb-3 shadow-lg">
            <img src={VET_PHOTO} alt="AI Vet" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <h2 className="font-bold text-lg text-zinc-800">{t('nav.ai_vet', 'AI 수의사')}</h2>
          <p className="text-sm text-zinc-500 text-center px-4 mt-2 leading-relaxed">
            {t('ai_vet_welcome', '안녕하세요! 전담 AI 수의사입니다. 오늘 아이에게 어떤 도움이 필요하신가요?')}
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

      
      {/* 팝업 모달: 보상형 광고 */}
      <AnimatePresence>
        {showAdPopup && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-50">
                <Gift className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-center text-zinc-900 mb-2">상담 한도 소진</h3>
              <p className="text-[9px] text-zinc-400 font-mono text-center mb-1">UNIT: ca-app-pub-7630237731274328/6964597935</p>
              <p className="text-sm text-zinc-500 text-center mb-6 leading-relaxed">
                일일 무료 상담(3회)이 모두 소진되었습니다.<br/>광고를 시청하고 상담 기회를 1회 추가하시겠어요?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowAdPopup(false)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  취소(Cancel)
                </button>
                <button 
                  onClick={handleWatchAd}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-purple-900/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" /> 광고 보기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        )
        <p className="text-[9px] text-zinc-400 text-center mt-2 pb-1">
          {t('ai_vet_disclaimer', 'AI 수의사의 답변은 참고용이며, 정확한 진단을 대체할 수 없습니다.')}
        </p>
      </div>
    </div>
  );
};

export default AIVetScreen;
