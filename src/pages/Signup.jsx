import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Signup = () => {
  const { signupWithEmail } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitSignup = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signupWithEmail(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message={t('auth.creatingAccount')} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800">{t('auth.createAccount')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('auth.startJourney')}</p>

        <form onSubmit={submitSignup} className="mt-6 space-y-3">
          <input
            type="email"
            placeholder={t('auth.email')}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder={t('auth.password')}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            required
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-70"
          >
            {loading ? t('auth.creatingAccount') : t('auth.signUp')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:underline">
            {t('auth.login')}
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Signup;
