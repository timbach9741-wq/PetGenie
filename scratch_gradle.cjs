const fs = require('fs');
const file = 'android/app/build.gradle';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/versionCode 18/g, 'versionCode 19');
content = content.replace(/versionName "1\.1\.0"/g, 'versionName "1.1.1"');
fs.writeFileSync(file, content, 'utf8');
