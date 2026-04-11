const fs = require('fs');
const file = 'src/components/screens/ProfileScreen.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/import type \{ PetProfile \} from \'\.\.\/\.\.\/types\';/, `import type { PetProfile } from '../../types';\nimport packageJson from '../../../package.json';`);
content = content.replace(/\{t\(\'profile\.version\'\)\} 1\.0\.8/g, `{t('profile.version')} {packageJson.version}`);
fs.writeFileSync(file, content, 'utf8');
