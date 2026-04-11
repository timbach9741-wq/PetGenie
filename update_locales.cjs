const fs = require('fs');

const languages = {
  ko: {
    'common.refresh': '새로고침',
    'community.login_required': '로그인이 필요합니다',
    'community.login_required_desc': '커뮤니티를 이용하려면 로그인해주세요',
  },
  en: {
    'common.refresh': 'Refresh',
    'community.login_required': 'Login Required',
    'community.login_required_desc': 'Please log in to use the community',
  },
  ja: {
    'common.refresh': '更新',
    'community.login_required': 'ログインが必要です',
    'community.login_required_desc': 'コミュニティを利用するにはログインしてください',
  },
  zh: {
    'common.refresh': '刷新',
    'community.login_required': '需要登录',
    'community.login_required_desc': '请登录后使用社区',
  },
  es: {
    'common.refresh': 'Actualizar',
    'community.login_required': 'Inicio de sesión requerido',
    'community.login_required_desc': 'Inicie sesión para usar la comunidad',
  }
};

for (const lang of Object.keys(languages)) {
  const filePath = `./src/locales/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (!data.common) data.common = {};
  data.common.refresh = languages[lang]['common.refresh'];

  if (!data.community) data.community = {};
  data.community.login_required = languages[lang]['community.login_required'];
  data.community.login_required_desc = languages[lang]['community.login_required_desc'];

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

console.log('Localization keys updated successfully.');
