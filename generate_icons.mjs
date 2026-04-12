/**
 * Pet Genie 앱 아이콘 생성 스크립트
 * - 소스 이미지를 Android mipmap 규격에 맞게 리사이즈
 * - ic_launcher.png (정사각형), ic_launcher_round.png (원형), ic_launcher_foreground.png 생성
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Android mipmap 크기 규격
const MIPMAP_SIZES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// Foreground 레이어 크기 (adaptive icon)
const FOREGROUND_SIZES = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

const ICON_SOURCE = 'C:\\Users\\Tim\\.gemini\\antigravity\\brain\\aec4c8d8-9442-43eb-9b2d-4b5d53238a72\\app_icon_full_1775963069801.png';
const FG_SOURCE = 'C:\\Users\\Tim\\.gemini\\antigravity\\brain\\aec4c8d8-9442-43eb-9b2d-4b5d53238a72\\app_icon_foreground_1775963056842.png';
const RES_DIR = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

async function generateIcons() {
  console.log('🐾 Pet Genie 앱 아이콘 생성 시작...\n');

  // 1. ic_launcher.png (정사각형 아이콘)
  for (const [folder, size] of Object.entries(MIPMAP_SIZES)) {
    const outputPath = path.join(RES_DIR, folder, 'ic_launcher.png');
    await sharp(ICON_SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(outputPath);
    console.log(`✅ ${folder}/ic_launcher.png (${size}x${size})`);
  }

  // 2. ic_launcher_round.png (원형 아이콘 - 원형 마스크 적용)
  for (const [folder, size] of Object.entries(MIPMAP_SIZES)) {
    const outputPath = path.join(RES_DIR, folder, 'ic_launcher_round.png');
    
    // 원형 마스크 SVG 생성
    const circleMask = Buffer.from(
      `<svg width="${size}" height="${size}">
        <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="white"/>
      </svg>`
    );

    const resized = await sharp(ICON_SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toBuffer();

    await sharp(resized)
      .composite([{ input: circleMask, blend: 'dest-in' }])
      .png()
      .toFile(outputPath);

    console.log(`✅ ${folder}/ic_launcher_round.png (${size}x${size} 원형)`);
  }

  // 3. ic_launcher_foreground.png (adaptive icon foreground 레이어)
  for (const [folder, size] of Object.entries(FOREGROUND_SIZES)) {
    const outputPath = path.join(RES_DIR, folder, 'ic_launcher_foreground.png');
    await sharp(FG_SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outputPath);
    console.log(`✅ ${folder}/ic_launcher_foreground.png (${size}x${size})`);
  }

  console.log('\n🎉 모든 아이콘 생성 완료!');
  console.log('💡 빌드 후 앱을 다시 설치하면 새 아이콘이 적용됩니다.');
}

generateIcons().catch(console.error);
