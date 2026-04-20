const fs = require('fs');
let c = fs.readFileSync('src/components/screens/ProfileScreen.tsx', 'utf8');
c = c.replace(/<button onClick=\{onLogin\}[\s\S]*?<\/header>/,
  '<button onClick={onLogin} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-900/20 active:scale-[0.98] transition-transform">\n' +
  '          {t(\'auth.login_button\')}\n' +
  '        </button>\n' +
  '      </div>\n' +
  '    );\n' +
  '  }\n\n' +
  '  return (\n' +
  '    <div className="h-full bg-zinc-50 overflow-y-auto no-scrollbar pb-[calc(80px+env(safe-area-inset-bottom,0px))]">\n' +
  '      <header className="bg-white px-6 pb-6 border-b border-zinc-100 pt-[calc(env(safe-area-inset-top,0px)+44px)]">\n' +
  '        <div className="flex justify-between items-center">\n' +
  '          <div className="flex items-center gap-2">\n' +
  '            <button\n' +
  '              onClick={onBack}\n' +
  '              aria-label="뒤로가기"\n' +
  '              className="p-2 -ml-2 mr-1 text-zinc-900 hover:bg-zinc-100 rounded-full transition-transform active:scale-90"\n' +
  '            >\n' +
  '              <ArrowLeft className="w-5 h-5" />\n' +
  '            </button>\n' +
  '            <h1 className="text-lg font-bold text-zinc-900">{t(\'profile.title\')}</h1>\n' +
  '          </div>\n' +
  '          {!isEditing ? (\n' +
  '            <button onClick={() => { setEditProfile(petProfile); setIsEditing(true); }} className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">\n' +
  '              {t(\'profile.edit_profile\')}\n' +
  '            </button>\n' +
  '          ) : (\n' +
  '            <div className="flex gap-2">\n' +
  '              <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-xl">{t(\'common.cancel\')}</button>\n' +
  '              <button onClick={handleSave} className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-xl">{t(\'common.save\')}</button>\n' +
  '            </div>\n' +
  '          )}\n' +
  '        </div>\n' +
  '      </header>'
);
fs.writeFileSync('src/components/screens/ProfileScreen.tsx', c);
