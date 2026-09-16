import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Sparkles, Lock, Mail, ArrowRight, Users, MessageCircle, Star, Globe } from 'lucide-react';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { t, language, setLanguage, supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const checkProfileAndNavigate = async (user) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        navigate('/matches');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      console.error('Error checking profile:', err);
      navigate('/profile');
    }
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await loginWithEmail(email, password);
      await checkProfileAndNavigate(userCredential.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    setError('');
    setLoading(true);

    try {
      const userCredential = await loginWithGoogle();
      await checkProfileAndNavigate(userCredential.user);
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message={t('auth.loggingIn')} />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-pink-50/40 text-slate-900 font-sans selection:bg-rose-500 selection:text-white flex flex-col justify-between">
      {/* Soft Romantic Ambient Background Blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl" />
      <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl" />

      {/* Top Header */}
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 py-5">
        <div className="flex items-center gap-2.5">
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
        </div>

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

      {/* Main Hero & Auth Section */}
      <main className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 lg:gap-12 px-4 sm:px-6 py-6 lg:grid-cols-12 lg:py-10">
        {/* Left Side: Hero Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 space-y-6 sm:space-y-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-100/60 px-4 py-1.5 text-xs font-bold text-rose-700 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-rose-600" />
            <span>AI Matchmaking & Verified Safety</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15]">
            Find your <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">perfect life partner</span> with absolute trust.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            MatchMitra brings together smart AI interest matching, verified profile security, and real-time chat to help you build meaningful relationships effortlessly.
          </p>

          {/* Dynamic Stats Row */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 border-y border-rose-100 py-5">
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xl sm:text-2xl font-black text-slate-900">
                <Users className="h-5 w-5 text-rose-600" />
                <span>10k+</span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">Verified Profiles</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xl sm:text-2xl font-black text-slate-900">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <span>99.4%</span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">Trust Score</p>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xl sm:text-2xl font-black text-slate-900">
                <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                <span>4.9 ★</span>
              </div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1">Satisfaction</p>
            </div>
          </div>

          {/* Key Features Badges */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { icon: ShieldCheck, text: 'Verified Profiles' },
              { icon: MessageCircle, text: 'Instant Voice & Chat' },
              { icon: Sparkles, text: 'AI Match Score' },
              { icon: Star, text: 'Complete Privacy' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl bg-white border border-rose-100/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"
              >
                <feature.icon className="h-4 w-4 text-rose-500" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="lg:col-span-5"
        >
          <div className="relative">
            {/* Ambient Background Box Shadow */}
            <div className="relative rounded-3xl border border-rose-100 bg-white p-6 sm:p-8 shadow-xl shadow-rose-500/5 space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {t('login.title')}
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Welcome back! Enter your details to continue.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={submitLogin} className="space-y-4">
                <div className="space-y-3.5">
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('auth.password')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-rose-500 focus:bg-white focus:ring-2 focus:ring-rose-500/20"
                        required
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
                  <span>{t('auth.login')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-white px-3 text-slate-400 font-bold">Or continue with</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={loginGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>{t('auth.continueGoogle')}</span>
              </button>

              <div className="pt-1 text-center text-xs font-semibold text-slate-500">
                {t('auth.noAccount')}{' '}
                <Link to="/signup" className="font-extrabold text-rose-600 hover:text-rose-700 hover:underline">
                  {t('auth.signUp')}
                </Link>
              </div>
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

export default Login;
