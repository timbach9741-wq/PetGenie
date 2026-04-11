import fs from 'fs';
import path from 'path';
import https from 'https';

const SOUNDS_DIR = path.join(process.cwd(), 'public', 'assets', 'sounds');

const URLS = [
  { name: 'dog_bark_1.ogg', url: 'https://actions.google.com/sounds/v1/animals/dog_barking.ogg' },
  { name: 'dog_bark_2.ogg', url: 'https://actions.google.com/sounds/v1/animals/small_dog_barking.ogg' },
  { name: 'dog_bark_3.ogg', url: 'https://actions.google.com/sounds/v1/animals/large_dog_bark.ogg' }
];

if (!fs.existsSync(SOUNDS_DIR)) {
  fs.mkdirSync(SOUNDS_DIR, { recursive: true });
  console.log(`Created directory: ${SOUNDS_DIR}`);
}

const downloadFile = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
};

async function main() {
  console.log('Downloading sound assets...');
  for (const item of URLS) {
    const dest = path.join(SOUNDS_DIR, item.name);
    try {
      if (!fs.existsSync(dest)) {
        await downloadFile(item.url, dest);
        console.log(`✅ Downloaded: ${item.name}`);
      } else {
        console.log(`⚡ Already exists: ${item.name}`);
      }
    } catch (err) {
      console.error(`❌ Error downloading ${item.name}:`, err.message);
    }
  }
  console.log('All downloads completed!');
}

main();
