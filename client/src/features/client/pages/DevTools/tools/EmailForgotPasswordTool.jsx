import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Email Tool - Forgot Password
 * Send forgot password email for testing
 */
function EmailForgotPasswordTool() {
  const [formData, setFormData] = useState({
    email: '',
    name: 'John Doe',
    resetToken: 'ABC123',
    expiresIn: '1 hour',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Load current user info
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
          }));
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };
    loadUserInfo();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/dev/send-test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          template: 'forgotPassword',
          to: formData.email,
          data: {
            name: formData.name,
            resetLink: `${window.location.origin}/reset-password?token=${formData.resetToken}`,
            resetToken: formData.resetToken,
            expiresIn: formData.expiresIn,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Forgot password email sent successfully!',
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send email',
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error.message,
        details: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      email: '',
      name: 'John Doe',
      resetToken: 'ABC123',
      expiresIn: '1 hour',
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">🔐</span>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Forgot Password Email
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Test the forgot password email template. This email includes a reset link and optional reset code.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Recipient Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="user@example.com"
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              User Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
          </div>

          {/* Reset Token Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Reset Token/Code
            </label>
            <input
              type="text"
              name="resetToken"
              value={formData.resetToken}
              onChange={handleInputChange}
              placeholder="ABC123"
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Optional: Display a reset code in the email
            </p>
          </div>

          {/* Expiration Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Expiration Time
            </label>
            <input
              type="text"
              name="expiresIn"
              value={formData.expiresIn}
              onChange={handleInputChange}
              placeholder="1 hour"
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Sending...
                </>
              ) : (
                <>
                  <span>📧</span>
                  Send Email
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-lg border p-4 ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex gap-3">
            <span className="text-2xl">{result.success ? '✅' : '❌'}</span>
            <div className="flex-1">
              <h4 className={`font-semibold mb-1 ${
                result.success
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {result.success ? 'Success' : 'Error'}
              </h4>
              <p className={`text-sm ${
                result.success
                  ? 'text-green-700 dark:text-green-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {result.message}
              </p>
              {result.details && (
                <pre className="mt-2 text-xs bg-white dark:bg-neutral-900 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Preview Info */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <h4 className="font-semibold text-neutral-900 dark:text-white mb-2 flex items-center gap-2">
          <span>👁️</span>
          Email Preview
        </h4>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <li>• Purple gradient header with lock icon</li>
          <li>• Personalized greeting with user name</li>
          <li>• "Reset Password" button with link</li>
          <li>• Reset code display (if provided)</li>
          <li>• Expiration time warning</li>
          <li>• Security notice footer</li>
        </ul>
      </div>
    </div>
  );
}

export default EmailForgotPasswordTool;
