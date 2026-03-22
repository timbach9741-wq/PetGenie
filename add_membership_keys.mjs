import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'src/locales');
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const newKeys = {
  ko: {
    plan_weekly_title: "1주 체험",
    plan_weekly_price: "₩5,000",
    plan_yearly_title: "1년",
    plan_yearly_price: "₩25,000",
    plan_lifetime_title: "평생",
    plan_lifetime_price: "₩50,000",
    best_value: "BEST"
  },
  en: {
    plan_weekly_title: "1-Week Trial",
    plan_weekly_price: "$4.99",
    plan_yearly_title: "1 Year",
    plan_yearly_price: "$19.99",
    plan_lifetime_title: "Lifetime",
    plan_lifetime_price: "$39.99",
    best_value: "BEST"
  },
  ja: {
    plan_weekly_title: "1週間体験",
    plan_weekly_price: "¥500",
    plan_yearly_title: "1年",
    plan_yearly_price: "¥2,500",
    plan_lifetime_title: "一生",
    plan_lifetime_price: "¥5,000",
    best_value: "BEST"
  },
  zh: {
    plan_weekly_title: "1周体验",
    plan_weekly_price: "¥25",
    plan_yearly_title: "1年",
    plan_yearly_price: "¥125",
    plan_lifetime_title: "终身",
    plan_lifetime_price: "¥250",
    best_value: "BEST"
  },
  es: {
    plan_weekly_title: "Prueba 1 semana",
    plan_weekly_price: "€4.99",
    plan_yearly_title: "1 Año",
    plan_yearly_price: "€19.99",
    plan_lifetime_title: "De por vida",
    plan_lifetime_price: "€39.99",
    best_value: "BEST"
  }
};

for (const file of files) {
  const lang = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.membership) data.membership = {};
    
    const keysToAdd = newKeys[lang] || newKeys['en'];
    
    data.membership.plan_weekly_title = keysToAdd.plan_weekly_title;
    data.membership.plan_weekly_price = keysToAdd.plan_weekly_price;
    data.membership.plan_yearly_title = keysToAdd.plan_yearly_title;
    data.membership.plan_yearly_price = keysToAdd.plan_yearly_price;
    data.membership.plan_lifetime_title = keysToAdd.plan_lifetime_title;
    data.membership.plan_lifetime_price = keysToAdd.plan_lifetime_price;
    data.membership.best_value = keysToAdd.best_value;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err);
  }
}
