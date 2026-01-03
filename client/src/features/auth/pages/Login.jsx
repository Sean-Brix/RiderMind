import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <section className="min-h-screen flex items-stretch">
      {/* Left Panel - Hero Image (Hidden on mobile) */}
      <div 
        className="lg:flex w-1/2 hidden bg-neutral-800 bg-no-repeat bg-cover relative items-center overflow-hidden"
      >
        <div 
          className="absolute inset-0 bg-no-repeat bg-cover blur-sm scale-110"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80')`,
          }}
        ></div>
        
        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full px-16 z-10"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="RiderMind Logo" className="w-12 h-12 rounded-xl" />
            <span className="text-2xl font-bold text-neutral-900">RiderMind</span>
          </div>

          <h1 className="text-5xl font-bold text-left tracking-tight text-neutral-900 leading-tight">
            Drive with<br />
            <span className="text-brand-600">confidence</span>
          </h1>
          <p className="text-base my-6 text-neutral-700 leading-relaxed max-w-md text-left">
            Master road safety through interactive lessons, quizzes, and earn your certification.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            <div>
              <div className="text-3xl font-bold text-neutral-900">20+</div>
              <div className="text-sm text-neutral-600">Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900">100%</div>
              <div className="text-sm text-neutral-600">Free Access</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-neutral-900">24/7</div>
              <div className="text-sm text-neutral-600">Available</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Social Links */}
        <div className="bottom-0 absolute p-6 text-center right-0 left-0 flex justify-center space-x-4">
          <span className="w-10 h-10 items-center justify-center inline-flex rounded-full bg-neutral-800/10 backdrop-blur-sm border border-neutral-800/20 hover:bg-neutral-800/20 transition-colors cursor-pointer">
            <svg fill="#1f2937" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
            </svg>
          </span>
          <span className="w-10 h-10 items-center justify-center inline-flex rounded-full bg-neutral-800/10 backdrop-blur-sm border border-neutral-800/20 hover:bg-neutral-800/20 transition-colors cursor-pointer">
            <svg fill="#1f2937" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </span>
          <span className="w-10 h-10 items-center justify-center inline-flex rounded-full bg-neutral-800/10 backdrop-blur-sm border border-neutral-800/20 hover:bg-neutral-800/20 transition-colors cursor-pointer">
            <svg fill="#1f2937" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-1/2 w-full flex items-center justify-center md:px-16 px-6 z-0 bg-white relative">
        {/* Mobile Background Image */}
        <div 
          className="absolute lg:hidden z-0 inset-0 bg-neutral-800 bg-no-repeat bg-cover"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80')`,
          }}
        >
          <div className="absolute bg-gradient-to-br from-neutral-50/98 via-white/95 to-neutral-100/98 inset-0 z-0" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full py-8 z-20 max-w-md mx-auto"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/logo.png" alt="RiderMind Logo" className="w-12 h-12 rounded-xl shadow-lg" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-1 text-center">RiderMind</h1>
          <p className="text-neutral-600 text-sm mb-8 text-center">Driver Education Platform</p>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-neutral-500 text-sm">Sign in with email</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full px-4 lg:px-0">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-left"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Email Input */}
            <div className="pb-2 pt-4">
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full p-4 text-base rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="pb-2 pt-4 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full p-4 pr-12 text-base rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot Password */}
            <div className="text-right text-neutral-600 hover:text-brand-600 transition-colors pt-2">
              <button type="button" onClick={() => navigate('/forgot-password')} className="text-sm">
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={busy}
                className="uppercase block w-full p-4 text-base font-bold rounded-full bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </div>

            {/* Register Link */}
            <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
              <p className="text-neutral-600 text-sm">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-brand-600 hover:text-brand-700 font-semibold transition-colors"
                >
                  Register here
                </button>
              </p>
            </div>

            {/* Mobile Social Links */}
            <div className="flex justify-center space-x-4 mt-10 lg:hidden">
              <span className="w-10 h-10 items-center justify-center inline-flex rounded-full bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 transition-colors cursor-pointer">
                <svg fill="#1f2937" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </span>
              <span className="w-10 h-10 items-center justify-center inline-flex rounded-full bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 transition-colors cursor-pointer">
                <svg fill="#1f2937" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </span>
              <span className="w-10 h-10 items-center justify-center inline-flex rounded-full bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 transition-colors cursor-pointer">
                <svg fill="#1f2937" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
