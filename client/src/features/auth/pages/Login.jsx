import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      const { token, user } = data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user.role === 'ADMIN') navigate('/admin'); else navigate('/');
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md card">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-brand-700">RiderMind</h1>
          <p className="text-sm text-neutral-500">Sign in to continue</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </div>
          <button className="btn btn-primary w-full" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        
        {/* Registration Link */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
