import { useState } from 'react';
import Navbar from '../../../../components/Navbar';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('preferences');
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'light',
    language: 'en',
    timezone: 'UTC+8',
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    twoFactorAuth: false,
    sessionTimeout: '30',
  });

  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      localStorage.setItem('theme', value);
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">Manage your application preferences and settings</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 mb-6">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-700 dark:text-brand-400'
                    : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:border-neutral-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700 p-6">
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Preferences</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="input w-full max-w-xs"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Choose your preferred color scheme
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="input w-full max-w-xs"
                  >
                    <option value="en">English</option>
                    <option value="tl">Tagalog</option>
                    <option value="es">Español</option>
                  </select>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Select your preferred language
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => updateSetting('timezone', e.target.value)}
                    className="input w-full max-w-xs"
                  >
                    <option value="UTC+8">Philippine Time (UTC+8)</option>
                    <option value="UTC">UTC</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                  </select>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Set your local timezone
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <button className="btn btn-primary">Save Preferences</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Notification Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div>
                    <h3 className="flex font-medium text-neutral-900 dark:text-neutral-100">Email Notifications</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive email updates about your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div>
                    <h3 className="flex font-medium text-neutral-900 dark:text-neutral-100">Push Notifications</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Get push notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div>
                    <h3 className="flex font-medium text-neutral-900 dark:text-neutral-100">Weekly Report</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Receive weekly progress reports via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.weeklyReport}
                      onChange={(e) => updateSetting('weeklyReport', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-brand-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button className="btn btn-primary">Save Notification Settings</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Security Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-200 dark:border-neutral-700">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Two-Factor Authentication</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Add an extra layer of security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => updateSetting('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Session Timeout
                  </label>
                  <select
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
                    className="input w-full max-w-xs"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                    <option value="never">Never</option>
                  </select>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Automatically log out after period of inactivity
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <button className="btn btn-secondary w-full sm:w-auto">
                    Change Password
                  </button>
                  <button className="btn btn-secondary w-full sm:w-auto ml-0 sm:ml-3">
                    View Login History
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button className="btn btn-primary">Save Security Settings</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
