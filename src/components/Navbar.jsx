import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Globe, LogOut, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const navItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard' },
  { to: '/matches', labelKey: 'nav.matches' },
  { to: '/profile', labelKey: 'nav.profile' },
  { to: '/chat', labelKey: 'nav.chat' },
  { to: '/testimonials', labelKey: 'nav.testimonials' },
];

const Navbar = () => {
  const { logout } = useAuth();
  const { language, setLanguage, t, supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const getNavItemClassName = ({ isActive }) =>
    `relative rounded-xl px-3.5 py-2 text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
      isActive
        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/25'
        : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
    }`;

  const getMobileNavItemClassName = ({ isActive }) =>
    `block rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
      isActive
        ? 'bg-rose-500 text-white shadow-sm'
        : 'text-slate-700 hover:bg-rose-50 hover:text-rose-600'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-rose-100/80 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto w-full max-w-6xl px-3.5 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50/70 to-pink-50/70 p-1.5 pr-3 transition hover:border-rose-300 shadow-sm shrink-0"
            aria-label="Go to MatchMitra dashboard"
          >
            <img
              src="/The_Match_mitra_logo.jpeg"
              alt="MatchMitra Logo"
              className="h-9 w-9 rounded-xl object-cover ring-2 ring-rose-500/20 shadow-sm group-hover:scale-105 transition duration-300"
            />
            <div className="leading-tight">
              <p className="text-sm sm:text-base font-extrabold tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                MatchMitra
              </p>
              <p className="hidden sm:block text-[10px] font-semibold text-slate-500">
                Because Every Match Matters ✨
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavItemClassName}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}

            <div className="hidden items-center gap-2 border-l border-slate-200 pl-3 ml-1 md:flex">
              <Globe className="h-4 w-4 text-rose-500" />
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-rose-400 cursor-pointer"
                aria-label={t('language.label')}
              >
                {supportedLanguages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {t(`language.${item.code === 'en' ? 'english' : item.code === 'hi' ? 'hindi' : 'marathi'}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-white text-slate-700 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 active:scale-95 md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-rose-600" /> : <Menu className="h-5 w-5 text-slate-700" />}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-95 cursor-pointer md:inline-flex"
            >
              <span>{t('nav.logout')}</span>
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="mt-2.5 space-y-1.5 rounded-3xl border border-rose-100 bg-white/95 p-3.5 shadow-2xl backdrop-blur-lg md:hidden"
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getMobileNavItemClassName}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}

            <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-rose-500" />
                {t('language.label')}
              </span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 outline-none shadow-sm cursor-pointer"
                aria-label={t('language.label')}
              >
                {supportedLanguages.map((item) => (
                  <option key={item.code} value={item.code}>
                    {t(`language.${item.code === 'en' ? 'english' : item.code === 'hi' ? 'hindi' : 'marathi'}`)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-md transition hover:bg-rose-600 active:scale-98 cursor-pointer"
            >
              <span>{t('nav.logout')}</span>
              <LogOut className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
