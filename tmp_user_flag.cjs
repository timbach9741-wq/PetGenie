const fs = require('fs');

// 1. Update App.tsx
let appStr = fs.readFileSync('src/App.tsx', 'utf8');

// Update user state to include is_premium
appStr = appStr.replace(
  "const [user, setUser] = useState<{ email: string } | null>(null);",
  "const [user, setUser] = useState<{ email: string, is_premium: boolean } | null>(null);"
);

// In handleLogin / handleSignUp, define is_premium
appStr = appStr.replace(
  "setUser({ email });",
  "setUser({ email, is_premium: false });"
);
appStr = appStr.replace(
  "setUser({ email });",
  "setUser({ email, is_premium: false });"
);

// In handleUpgrade, update user is_premium flag
appStr = appStr.replace(
  "const handleUpgrade = () => {\n    setIsPremium(true);\n    navigateTo('pet-dashboard');\n  };",
  "const handleUpgrade = () => {\n    setIsPremium(true);\n    if (user) setUser({ ...user, is_premium: true });\n    navigateTo('pet-dashboard');\n  };"
);
appStr = appStr.replace(
  "const handleUpgrade = () => {\r\n    setIsPremium(true);\r\n    navigateTo('pet-dashboard');\r\n  };",
  "const handleUpgrade = () => {\r\n    setIsPremium(true);\r\n    if (user) setUser({ ...user, is_premium: true });\r\n    navigateTo('pet-dashboard');\r\n  };"
);

// Make AdBanner strictly rely on isPremium or user.is_premium
let bannerStr = fs.readFileSync('src/components/common/AdBanner.tsx', 'utf8');
bannerStr = bannerStr.replace(
  "if (isPremium) return null;",
  "// Global Flag & Ad-Free Logic Checked\n  if (isPremium) return null;"
);
fs.writeFileSync('src/components/common/AdBanner.tsx', bannerStr);


// 2. Update MembershipScreen.tsx
let memStr = fs.readFileSync('src/components/screens/MembershipScreen.tsx', 'utf8');

// $9.99 -> ₩13,000 / $9.99
memStr = memStr.replace(
  "<span className=\"text-4xl font-black tracking-tighter text-white\">$9.99</span>",
  "<span className=\"text-4xl font-black tracking-tighter text-white\">₩13,000 <span className=\"text-xl\">($9.99)</span></span>"
);

// $1.99 -> ₩2,500 / $1.99
memStr = memStr.replace(
  "<span className=\"text-3xl font-black tracking-tighter\">$1.99</span>",
  "<span className=\"text-3xl font-black tracking-tighter\">₩2,500 <span className=\"text-xl\">($1.99)</span></span>"
);

// Button for Pro
memStr = memStr.replace(
  "<button \n              onClick={onUpgrade}\n              className=\"w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-emerald-900/40 transition-all active:scale-[0.98]\"\n            >\n              Pro 시작하기\n            </button>",
  "<button \n              disabled\n              className=\"w-full bg-zinc-800 text-zinc-500 py-4 rounded-xl font-bold text-sm shadow-xl transition-all cursor-not-allowed\"\n            >\n              6월 출시 예정 (Coming Soon)\n            </button>"
);
memStr = memStr.replace(
  "<button \r\n              onClick={onUpgrade}\r\n              className=\"w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-bold text-sm shadow-xl shadow-emerald-900/40 transition-all active:scale-[0.98]\"\r\n            >\r\n              Pro 시작하기\r\n            </button>",
  "<button \r\n              disabled\r\n              className=\"w-full bg-zinc-800 text-zinc-500 py-4 rounded-xl font-bold text-sm shadow-xl transition-all cursor-not-allowed\"\r\n            >\r\n              6월 출시 예정 (Coming Soon)\r\n            </button>"
);

// Button for Single Deep Scan
memStr = memStr.replace(
  "<button \n              onClick={onUpgrade}\n              className=\"w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]\"\n            >\n              1회권 구매하기\n            </button>",
  "<button \n              disabled\n              className=\"w-full bg-zinc-100 text-zinc-400 py-3.5 rounded-xl font-bold text-sm transition-all cursor-not-allowed\"\n            >\n              6월 출시 예정 (Coming Soon)\n            </button>"
);
memStr = memStr.replace(
  "<button \r\n              onClick={onUpgrade}\r\n              className=\"w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all active:scale-[0.98]\"\r\n            >\r\n              1회권 구매하기\r\n            </button>",
  "<button \r\n              disabled\r\n              className=\"w-full bg-zinc-100 text-zinc-400 py-3.5 rounded-xl font-bold text-sm transition-all cursor-not-allowed\"\r\n            >\r\n              6월 출시 예정 (Coming Soon)\r\n            </button>"
);

fs.writeFileSync('src/App.tsx', appStr);
fs.writeFileSync('src/components/screens/MembershipScreen.tsx', memStr);

console.log('App user flag and membership pricing updated.');
