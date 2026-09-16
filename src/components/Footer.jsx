import { Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-rose-100 bg-white/90 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row text-center sm:text-left">
        <div className="flex items-center gap-2">
          <img
            src="/The_Match_mitra_logo.jpeg"
            alt="MatchMitra Logo"
            className="h-6 w-6 rounded-lg object-cover ring-1 ring-rose-500/20"
          />
          <span className="text-xs font-bold text-slate-800">MatchMitra</span>
          <span className="text-xs font-medium text-slate-400">• Because Every Match Matters</span>
        </div>
        <p className="text-xs font-medium text-slate-500">
          {t('footer.rights', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
