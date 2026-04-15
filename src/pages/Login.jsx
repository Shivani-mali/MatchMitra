import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const Login = () => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const nextPath = location.state?.from?.pathname || '/profile';

  const checkProfileAndNavigate = async (user) => {
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        navigate('/matches');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
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
      setError(err.message);
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
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Logging in..." />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800">Login to MatchMitra</h1>
        <p className="mt-1 text-sm text-slate-500">Because every match matters 💫</p>

        <form onSubmit={submitLogin} className="mt-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            required
          />
          <input
            type="password"
            placeholder="Password"
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
            Login
          </button>
        </form>

        <button
          type="button"
          onClick={loginGoogle}
          disabled={loading}
          className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Continue with Google
        </button>

        <p className="mt-4 text-center text-sm text-slate-600">
          No account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Login;
