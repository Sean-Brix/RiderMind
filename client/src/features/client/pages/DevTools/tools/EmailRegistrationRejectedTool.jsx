import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Email Tool - Registration Rejected
 * Send registration rejection email for testing
 */
function EmailRegistrationRejectedTool() {
  const [formData, setFormData] = useState({
    email: '',
    name: 'Alex Johnson',
    reason: 'The email address provided does not match our institutional domain requirements. Please use your official educational institution email address.',
    allowReapply: true,
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
          template: 'registrationRejected',
          to: formData.email,
          data: {
            name: formData.name,
            reason: formData.reason || undefined,
            allowReapply: formData.allowReapply,
            registrationUrl: `${window.location.origin}/register`,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Registration rejected email sent successfully!',
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
      name: 'Alex Johnson',
      reason: 'The email address provided does not match our institutional domain requirements. Please use your official educational institution email address.',
      allowReapply: true,
    });
    setResult(null);
  };

  // Common rejection reasons
  const commonReasons = [
    'The email address provided does not match our institutional domain requirements. Please use your official educational institution email address.',
    'The information provided could not be verified. Please ensure all details are accurate and complete.',
    'Your registration does not meet the current eligibility criteria for this program.',
    'Duplicate account detected. An account with this email address already exists in our system.',
    'The submitted documentation is incomplete or does not meet our requirements.',
  ];

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
              Registration Rejected Email
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              Test the registration rejection email template. This email notifies users when their account registration is not approved.
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
              Applicant Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Alex Johnson"
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
          </div>

          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Rejection Reason (Optional)
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows="4"
              placeholder="Explain why the registration was rejected..."
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Optional: Leave blank to omit reason from email
            </p>
          </div>

          {/* Common Reasons Quick Select */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Common Reasons (Click to use)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {commonReasons.map((reason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reason }))}
                  className="w-full text-left p-3 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-lg transition-colors text-sm text-neutral-700 dark:text-neutral-200"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Allow Reapply Checkbox */}
          <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
            <input
              type="checkbox"
              id="allowReapply"
              name="allowReapply"
              checked={formData.allowReapply}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-500 bg-white dark:bg-neutral-600 border-neutral-300 dark:border-neutral-500 rounded focus:ring-2 focus:ring-primary-500"
            />
            <label htmlFor="allowReapply" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              Allow user to reapply
            </label>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 -mt-2">
            {formData.allowReapply
              ? 'Email will include a "Apply Again" button and encouragement to resubmit.'
              : 'Email will not include reapplication option.'}
          </p>

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
          <li>• Red gradient header with rejection notice</li>
          <li>• Personalized greeting with applicant name</li>
          <li>• Alert box showing rejection status</li>
          <li>• Detailed rejection reason (if provided)</li>
          <li>• Reapplication instructions (if enabled)</li>
          <li>• Contact support information</li>
          <li>• Professional and respectful tone</li>
        </ul>
      </div>

      {/* Best Practices */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
              Best Practices
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• Be clear and specific about rejection reasons</li>
              <li>• Maintain a professional and respectful tone</li>
              <li>• Provide actionable feedback when possible</li>
              <li>• Include contact information for questions</li>
              <li>• Consider allowing reapplication unless permanently banned</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailRegistrationRejectedTool;
