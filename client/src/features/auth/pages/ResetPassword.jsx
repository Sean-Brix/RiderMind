import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenVerified, setTokenVerified] = useState(false);
  const navigate = useNavigate();

  const urlToken = searchParams.get('token');

  useEffect(() => {
    if (!urlToken) {
      // No token in URL, allow manual entry
      setValidatingToken(false);
      return;
    }

    // Validate token from URL on mount
    async function validateToken() {
      try {
        const res = await fetch(`/api/auth/validate-reset-token?token=${urlToken}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Invalid or expired reset token');
        }
        setTokenVerified(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setValidatingToken(false);
      }
    }

    validateToken();
  }, [urlToken]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const resetToken = urlToken || manualToken;

    if (!resetToken) {
      setError('Please enter your reset code');
      return;
    }

    // Validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setBusy(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white dark:from-neutral-950 dark:to-neutral-900">
        <div className="w-full max-w-md card text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-neutral-600 dark:text-neutral-400">Validating reset token...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white dark:from-neutral-950 dark:to-neutral-900">
      <div className="w-full max-w-md card">
        <div className="mb-6 text-center">
          <div className="text-5xl mb-4">🔑</div>
          <h1 className="text-2xl font-bold text-brand-700 dark:text-brand-400">Reset Password</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            {urlToken && tokenVerified 
              ? 'Enter your new password below.'
              : 'Enter your reset code from the email and your new password.'
            }
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {!urlToken && (
            <div>
              <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
                Reset Code
              </label>
              <input
                className="input font-mono tracking-wider"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value.toUpperCase())}
                type="text"
                required={!urlToken}
                placeholder="Enter code from email"
                disabled={busy}
                maxLength={64}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                The full reset code from your email
              </p>
            </div>
          )}

          {urlToken && tokenVerified && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <span>✓</span>
              <span>Reset code verified from link</span>
            </div>
          )}

          <div>
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              New Password
            </label>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Enter new password"
              disabled={busy}
              minLength={6}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-700 dark:text-neutral-300">
              Confirm Password
            </label>
            <input
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              required
              placeholder="Confirm new password"
              disabled={busy}
            />
          </div>

          <button
            className="btn btn-primary w-full"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium transition-colors text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
