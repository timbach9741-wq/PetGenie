import fs from 'fs';
import path from 'path';
import https from 'https';

const SOUNDS_DIR = path.join(process.cwd(), 'public', 'assets', 'sounds');

const PRESETS = [
  { name: 'dog_play.wav', url: 'https://raw.githubusercontent.com/karolpiczak/ESC-50/master/audio/1-100032-A-14.wav' },
  { name: 'dog_walk.wav', url: 'https://raw.githubusercontent.com/karolpiczak/ESC-50/master/audio/1-100210-B-14.wav' },
  { name: 'dog_love.wav', url: 'https://raw.githubusercontent.com/karolpiczak/ESC-50/master/audio/1-110389-A-14.wav' },
  { name: 'dog_eat.wav',  url: 'https://raw.githubusercontent.com/karolpiczak/ESC-50/master/audio/1-30226-A-14.wav' },
  { name: 'dog_praise.wav', url: 'https://raw.githubusercontent.com/karolpiczak/ESC-50/master/audio/1-30344-A-14.wav' },
  { name: 'dog_stop.wav', url: 'https://raw.githubusercontent.com/karolpiczak/ESC-50/master/audio/1-59513-A-14.wav' }
];

if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // Handle redirects
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        return resolve(downloadFile(response.headers.location, dest));
      }
      if (response.statusCode >= 400) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function main() {
  console.log('Downloading real authentic dog bark WAVs...');
  for (const item of PRESETS) {
    const dest = path.join(SOUNDS_DIR, item.name);
    try {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      await downloadFile(item.url, dest);
      const stats = fs.statSync(dest);
      console.log(`✅ Downloaded: ${item.name} (${stats.size} bytes)`);
    } catch (err) {
      console.error(`❌ Error downloading ${item.name}:`, err.message);
    }
  }
}

main();
