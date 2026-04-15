import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
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
    `rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  const getMobileNavItemClassName = ({ isActive }) =>
    `block rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <nav className="mx-auto w-full max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition hover:border-indigo-200 hover:bg-indigo-50"
            aria-label="Go to MatchMitra dashboard"
          >
            <img
              src="/The_Match_mitra_logo.jpeg"
              alt="MatchMitra logo"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="hidden sm:block">
              <p className="text-base font-extrabold tracking-tight text-indigo-700">MatchMitra</p>
              <p className="-mt-0.5 text-[11px] font-medium text-slate-500">Because Every Match Matters</p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavItemClassName}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}

            <div className="hidden items-center gap-2 pl-2 md:flex">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('language.label')}
              </span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-300"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
            >
              {mobileMenuOpen ? (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 md:inline-flex"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="mt-3 space-y-1 rounded-xl border border-slate-200 bg-white p-2 shadow-sm md:hidden"
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

            <label className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
              <span>{t('language.label')}</span>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none"
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
              className="mt-1 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {t('nav.logout')}
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
