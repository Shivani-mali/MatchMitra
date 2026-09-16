import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Lock, Mail, ArrowRight, Sparkles, Globe } from 'lucide-react';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Signup = () => {
  const { signupWithEmail } = useAuth();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submitSignup = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signupWithEmail(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message={t('auth.creatingAccount')} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-pink-50/40 text-slate-900 font-sans selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      {/* Background Animated Blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-5">
        <Link to="/login" className="flex items-center gap-2.5">
          <img
            src="/The_Match_mitra_logo.jpeg"
            alt="MatchMitra Logo"
            className="h-10 w-10 rounded-2xl object-cover ring-2 ring-rose-500/20 shadow-md"
          />
          <div className="leading-tight">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              MatchMitra
            </span>
            <span className="hidden text-xs font-semibold text-rose-500 sm:block">Because Every Match Matters ✨</span>
          </div>
        </Link>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 rounded-2xl bg-white/90 border border-slate-200 px-3 py-1.5 shadow-sm backdrop-blur-md">
          <Globe className="h-4 w-4 text-rose-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer pr-1"
          >
            {supportedLanguages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-white text-slate-800">
                {lang.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-md px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="relative rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-xl shadow-rose-500/5 space-y-6">
            <div className="text-center space-y-1.5">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 mb-2">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {t('auth.createAccount')}
              </h1>
              <p className="text-xs font-semibold text-slate-500 max-w-xs mx-auto">
                {t('auth.startJourney')}
              </p>
            </div>

            <form onSubmit={submitSignup} className="space-y-4">
              <div className="space-y-3.5">
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('auth.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-bold text-rose-600"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-3.5 text-sm font-bold text-white shadow-md shadow-rose-600/20 transition hover:from-rose-500 hover:to-pink-500 active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                <span>{loading ? t('auth.creatingAccount') : t('auth.signUp')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs font-semibold text-slate-500">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link to="/login" className="font-extrabold text-rose-600 hover:text-rose-700 hover:underline">
                {t('auth.login')}
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-rose-100/60 py-5 text-center text-xs font-semibold text-slate-500">
        MatchMitra © {new Date().getFullYear()} — Dreamers Hackathon Project. All rights reserved.
      </footer>
    </div>
  );
};

export default Signup;
