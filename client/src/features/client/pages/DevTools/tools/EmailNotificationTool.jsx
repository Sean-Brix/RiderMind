import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Email Tool - Notification
 * Send notification email for testing
 */
function EmailNotificationTool() {
  const [formData, setFormData] = useState({
    email: '',
    name: 'Jane Smith',
    title: 'New Module Available',
    subject: 'New Content - RiderMind',
    icon: '📚',
    badge: 'NEW',
    message: 'A new learning module "Advanced JavaScript" has been added to your curriculum. Start learning today!',
    actionUrl: '',
    actionText: 'View Module',
    additionalInfo: '',
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
          template: 'notification',
          to: formData.email,
          data: {
            name: formData.name,
            title: formData.title,
            subject: formData.subject,
            icon: formData.icon,
            badge: formData.badge || undefined,
            message: formData.message,
            actionUrl: formData.actionUrl || undefined,
            actionText: formData.actionText,
            additionalInfo: formData.additionalInfo || undefined,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: 'Notification email sent successfully!',
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
      name: 'Jane Smith',
      title: 'New Module Available',
      subject: 'New Content - RiderMind',
      icon: '📚',
      badge: 'NEW',
      message: 'A new learning module "Advanced JavaScript" has been added to your curriculum. Start learning today!',
      actionUrl: '',
      actionText: 'View Module',
      additionalInfo: '',
    });
    setResult(null);
  };

  // Quick templates
  const templates = [
    {
      name: 'New Module',
      icon: '📚',
      title: 'New Module Available',
      message: 'A new learning module has been added to your curriculum.',
      badge: 'NEW',
    },
    {
      name: 'Achievement',
      icon: '🎉',
      title: 'Congratulations!',
      message: 'You have earned a new achievement badge!',
      badge: 'ACHIEVEMENT',
    },
    {
      name: 'Reminder',
      icon: '⏰',
      title: 'Reminder',
      message: 'Don\'t forget to complete your daily quiz!',
      badge: 'REMINDER',
    },
    {
      name: 'Update',
      icon: '🔔',
      title: 'System Update',
      message: 'New features have been added to the platform.',
      badge: 'UPDATE',
    },
  ];

  const applyTemplate = (template) => {
    setFormData(prev => ({
      ...prev,
      icon: template.icon,
      title: template.title,
      message: template.message,
      badge: template.badge,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Notification Email
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Test the general notification email template. Use this for announcements, alerts, and updates.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Quick Templates</h4>
        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => (
            <button
              key={template.name}
              onClick={() => applyTemplate(template)}
              className="flex items-center gap-2 p-3 bg-neutral-50 dark:bg-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded-lg transition-colors text-left"
            >
              <span className="text-xl">{template.icon}</span>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                {template.name}
              </span>
            </button>
          ))}
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

          <div className="grid grid-cols-2 gap-4">
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
                placeholder="Jane Smith"
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
              />
            </div>

            {/* Icon Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Icon (Emoji)
              </label>
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                placeholder="📚"
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="New Module Available"
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
              />
            </div>

            {/* Badge Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Badge (Optional)
              </label>
              <input
                type="text"
                name="badge"
                value={formData.badge}
                onChange={handleInputChange}
                placeholder="NEW"
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Subject Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Email Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Notification from RiderMind"
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
          </div>

          {/* Message Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Your notification message..."
              className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Action URL Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Action URL (Optional)
              </label>
              <input
                type="url"
                name="actionUrl"
                value={formData.actionUrl}
                onChange={handleInputChange}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
              />
            </div>

            {/* Action Text Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Button Text
              </label>
              <input
                type="text"
                name="actionText"
                value={formData.actionText}
                onChange={handleInputChange}
                placeholder="View Details"
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Additional Info Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Additional Info (Optional)
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows="2"
              placeholder="Extra details or notes..."
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
    </div>
  );
}

export default EmailNotificationTool;
