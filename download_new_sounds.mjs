import fs from 'fs';
import path from 'path';
import https from 'https';

const SOUNDS_DIR = path.join(process.cwd(), 'public', 'assets', 'sounds');

const URLS = [
  // These are standard Wikimedia Commons open audio files.
  { name: 'dog_play.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Dog_barking.ogg' },
  { name: 'dog_walk.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Sniffing_Dog.ogg' },
  { name: 'dog_love.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Dog_whining.ogg' },
  { name: 'dog_stop.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Dog_growling_01.ogg' },
  { name: 'dog_eat.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Dog_Eating_Loudly.ogg' },
  { name: 'dog_praise.ogg', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Dog_Pant.ogg' }
];

if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
}

// Clear old files
const oldFiles = ['dog_bark_1.ogg', 'dog_bark_2.ogg', 'dog_bark_3.ogg'];
oldFiles.forEach(file => {
  const p = path.join(SOUNDS_DIR, file);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
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
  console.log('Downloading distinct sound assets...');
  for (const item of URLS) {
    const dest = path.join(SOUNDS_DIR, item.name);
    try {
      if (fs.existsSync(dest)) fs.unlinkSync(dest); // Force Redownload
      await downloadFile(item.url, dest);
      
      const stats = fs.statSync(dest);
      console.log(`✅ Downloaded: ${item.name} (${stats.size} bytes)`);
    } catch (err) {
      console.error(`❌ Error downloading ${item.name}:`, err.message);
    }
  }
}

main();
