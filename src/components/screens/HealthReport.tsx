import { useTranslation, Trans } from 'react-i18next';
import { Heart, Activity, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Search, MoreVertical, TrendingUp, Utensils, BriefcaseMedical, Dna, BookOpen, Quote, Lock, User, Image } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import type { Screen } from '../../types';
import AdBanner from '../common/AdBanner';


const HealthReport = ({ onBack, isPremium, onUpgrade, analysisResult, capturedImage, onNavigate, onSelectCareGuides }: { onBack: () => void, isPremium: boolean, onUpgrade: () => void, analysisResult?: any, capturedImage?: string | null, onNavigate?: (s: Screen) => void, onSelectCareGuides?: (guides: any[]) => void }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>
      <header className="px-6 pb-6 flex items-center justify-between bg-[#0A120A] sticky top-0 z-50" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
        <button onClick={onBack} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold text-white uppercase tracking-widest">{t('analysis.detail_title')}</h1>
        <button className="p-2 text-zinc-400">
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="p-6 space-y-8">
        {/* Analysis Image Preview */}
        {capturedImage && (
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
            <img 
              src={capturedImage} 
              alt="Analyzed Pet" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A120A] via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{t('camera.analysis_complete')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Breed Analysis Result */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white tracking-tight">{t('dashboard.breed_analysis')}</h3>
            <div className="flex items-center gap-1.5 text-[#00FF41] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('analysis.confidence') || 'Confidence'} {analysisResult?.breedMatch || 85}%</span>
            </div>
          </div>
          
          {/* Confidence Progress Bar - visible for all users */}
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${analysisResult?.breedMatch || 85}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-[#00FF41] rounded-full shadow-[0_0_15px_rgba(0,255,65,0.4)]"
            />
          </div>
          <p className="text-[10px] text-zinc-500 mb-8 text-right">{t('analysis.ai_confidence') || 'AI Analysis Confidence'}: {analysisResult?.breedMatch || 85}%</p>

          {/* Primary breed - visible to all */}
          <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00FF41]" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.primary_breed')}</span>
            </div>
            <h4 className="text-lg font-bold text-white mb-1">{analysisResult?.primaryBreed || "Golden Retriever"}</h4>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-black text-[#00FF41]">{isPremium ? `${analysisResult?.primaryPercentage || 70}%` : '??%'}</p>
              {!isPremium && <span className="text-[10px] text-zinc-500">({t('analysis.upgrade_to_see') || 'Upgrade to see'})</span>}
            </div>
          </div>

          {/* Secondary breed - Premium only */}
          {isPremium ? (
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.secondary_breed')}</span>
              </div>
              <h4 className="text-lg font-bold text-zinc-300 mb-1">{analysisResult?.secondaryBreed || "Jindo Dog"}</h4>
              <p className="text-2xl font-black text-zinc-500">{analysisResult?.secondaryPercentage || 30}%</p>
            </div>
          ) : (
            <div className="bg-white/5 rounded-3xl p-5 border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-md flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Premium</span>
                </div>
              </div>
              <div className="blur-[4px] opacity-30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('dashboard.secondary_breed')}</span>
                </div>
                <h4 className="text-lg font-bold text-zinc-300 mb-1">???</h4>
                <p className="text-2xl font-black text-zinc-500">??%</p>
              </div>
            </div>
          )}
        </section>

        {/* Free User: Premium Upgrade CTA */}
        {!isPremium && (
          <>
            {/* Teaser - show blurred preview of detailed analysis */}
            <section className="relative rounded-[2.5rem] overflow-hidden border border-white/5">
              {/* Blurred preview background */}
              <div className="p-8 space-y-4 blur-[6px] opacity-30 pointer-events-none select-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 bg-white/10 rounded" />
                    <div className="h-2 w-20 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-12 bg-white/5 rounded-2xl" />
                  <div className="h-12 bg-white/5 rounded-2xl" />
                  <div className="h-12 bg-white/5 rounded-2xl" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-20 bg-white/5 rounded-2xl" />
                  <div className="h-20 bg-white/5 rounded-2xl" />
                </div>
              </div>
              
              {/* Overlay CTA */}
              <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#0A120A]/60 via-[#0A120A]/90 to-[#0A120A] flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('report.premium_report_title')}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-[260px] mx-auto whitespace-pre-wrap">
                      {t('report.premium_report_desc')}
                    </p>
                  </div>
                  
                  {/* Feature preview list */}
                  <div className="space-y-2 text-left max-w-[240px] mx-auto">
                    {[
                      { icon: '🧬', text: t('report.risk_factors_title') },
                      { icon: '🔍', text: t('dashboard.breed_analysis') },
                      { icon: '📊', text: t('report.genetic_mix_title') },
                      { icon: '💊', text: t('report.ai_insights_title') },
                      { icon: '📋', text: t('dashboard.expert_guide') },
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5 border border-white/5"
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs font-medium text-zinc-300">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onUpgrade}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black px-10 py-4 rounded-2xl text-sm font-black shadow-2xl shadow-emerald-500/30 w-full max-w-[260px]"
                  >
                    🔓 {i18n.language.startsWith('en') ? 'Start Premium — $4.99/mo' : i18n.language.startsWith('ja') ? 'Premiumを開始 — $4.99/月' : i18n.language.startsWith('zh') ? '开始 Premium — $4.99/月' : i18n.language.startsWith('es') ? 'Iniciar Premium — $4.99/mes' : 'Premium 시작하기 — $4.99/월'}
                  </motion.button>
                  <p className="text-[10px] text-zinc-600 font-medium">
                    {i18n.language.startsWith('en') ? 'Cancel anytime · 7-day free trial' : i18n.language.startsWith('ja') ? 'いつでもキャンセル可能・7日間無料体験' : i18n.language.startsWith('zh') ? '随时取消 · 7天免费试用' : i18n.language.startsWith('es') ? 'Cancela en cualquier momento · 7 días gratis' : '언제든지 해지 가능 · 7일 무료 체험'}
                  </p>
                </motion.div>
              </div>
            </section>

            {/* AdSense for Free Users */}
            <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
          </>
        )}

        {/* === ANALYSIS SECTIONS (visible to all, content restricted for free) === */}
        {/* Identification Basis - Evidence Section */}
        {analysisResult?.identificationBasis && (
          <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {i18n.language.startsWith('ja') ? '品種識別根拠' : i18n.language.startsWith('en') ? 'Identification Basis' : i18n.language.startsWith('zh') ? '品种识别依据' : i18n.language.startsWith('es') ? 'Base de identificación' : '품종 식별 근거'}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Identification Basis</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {analysisResult.identificationBasis.map((basis: string, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className={cn(
                    "flex items-start gap-3 bg-white/5 rounded-2xl p-4 border border-white/5 relative overflow-hidden",
                    !isPremium && i >= 1 && "max-h-[60px]"
                  )}
                >
                  {!isPremium && i >= 1 && (
                    <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[4px] flex items-center justify-center">
                      <button onClick={onUpgrade} className="text-[9px] font-black text-[#00FF41] uppercase tracking-tighter border border-[#00FF41]/30 px-3 py-1 rounded-full bg-[#00FF41]/5">
                        Premium
                      </button>
                    </div>
                  )}
                  <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-black text-blue-400">{i + 1}</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">{basis}</p>
                </motion.div>
              ))}
            </div>

            {analysisResult?.breedSource && (
              <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-400/80 tracking-wide">
                  📋 {i18n.language.startsWith('ja') ? '出典' : i18n.language.startsWith('en') ? 'Source' : i18n.language.startsWith('zh') ? '来源' : i18n.language.startsWith('es') ? 'Fuente' : '출처'}: {analysisResult.breedSource}
                </span>
              </div>
            )}
          </section>
        )}

        {/* Expert Insights Section (NotebookLM Based) */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('dashboard.expert_guide')}</h3>
          </div>

          <div className="space-y-6">
            <div className="relative pl-6 border-l-2 border-[#00FF41]/30">
              <Quote className="absolute -left-1 -top-2 w-4 h-4 text-[#00FF41] opacity-50" />
              <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                {analysisResult?.expertInsights?.wsava || (i18n.language.startsWith('ja') ? '栄養状態は体温、脈拍と並ぶ「5番目のバイタルサイン」です。体系的な栄養評価により疾病を予防し寿命を延ばすことができます。' : i18n.language.startsWith('en') ? 'Nutritional status is the "fifth vital sign" alongside temperature and pulse. Systematic nutritional assessment can prevent disease and extend lifespan.' : '영양 상태는 체온, 맥박과 함께 "다섯 번째 활력징후"입니다. 체계적인 영양 평가를 통해 질병을 예방하고 수명을 연장할 수 있습니다.')}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {i18n.language.startsWith('ja') ? '出典：世界小動物獣医師会（WSAVA）ガイドライン' : i18n.language.startsWith('en') ? 'Source: World Small Animal Veterinary Association (WSAVA) Guidelines' : i18n.language.startsWith('zh') ? '来源：世界小动物兽医协会（WSAVA）指南' : i18n.language.startsWith('es') ? 'Fuente: Directrices de WSAVA' : '출처: 세계소동물수의사회 (WSAVA) 지침'}
                </span>
              </div>
            </div>

            <div className="relative">
              {!isPremium && (
                <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[6px] flex flex-col items-center justify-center rounded-xl border border-white/5">
                  <button onClick={onUpgrade} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md">
                    {t('dashboard.premium_only')}
                  </button>
                </div>
              )}
              <div className={cn("pl-6 border-l-2 border-blue-500/30", !isPremium && "opacity-40 blur-[2px]")}>
                <Quote className="absolute -left-1 -top-2 w-4 h-4 text-blue-400 opacity-50" />
                <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                  {analysisResult?.expertInsights?.steveMann || (i18n.language.startsWith('ja') ? '強圧的な方法の代わりに、おやつやおもちゃを活用した「正の強化トレーニング」が愛犬との信頼関係を築く鍵です。ボディランゲージを理解し、コミュニケーションを取りましょう。' : i18n.language.startsWith('en') ? 'Instead of coercive methods, "positive reinforcement training" using treats and toys is key to building trust with your dog. Understand their body language and communicate.' : '강압적인 방식 대신 간식과 장난감을 활용한 "긍정강화교육"이 반려견과의 신뢰를 쌓는 핵심입니다. 보디랭귀지를 이해하고 소통하세요.')}
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {i18n.language.startsWith('ja') ? '出典：スティーブ・マン（Steve Mann）教育方法論' : i18n.language.startsWith('en') ? 'Source: Steve Mann Training Methodology' : i18n.language.startsWith('zh') ? '来源：Steve Mann 教育方法论' : i18n.language.startsWith('es') ? 'Fuente: Metodología de Steve Mann' : '출처: 스티브 만 (Steve Mann) 교육 방법론'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl">
              <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {t('dashboard.notebooklm_desc')}
              </p>
            </div>
          </div>
        </section>

        {/* Genetic Mix Breakdown */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-8 shadow-sm border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-[#00FF41]">
              <Dna className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">{t('report.genetic_mix_title')}</h3>
          </div>
          
            <div className="space-y-6">
            {(analysisResult?.lineage || [
              { label: t('breed_retriever'), value: 72, color: 'bg-[#00FF41]' },
              { label: t('breed_spitz'), value: 25, color: 'bg-zinc-500' },
              { label: t('breed_others'), value: 3, color: 'bg-zinc-700' },
            ]).map((item: any, i: number) => (
              <div key={i} className={cn("space-y-2 relative", !isPremium && i >= 1 && "opacity-30 blur-[3px]")}>
                <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-zinc-400">{item.label}</span>
                  <span className="text-white">{isPremium || i === 0 ? `${item.value}%` : '??%'}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    className={cn("h-full rounded-full", item.color)}
                  />
                </div>
              </div>
            ))}
            {!isPremium && (
              <button onClick={onUpgrade} className="w-full text-center text-[10px] font-black text-[#00FF41] uppercase tracking-widest border border-[#00FF41]/20 px-4 py-3 rounded-2xl bg-[#00FF41]/5 hover:bg-[#00FF41]/10 transition-all">
                🔓 전체 유전 믹스 보기
              </button>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              {t('report.disclaimer')}
            </p>
          </div>
        </section>

        {/* Genetic Risk Factors */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">{t('report.risk_factors_title')}</h3>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Genetic Health Screening</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t('report.risk_count', { count: (analysisResult?.riskFactors || []).length })}</span>
            </div>
          </div>
          
          <div className="grid gap-5">
            {(analysisResult?.riskFactors || [
              {
                name: "고관절 이형성증",
                riskLevel: "high",
                description: "골든 리트리버 품종에서 흔히 발생합니다. 관절 건강을 위해 조기 발견과 체중 관리가 매우 중요합니다."
              }
            ]).map((risk: any, i: number) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "group relative bg-[#0D0D0D] rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden",
                  !isPremium && i > 0 && "max-h-[120px]"
                )}
              >
                {!isPremium && i > 0 && (
                  <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">{t('report.additional_risks', { count: analysisResult?.riskFactors?.length - 1 || 0 })}</p>
                    <button onClick={onUpgrade} className="text-[9px] font-black text-[#00FF41] uppercase tracking-tighter border border-[#00FF41]/30 px-3 py-1 rounded-full bg-[#00FF41]/5">
                      {t('report.premium_only')}
                    </button>
                  </div>
                )}
                {/* Vertical Accent Bar */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5",
                  risk.riskLevel === 'high' ? "bg-rose-500" : 
                  risk.riskLevel === 'medium' ? "bg-orange-500" : "bg-emerald-500"
                )} />

                <div className={cn("p-8", !isPremium && i > 0 && "blur-[4px] opacity-20")}>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                        risk.riskLevel === 'high' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                        risk.riskLevel === 'medium' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" : 
                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      )}>
                        <BriefcaseMedical className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-[#00FF41] transition-colors">{risk.name}</h4>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                          {risk.riskLevel === 'high' ? 'Critical Risk' : risk.riskLevel === 'medium' ? 'Moderate Risk' : 'Low Risk'}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                      risk.riskLevel === 'high' ? "bg-rose-500 text-white" : 
                      risk.riskLevel === 'medium' ? "bg-orange-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                      {risk.riskLevel === 'high' ? t('report.risk_level_high') : risk.riskLevel === 'medium' ? t('report.risk_level_medium') : t('report.risk_level_low')}
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm leading-relaxed font-medium mb-4">
                    {risk.description}
                  </p>

                  {/* Evidence badges: prevalence & source */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {risk.prevalence && (
                      <div className="flex items-center gap-1.5 bg-rose-500/5 border border-rose-500/10 px-3 py-1.5 rounded-xl">
                        <TrendingUp className="w-3 h-3 text-rose-400" />
                        <span className="text-[10px] font-bold text-rose-300/80 tracking-wide">{risk.prevalence}</span>
                      </div>
                    )}
                    {risk.source && (
                      <div className="flex items-center gap-1.5 bg-blue-500/5 border border-blue-500/10 px-3 py-1.5 rounded-xl">
                        <BookOpen className="w-3 h-3 text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-300/80 tracking-wide">📋 {risk.source}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((_, idx) => (
                          <div key={idx} className="w-6 h-6 rounded-full border-2 border-[#0D0D0D] bg-zinc-800 flex items-center justify-center overflow-hidden">
                            <img src={`https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=40&h=40&sig=${idx}`} className="w-full h-full object-cover opacity-50" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('report.expert_review')}</span>
                    </div>
                    <button 
                      onClick={() => {
                        if (isPremium) {
                          if (risk.careGuides) {
                            onSelectCareGuides?.(risk.careGuides);
                          }
                          onNavigate?.('care-guide');
                        } else {
                          onUpgrade();
                        }
                      }}
                      className="flex items-center gap-2 text-white/40 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group/btn"
                    >
                      {t('report.care_guide_link')} <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Subtle background pattern */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <Dna className="w-32 h-32 rotate-12" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AI Health Insights Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white tracking-tight">{t('report.ai_insights_title')}</h3>
              <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">AI-Powered Recommendations</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {analysisResult ? (() => {
              const insights = analysisResult.expertInsights || {
                expertAdvice: i18n.language.startsWith('en') ? 'Based on breed characteristics, regular veterinary check-ups and balanced nutrition are essential for optimal health.' : i18n.language.startsWith('ja') ? '品種特性に基づき、定期的な獣医検診とバランスの取れた栄養が最適な健康のために重要です。' : i18n.language === 'zh-TW' ? '根據品種特性，定期獸醫檢查和均衡營養對最佳健康至關重要。' : i18n.language.startsWith('es') ? 'Basado en las características de la raza, los chequeos veterinarios regulares y la nutrición equilibrada son esenciales.' : '품종 특성에 따라 정기적인 수의사 검진과 균형 잡힌 영양 관리가 건강의 핵심입니다.',
                wsava: i18n.language.startsWith('en') ? 'Nutritional status is the "fifth vital sign". Systematic nutritional assessment can prevent disease and extend lifespan.' : i18n.language.startsWith('ja') ? '栄養状態は「5番目のバイタルサイン」です。体系的な栄養評価により疾病を予防し寿命を延ばすことができます。' : i18n.language === 'zh-TW' ? '營養狀態是「第五大生命徵象」。系統性營養評估可以預防疾病並延長壽命。' : i18n.language.startsWith('es') ? 'El estado nutricional es el "quinto signo vital". La evaluación nutricional sistemática puede prevenir enfermedades.' : '영양 상태는 체온, 맥박과 함께 "다섯 번째 활력징후"입니다. 체계적인 영양 평가를 통해 질병을 예방하고 수명을 연장할 수 있습니다.',
                steveMann: i18n.language.startsWith('en') ? 'Positive reinforcement training using treats and toys is key to building trust with your dog.' : i18n.language.startsWith('ja') ? 'おやつやおもちゃを活用した「正の強化トレーニング」が愛犬との信頼関係を築く鍵です。' : i18n.language === 'zh-TW' ? '使用零食和玩具的「正向強化訓練」是建立與愛犬信任關係的關鍵。' : i18n.language.startsWith('es') ? 'El entrenamiento de refuerzo positivo usando premios y juguetes es clave para construir confianza.' : '간식과 장난감을 활용한 "긍정강화교육"이 반려견과의 신뢰를 쌓는 핵심입니다.'
              };
              return (
              <div className="bg-[#0D0D0D] rounded-[2.5rem] p-8 border border-white/5 space-y-8 relative overflow-hidden group hover:border-white/10 transition-all duration-500">
                <div className="flex items-start gap-5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">{t('report.expert_advice')}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{insights.expertAdvice}</p>
                  </div>
                </div>
                
                <div className={cn("flex items-start gap-5 relative z-10", !isPremium && "opacity-30 blur-[4px]")}>
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">{t('report.nutrition_vital')}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{insights.wsava}</p>
                  </div>
                </div>
                
                <div className={cn("flex items-start gap-5 relative z-10", !isPremium && "opacity-30 blur-[4px]")}>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-white">{t('report.behavior_training')}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-medium">{insights.steveMann}</p>
                  </div>
                </div>
                {!isPremium && (
                  <button onClick={onUpgrade} className="w-full text-center text-[10px] font-black text-[#00FF41] uppercase tracking-widest border border-[#00FF41]/20 px-4 py-3 rounded-2xl bg-[#00FF41]/5 hover:bg-[#00FF41]/10 transition-all relative z-10">
                    🔓 {t('report.unlock_insights')}
                  </button>
                )}

                {/* Decorative background glow */}
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] group-hover:bg-emerald-500/10 transition-colors" />
              </div>
              );
            })() : (
              <div className="bg-[#0D0D0D] rounded-[2.5rem] p-12 border border-dashed border-white/10 text-center space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                  <Activity className="w-8 h-8" />
                </div>
                <p className="text-zinc-500 text-sm">{t('report.no_analysis')}</p>
              </div>
            )}
          </div>
        </section>


        {/* Detailed Genetic Analysis */}
        <section className="relative">
          <div className="bg-[#111] rounded-[2.5rem] p-8 border border-white/5 overflow-hidden relative group">
            {!isPremium && (
              <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[8px] flex flex-col items-center justify-center p-8 text-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 bg-[#00FF41] text-black rounded-[1.5rem] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,65,0.3)]"
                >
                  <Dna className="w-8 h-8" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-2">정밀 유전 분석 리포트</h4>
                <p className="text-zinc-400 text-xs mb-8 leading-relaxed max-w-[200px] mx-auto">
                  프리미엄 회원만 확인 가능한<br />
                  <span className="text-white font-bold">상세 유전 질환 24종</span> 및<br />
                  <span className="text-white font-bold">혈통 분석 데이터</span>입니다.
                </p>
                <button 
                  onClick={onUpgrade}
                  className="bg-white text-black px-10 py-4 rounded-2xl text-xs font-black shadow-2xl active:scale-95 transition-all hover:bg-[#00FF41]"
                >
                  멤버십 업그레이드
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-500">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{t('analysis.mapping_title')}</h3>
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Advanced DNA Mapping</p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-zinc-700" />
              </div>
            </div>

            <div className="space-y-6">
              {(analysisResult?.detailedMarkers || [
                { label: 'MDR1 유전자 변이', value: 98, status: 'normal' },
                { label: '퇴행성 골수염 (DM)', value: 85, status: 'normal' },
                { label: '진행성 망막 위축증', value: 12, status: 'caution' }
              ]).map((marker: any, i: number) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{marker.label}</span>
                      {marker.testSource && (
                        <span className="ml-2 text-[9px] font-medium text-zinc-600">({marker.testSource})</span>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-black px-2 py-0.5 rounded-md",
                      marker.status === 'normal' ? "bg-emerald-500/10 text-emerald-500" : 
                      marker.status === 'carrier' ? "bg-orange-500/10 text-orange-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {t(`analysis.status_${marker.status}`)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${marker.value}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className={cn(
                        "h-full rounded-full",
                        marker.status === '정상' ? "bg-emerald-500" : 
                        marker.status === '보인자' ? "bg-orange-500" : "bg-rose-500"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative Grid Lines */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>
        </section>

        {/* AI Analysis Disclaimer & Sources */}
        <section className="bg-[#1A241A] rounded-[2.5rem] p-6 shadow-sm border border-white/5">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              {analysisResult?.disclaimer || "이 분석은 AI 시각 평가와 공개된 수의학 연구를 기반으로 합니다. 전문 수의사의 진단을 대체하지 않습니다."}
            </p>
          </div>
          
          {analysisResult?.expertInsights?.sources && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">참고 자료 References</p>
              <div className="space-y-1">
                {analysisResult.expertInsights.sources.map((src: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-zinc-600" />
                    <span className="text-[10px] text-zinc-500 font-medium">{src}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>



        {/* Final Care CTA - Future of the Pet */}
        <section className="bg-gradient-to-br from-zinc-900 to-black rounded-[2.5rem] p-10 border border-white/10 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{t('analysis.future_title')}</h3>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed whitespace-pre-line">
              {t('analysis.future_desc')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onNavigate?.('diet-guide')}
                className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-xs font-bold border border-white/10 transition-all"
              >
                {t('analysis.diet_button')}
              </button>
              <button 
                onClick={() => onNavigate?.('exercise-plan')}
                className="bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl text-xs font-bold border border-white/10 transition-all"
              >
                {t('analysis.exercise_button')}
              </button>
            </div>
          </div>
          
          {/* Background Glow */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]" />
        </section>


        {/* AdSense for Free Users */}
        <AdBanner isPremium={isPremium} onUpgrade={onUpgrade} />
      </div>
    </div>
  );
};

export default HealthReport;
