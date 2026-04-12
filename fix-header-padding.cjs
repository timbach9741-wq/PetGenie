const fs = require('fs');
const path = require('path');

const screensDir = path.join('c:', 'Users', 'Tim', 'Desktop', 'Pet Genie', 'pet scen 1', 'src', 'components', 'screens');
const files = fs.readdirSync(screensDir).filter(f => f.endsWith('.tsx'));

const SEARCH_PATTERN_1 = 'className="px-6 pt-12 pb-6 flex items-center';
const SEARCH_PATTERN_2 = 'className="bg-white px-6 pt-12 pb-6 border-b';
const SEARCH_PATTERN_3 = 'className="px-6 py-4 flex items-center bg-white border-b border-zinc-100 sticky top-0 z-10 shrink-0"';

files.forEach(file => {
  const filePath = path.join(screensDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes(SEARCH_PATTERN_1)) {
    content = content.replace(
      SEARCH_PATTERN_1,
      'className="px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 flex items-center'
    );
    changed = true;
  }

  if (content.includes(SEARCH_PATTERN_2)) {
    content = content.replace(
      SEARCH_PATTERN_2,
      'className="bg-white px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-6 border-b'
    );
    changed = true;
  }

  if (content.includes(SEARCH_PATTERN_3)) {
    content = content.replace(
      SEARCH_PATTERN_3,
      'className="px-6 pt-[calc(env(safe-area-inset-top,0px)+28px)] pb-4 flex items-center bg-white border-b border-zinc-100 sticky top-0 z-10 shrink-0"'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
