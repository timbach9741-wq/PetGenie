import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, AlertTriangle, ChevronDown, Phone, Clock, Pill, Thermometer, Bug, Bone, Droplets, Eye, Heart, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

// 반려견 응급 상황 데이터 (다국어 지원 - fallback 텍스트 포함)
const getEmergencyData = (t: any) => [
  {
    id: 'chocolate',
    icon: Pill,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    title: t('emergency.chocolate_title', '초콜릿 섭취'),
    severity: t('emergency.high', '위험도 높음'),
    severityColor: 'text-rose-400 bg-rose-500/10',
    symptoms: [
      t('emergency.chocolate_s1', '구토, 설사'),
      t('emergency.chocolate_s2', '과도한 갈증, 빈뇨'),
      t('emergency.chocolate_s3', '심박수 증가, 떨림'),
      t('emergency.chocolate_s4', '심한 경우 경련, 의식불명'),
    ],
    actions: [
      t('emergency.chocolate_a1', '섭취량과 초콜릿 종류를 파악하세요'),
      t('emergency.chocolate_a2', '2시간 이내라면 수의사 지시 하에 구토 유도'),
      t('emergency.chocolate_a3', '즉시 가까운 동물병원에 연락하세요'),
      t('emergency.chocolate_a4', '활성탄 투여는 수의사 판단 하에만'),
    ],
  },
  {
    id: 'heatstroke',
    icon: Thermometer,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    title: t('emergency.heatstroke_title', '열사병 / 과열'),
    severity: t('emergency.critical', '즉시 대응'),
    severityColor: 'text-rose-400 bg-rose-500/10',
    symptoms: [
      t('emergency.heatstroke_s1', '과도한 헐떡임, 침 흘림'),
      t('emergency.heatstroke_s2', '잇몸이 빨갛거나 창백함'),
      t('emergency.heatstroke_s3', '비틀거림, 무기력'),
      t('emergency.heatstroke_s4', '구토, 의식 저하'),
    ],
    actions: [
      t('emergency.heatstroke_a1', '즉시 그늘진 시원한 곳으로 이동'),
      t('emergency.heatstroke_a2', '미지근한 물(차가운 물 X)로 몸을 적셔주기'),
      t('emergency.heatstroke_a3', '선풍기 바람 쐬어주기'),
      t('emergency.heatstroke_a4', '소량의 물 마시게 하고 즉시 병원으로'),
    ],
  },
  {
    id: 'poisoning',
    icon: AlertTriangle,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    title: t('emergency.poisoning_title', '독성 물질 섭취'),
    severity: t('emergency.critical', '즉시 대응'),
    severityColor: 'text-rose-400 bg-rose-500/10',
    symptoms: [
      t('emergency.poisoning_s1', '구토, 설사 (혈변 포함 가능)'),
      t('emergency.poisoning_s2', '과도한 침 흘림'),
      t('emergency.poisoning_s3', '경련, 떨림'),
      t('emergency.poisoning_s4', '호흡 곤란, 무기력'),
    ],
    actions: [
      t('emergency.poisoning_a1', '섭취한 물질의 이름/성분 확인'),
      t('emergency.poisoning_a2', '임의로 구토를 유도하지 마세요'),
      t('emergency.poisoning_a3', '즉시 동물병원 또는 동물 독성센터에 연락'),
      t('emergency.poisoning_a4', '섭취한 물질의 포장지를 가져가세요'),
    ],
  },
  {
    id: 'choking',
    icon: Zap,
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    title: t('emergency.choking_title', '질식 / 이물질'),
    severity: t('emergency.critical', '즉시 대응'),
    severityColor: 'text-rose-400 bg-rose-500/10',
    symptoms: [
      t('emergency.choking_s1', '기침, 헛구역질'),
      t('emergency.choking_s2', '입을 벌리고 발로 긁음'),
      t('emergency.choking_s3', '호흡 곤란, 파란 잇몸'),
    ],
    actions: [
      t('emergency.choking_a1', '입 안을 확인하고 보이는 이물질 제거'),
      t('emergency.choking_a2', '소형견: 머리를 아래로 하고 등을 두드리기'),
      t('emergency.choking_a3', '대형견: 하임리히법 (갈비뼈 아래 복부 압박)'),
      t('emergency.choking_a4', '제거 못하면 즉시 병원으로'),
    ],
  },
  {
    id: 'bleeding',
    icon: Droplets,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    title: t('emergency.bleeding_title', '외상 / 출혈'),
    severity: t('emergency.high', '위험도 높음'),
    severityColor: 'text-orange-400 bg-orange-500/10',
    symptoms: [
      t('emergency.bleeding_s1', '눈에 보이는 상처, 출혈'),
      t('emergency.bleeding_s2', '절룩거림, 통증 반응'),
      t('emergency.bleeding_s3', '부어오름'),
    ],
    actions: [
      t('emergency.bleeding_a1', '깨끗한 천으로 상처 부위를 압박 지혈'),
      t('emergency.bleeding_a2', '10분간 압박 유지'),
      t('emergency.bleeding_a3', '지혈이 안 되면 즉시 병원으로'),
      t('emergency.bleeding_a4', '골절 의심 시 부목 고정 후 이동'),
    ],
  },
  {
    id: 'seizure',
    icon: Zap,
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    title: t('emergency.seizure_title', '경련 / 발작'),
    severity: t('emergency.critical', '즉시 대응'),
    severityColor: 'text-rose-400 bg-rose-500/10',
    symptoms: [
      t('emergency.seizure_s1', '몸 전체 떨림, 경직'),
      t('emergency.seizure_s2', '의식 상실, 눈 풀림'),
      t('emergency.seizure_s3', '침 흘림, 대소변 실수'),
    ],
    actions: [
      t('emergency.seizure_a1', '주변 위험한 물건 치우기'),
      t('emergency.seizure_a2', '절대 입에 손을 넣지 마세요'),
      t('emergency.seizure_a3', '발작 시간을 기록하세요 (영상 촬영 추천)'),
      t('emergency.seizure_a4', '5분 이상 지속되면 즉시 병원으로'),
    ],
  },
  {
    id: 'vomiting',
    icon: Bug,
    color: 'bg-green-500/10 text-green-400 border-green-500/20',
    title: t('emergency.vomiting_title', '반복적 구토 / 설사'),
    severity: t('emergency.medium', '주의 필요'),
    severityColor: 'text-amber-400 bg-amber-500/10',
    symptoms: [
      t('emergency.vomiting_s1', '24시간 내 3회 이상 구토'),
      t('emergency.vomiting_s2', '혈변 또는 검은 변'),
      t('emergency.vomiting_s3', '탈수 증상 (잇몸 건조)'),
    ],
    actions: [
      t('emergency.vomiting_a1', '12시간 금식 후 소량의 물 제공'),
      t('emergency.vomiting_a2', '부드러운 음식(삶은 닭+밥)으로 시작'),
      t('emergency.vomiting_a3', '혈변이 있으면 즉시 병원으로'),
      t('emergency.vomiting_a4', '탈수 방지를 위해 수분 섭취 관찰'),
    ],
  },
  {
    id: 'eye',
    icon: Eye,
    color: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    title: t('emergency.eye_title', '눈 부상 / 이상'),
    severity: t('emergency.medium', '주의 필요'),
    severityColor: 'text-amber-400 bg-amber-500/10',
    symptoms: [
      t('emergency.eye_s1', '눈을 비비거나 긁음'),
      t('emergency.eye_s2', '충혈, 부어오름, 분비물'),
      t('emergency.eye_s3', '눈을 뜨지 못함'),
    ],
    actions: [
      t('emergency.eye_a1', '깨끗한 식염수로 부드럽게 세척'),
      t('emergency.eye_a2', '눈을 긁지 못하게 엘리자베스 칼라 착용'),
      t('emergency.eye_a3', '이물질이 보이면 제거하지 말고 병원으로'),
    ],
  },
];

const EmergencyGuideScreen = ({ onBack }: { onBack: () => void }) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const emergencies = getEmergencyData(t);

  return (
    <div className="h-full bg-[#0A120A] overflow-y-auto no-scrollbar pb-[calc(100px+env(safe-area-inset-bottom,0px))]">
      <header className="px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 flex items-center gap-4 bg-[#0A120A] sticky top-0 z-50">
        <button onClick={onBack} title={t('common.back', '뒤로가기')} aria-label={t('common.back', '뒤로가기')} className="p-2 -ml-2 text-white hover:bg-white/10 rounded-full active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-white">{t('emergency.title', '응급 상황 가이드')}</h1>
      </header>

      <div className="p-6 space-y-6">
        {/* 경고 배너 */}
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <p className="text-rose-300 font-bold text-sm mb-1">{t('emergency.call_vet', '응급 시 가까운 동물병원에 즉시 연락하세요')}</p>
            <p className="text-rose-400/60 text-xs">{t('emergency.disclaimer', '이 가이드는 응급 처치 참고용이며, 전문 수의사의 진료를 대체하지 않습니다.')}</p>
          </div>
        </div>

        {/* 응급 상황 목록 */}
        <div className="space-y-3">
          {emergencies.map((item) => {
            const isExpanded = expandedId === item.id;
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                layout
                className={cn("border rounded-2xl overflow-hidden transition-colors", item.color.split(' ')[0], isExpanded ? 'border-white/10' : 'border-white/5')}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full p-5 flex items-center gap-4 text-left"
                >
                  <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", item.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm">{item.title}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block", item.severityColor)}>
                      {item.severity}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform", isExpanded && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 space-y-4">
                        {/* 증상 */}
                        <div>
                          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                            {t('emergency.symptoms', '주요 증상')}
                          </p>
                          <div className="space-y-1.5">
                            {item.symptoms.map((s, i) => (
                              <p key={i} className="text-zinc-300 text-xs flex items-start gap-2">
                                <span className="text-rose-400 mt-0.5">•</span> {s}
                              </p>
                            ))}
                          </div>
                        </div>
                        {/* 대응 방법 */}
                        <div>
                          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                            {t('emergency.actions', '즉시 대응')}
                          </p>
                          <div className="space-y-2">
                            {item.actions.map((a, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <p className="text-zinc-300 text-xs">{a}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EmergencyGuideScreen;
