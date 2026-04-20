const fs = require('fs');
let c = fs.readFileSync('src/components/screens/HistoryScreen.tsx', 'utf8');
c = c.replace(
  /const \{ t \} = useTranslation\(\);[\s\S]+?<div className="grid grid-cols-3 gap-3 mb-2">/,
  "const { t } = useTranslation();\n\n" +
  "  const avgScore = history.length > 0 ? Math.round(history.reduce((acc, item) => acc + (item.result?.breedMatch || 70), 0) / history.length) : 0;\n" +
  "  const lastScanDate = history.length > 0 ? history[0].date : '-';\n\n" +
  "  return (\n" +
  "    <div className=\"h-full bg-zinc-50 flex flex-col\" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}>\n" +
  "      <header className=\"px-6 pb-6 flex items-center gap-2 bg-white sticky top-0 z-50 border-b border-zinc-100 pt-[calc(env(safe-area-inset-top,0px)+44px)]\">\n" +
  "        <button\n" +
  "          onClick={onBack}\n" +
  "          aria-label=\"뒤로가기\"\n" +
  "          className=\"p-2 -ml-2 mr-1 text-zinc-900 hover:bg-zinc-100 rounded-full transition-transform active:scale-90\"\n" +
  "        >\n" +
  "          <ArrowLeft className=\"w-5 h-5\" />\n" +
  "        </button>\n" +
  "        <h1 className=\"text-lg font-bold text-zinc-900\">{t('history.title')}</h1>\n" +
  "      </header>\n      \n" +
  "      <div className=\"flex-1 overflow-y-auto p-6 space-y-4\">\n" +
  "        {/* Stats Cards */}\n" +
  "        {history.length > 0 && (\n" +
  "          <div className=\"grid grid-cols-3 gap-3 mb-2\">"
);
fs.writeFileSync('src/components/screens/HistoryScreen.tsx', c);
