const fs = require('fs');
const filepath = 'src/components/screens/AuthScreens.tsx';
let code = fs.readFileSync(filepath, 'utf8');

// 1. Add state for marketing
code = code.replace(
  "const [password, setPassword] = useState('');",
  "const [password, setPassword] = useState('');\n  const [agreeMarketing, setAgreeMarketing] = useState(false);"
);

// 2. Add in LoginScreen
const loginButtonHTML = `          </div>
          <div className="flex items-start gap-3 pt-2">
            <input 
              type="checkbox" 
              id="marketing-consent-login"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
            />
            <label htmlFor="marketing-consent-login" className="text-xs text-zinc-400 leading-tight">
              I agree to receive launch benefits via email
            </label>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]">
            {t('auth.login_button')}
          </button>
          <div className="text-center pt-2">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              By continuing, you agree to Pet Genie's <br/>
              <a href="https://notion.so/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 transition-colors">Terms</a> and <a href="https://notion.so/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 transition-colors">Privacy Policy</a>
            </p>
          </div>
        </form>`;

code = code.replace(
  "          </div>\n          <button type=\"submit\" className=\"w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]\">\n            {t('auth.login_button')}\n          </button>\n        </form>",
  loginButtonHTML
);
code = code.replace(
  "          </div>\r\n          <button type=\"submit\" className=\"w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]\">\r\n            {t('auth.login_button')}\r\n          </button>\r\n        </form>",
  loginButtonHTML
);


// 3. Add to SignUpScreen as well
const signupButtonHTML = `          </div>
          <div className="flex items-start gap-3 pt-2">
            <input 
              type="checkbox" 
              id="marketing-consent-signup"
              checked={agreeMarketing}
              onChange={(e) => setAgreeMarketing(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
            />
            <label htmlFor="marketing-consent-signup" className="text-xs text-zinc-400 leading-tight">
              I agree to receive launch benefits via email
            </label>
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]">
            {t('auth.signup_button')}
          </button>
          <div className="text-center pt-2">
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              By continuing, you agree to Pet Genie's <br/>
              <a href="https://notion.so/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 transition-colors">Terms</a> and <a href="https://notion.so/" target="_blank" rel="noopener noreferrer" className="underline hover:text-emerald-400 transition-colors">Privacy Policy</a>
            </p>
          </div>
        </form>`;

code = code.replace(
  "          </div>\n          <button type=\"submit\" className=\"w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]\">\n            {t('auth.signup_button')}\n          </button>\n        </form>",
  signupButtonHTML
);
code = code.replace(
  "          </div>\r\n          <button type=\"submit\" className=\"w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]\">\r\n            {t('auth.signup_button')}\r\n          </button>\r\n        </form>",
  signupButtonHTML
);

fs.writeFileSync(filepath, code, 'utf8');
console.log('Terms and Consent Checkbox Added');
