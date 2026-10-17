import { useState, useRef, useEffect } from 'react';
import { MdTranslate } from 'react-icons/md';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = [
  { code: 'en',  label: 'English',   native: 'English'      },
  { code: 'hi',  label: 'Hindi',     native: 'हिन्दी'        },
  { code: 'bn',  label: 'Bengali',   native: 'বাংলা'         },
  { code: 'te',  label: 'Telugu',    native: 'తెలుగు'        },
  { code: 'mr',  label: 'Marathi',   native: 'मराठी'         },
  { code: 'ta',  label: 'Tamil',     native: 'தமிழ்'         },
  { code: 'ur',  label: 'Urdu',      native: 'اردو'          },
  { code: 'gu',  label: 'Gujarati',  native: 'ગુજરાતી'       },
  { code: 'kn',  label: 'Kannada',   native: 'ಕನ್ನಡ'         },
  { code: 'ml',  label: 'Malayalam', native: 'മലയാളം'        },
  { code: 'or',  label: 'Odia',      native: 'ଓଡ଼ିଆ'         },
  { code: 'pa',  label: 'Punjabi',   native: 'ਪੰਜਾਬੀ'        },
  { code: 'as',  label: 'Assamese',  native: 'অসমীয়া'       },
  { code: 'mai', label: 'Maithili',  native: 'मैथिली'        },
  { code: 'sa',  label: 'Sanskrit',  native: 'संस्कृतम्'      },
  { code: 'kok', label: 'Konkani',   native: 'कोंकणी'        },
  { code: 'ne',  label: 'Nepali',    native: 'नेपाली'        },
  { code: 'sd',  label: 'Sindhi',    native: 'سنڌي'          },
];

function setGoogleTranslateCookie(langCode) {
  const cookieValue = langCode === 'en' ? '' : `/en/${langCode}`;
  const expire = langCode === 'en'
    ? 'expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    : 'expires=Fri, 31 Dec 9999 23:59:59 GMT;';

  document.cookie = `googtrans=${cookieValue}; ${expire} path=/`;
  document.cookie = `googtrans=${cookieValue}; ${expire} path=${window.location.pathname}`;

  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length > 2) {
    const rootDomain = parts.slice(-2).join('.');
    document.cookie = `googtrans=${cookieValue}; ${expire} path=/; domain=.${rootDomain}`;
  }
}

function getCurrentLangFromCookie() {
  const match = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
  return match ? match[1] : 'en';
}

function changeLanguage(langCode, onDone) {
  setGoogleTranslateCookie(langCode);

  if (langCode === 'en') {
    window.location.reload();
    return;
  }

  // Poll until the combo element is fully populated (options.length > 1),
  // then dispatch with bubbles:true so GT's listener catches it.
  // Falls back to reload after ~5s if GT never becomes ready.
  let attempts = 0;
  const interval = setInterval(() => {
    const combo = document.querySelector('.goog-te-combo');
    if (combo && combo.options && combo.options.length > 1) {
      combo.value = langCode;
      combo.dispatchEvent(new Event('change', { bubbles: true }));
      clearInterval(interval);
      onDone?.();
    } else if (++attempts >= 50) {
      clearInterval(interval);
      window.location.reload();
    }
  }, 100);
}

const GoogleTranslate = () => {
  const savedCode = getCurrentLangFromCookie();
  const savedLang = LANGUAGES.find((l) => l.code === savedCode) || LANGUAGES[0];

  const [open, setOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(savedLang);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectLanguage = (lang) => {
    setCurrentLang(lang);
    setOpen(false);
    if (lang.code !== 'en') setLoading(true);
    changeLanguage(lang.code, () => setLoading(false));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !loading && setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors duration-200 cursor-pointer"
      >
        {loading ? (
          <span className="w-[18px] h-[18px] shrink-0 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
        ) : (
          <MdTranslate className="w-[18px] h-[18px] shrink-0" />
        )}
        <span className="notranslate hidden sm:inline" translate="no">{currentLang.native}</span>
        {!loading && (
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && !loading && (
        <div className="absolute right-0 top-full mt-2 z-50 w-52 bg-[#1e2b1b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="gt-lang-list max-h-64 overflow-y-auto">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150 cursor-pointer
                  ${currentLang.code === lang.code
                    ? 'bg-white/10 text-accent-gold'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <span className="font-medium notranslate" translate="no">{lang.label}</span>
                <span className="text-xs opacity-60 notranslate" translate="no">{lang.native}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleTranslate;
