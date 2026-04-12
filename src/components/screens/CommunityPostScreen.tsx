/**
 * CommunityPostScreen — 게시글 작성 화면
 * ========================================
 * 왜 이 구조: 사진 + 텍스트를 조합한 간단한 게시글 작성 UI.
 * petProfile에서 반려견 정보를 자동 태그하여 작성 편의성을 높임.
 * input[type=file] capture 속성으로 갤러리/카메라 모두 지원.
 * ========================================
 */
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Image, Camera, Send, X, PawPrint, Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { auth } from '../../lib/firebase';
import { createPost } from '../../services/communityService';
import type { PetProfile } from '../../types';

interface CommunityPostScreenProps {
  onBack: () => void;
  petProfile: PetProfile;
  onPostCreated?: () => void; // 게시글 작성 완료 후 콜백
}

const CommunityPostScreen = ({ onBack, petProfile, onPostCreated }: CommunityPostScreenProps) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 이미지 선택 핸들러
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 확인 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('community.image_too_large', '이미지 크기는 5MB 이하만 가능합니다.'));
      return;
    }

    setImageFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 이미지 제거
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 게시글 작성 핸들러
  const handlePost = async () => {
    // 최소 입력 검증: 텍스트 또는 이미지 중 하나는 필수
    if (!text.trim() && !imageFile) return;

    const user = auth.currentUser;
    if (!user) return;

    setIsPosting(true);
    try {
      await createPost(
        {
          authorId: user.uid,
          authorEmail: user.email || '',
          authorName: user.displayName || user.email?.split('@')[0] || '익명',
          petName: petProfile.name || '우리 강아지',
          petBreed: petProfile.breed || '',
          type: 'photo',
          text: text.trim(),
        },
        imageFile,
      );

      // 성공 시 뒤로 이동
      onPostCreated?.();
      onBack();
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert(t('community.post_failed', '게시글 작성에 실패했습니다. 다시 시도해주세요.'));
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = (text.trim().length > 0 || imageFile) && !isPosting;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ── 헤더 ── */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-zinc-100 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-xl hover:bg-zinc-100 transition-colors"
          title={t('common.back', '뒤로')}
          aria-label={t('common.back', '뒤로')}
        >
          <ArrowLeft className="w-5 h-5 text-zinc-700" />
        </button>
        <h1 className="font-bold text-zinc-900">{t('community.new_post', '새 게시글')}</h1>
        <button
          onClick={handlePost}
          disabled={!canPost}
          className={cn(
            "flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-bold transition-all",
            canPost
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed",
          )}
          title={t('community.post', '게시')}
          aria-label={t('community.post', '게시')}
        >
          {isPosting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{isPosting ? t('community.posting', '게시 중...') : t('community.post', '게시')}</span>
        </button>
      </div>

      {/* ── 콘텐츠 ── */}
      <div className="flex-1 overflow-y-auto">
        {/* 반려견 정보 태그 */}
        {(petProfile.name || petProfile.breed) && (
          <div className="px-5 pt-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <span className="font-bold text-sm text-zinc-900">{petProfile.name || '우리 강아지'}</span>
              {petProfile.breed && (
                <span className="ml-1.5 text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-md">
                  {petProfile.breed}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 텍스트 입력 */}
        <div className="px-5 pt-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('community.write_placeholder', '반려견 이야기를 공유해주세요...')}
            className="w-full min-h-[150px] text-zinc-800 placeholder:text-zinc-400 bg-transparent resize-none focus:outline-none text-sm leading-relaxed"
            maxLength={500}
          />
          <div className="text-right text-xs text-zinc-400 mt-1">
            {text.length}/500
          </div>
        </div>

        {/* 이미지 미리보기 */}
        {imagePreview && (
          <div className="px-5 pb-4 relative">
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={imagePreview}
                alt="preview"
                className="w-full aspect-square object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                title={t('community.remove_image', '이미지 제거')}
                aria-label={t('community.remove_image', '이미지 제거')}
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* 이미지 추가 버튼 */}
        {!imagePreview && (
          <div className="px-5 pb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center gap-3 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all active:scale-[0.98]"
            >
              <div className="w-14 h-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <Image className="w-7 h-7 text-zinc-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-500">{t('community.photo_select', '사진 추가하기')}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{t('community.photo_hint', '갤러리에서 선택하거나 카메라로 촬영')}</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* 숨겨진 파일 입력 (갤러리 + 카메라 OS 선택 UI 자동 표시) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
};

export default CommunityPostScreen;
