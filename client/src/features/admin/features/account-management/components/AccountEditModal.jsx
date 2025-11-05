import { useState } from 'react';
import { format } from 'date-fns';

export default function AccountEditModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    email: user.email || '',
    password: '', // Leave blank by default
    role: user.role || 'USER',
    first_name: user.first_name || '',
    middle_name: user.middle_name || '',
    last_name: user.last_name || '',
    name_extension: user.name_extension || '',
    birthdate: user.birthdate ? String(user.birthdate).substring(0, 10) : '',
    sex: user.sex || '',
    nationality: user.nationality || 'Filipino',
    civil_status: user.civil_status || 'Single',
    weight: user.weight || '',
    height: user.height || '',
    blood_type: user.blood_type || '',
    eye_color: user.eye_color || '',
    address_house_no: user.address_house_no || '',
    address_street: user.address_street || '',
    address_barangay: user.address_barangay || '',
    address_city_municipality: user.address_city_municipality || '',
    address_province: user.address_province || '',
    telephone_number: user.telephone_number || '',
    cellphone_number: user.cellphone_number || '',
    email_address: user.email_address || '',
    emergency_contact_name: user.emergency_contact_name || '',
    emergency_contact_relationship: user.emergency_contact_relationship || '',
    emergency_contact_number: user.emergency_contact_number || '',
    student_type: user.student_type || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  function update(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validate student_type for USER accounts
    if (form.role === 'USER' && !form.student_type) {
      setError('Please select a vehicle category for USER accounts.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = { ...form };
      
      // Remove password if empty
      if (!payload.password) delete payload.password;
      
      // Convert empty strings to null for enum fields
      if (!payload.nationality || payload.nationality === '') delete payload.nationality;
      if (!payload.civil_status || payload.civil_status === '') delete payload.civil_status;

      const res = await fetch(`/api/account/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update account');
      }

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const fullName = [user.first_name, user.middle_name, user.last_name, user.name_extension]
    .filter(Boolean)
    .join(' ') || user.email;

  return (
    <>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-[70] animate-slide-in-right">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-2xl border border-green-200 dark:border-green-800 p-4 min-w-[300px] max-w-md">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 pt-0.5">
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-1">Success!</h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Account updated successfully</p>
              </div>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-5xl w-full my-8 border border-neutral-200 dark:border-neutral-700">
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {fullName}
                  </h2>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    user.role === 'ADMIN' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-800' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <span className="font-mono">USER-{String(user.id).padStart(4, '0')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Created {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit}>
            <div className="px-8 py-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Account Information */}
                <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30 border-b border-brand-200 dark:border-brand-800">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Account Information</h3>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Password <span className="text-xs text-neutral-500">(leave blank to keep current)</span>
                      </label>
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => update('password', e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.role}
                        onChange={(e) => update('role', e.target.value)}
                        className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Personal Information */}
                <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-b border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h3>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">First Name</label>
                      <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Middle Name</label>
                      <input type="text" value={form.middle_name} onChange={(e) => update('middle_name', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Last Name</label>
                      <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Name Extension</label>
                      <input type="text" value={form.name_extension} onChange={(e) => update('name_extension', e.target.value)} placeholder="Jr., Sr., III" className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Birthdate</label>
                      <input type="date" value={form.birthdate} onChange={(e) => update('birthdate', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sex</label>
                      <select value={form.sex} onChange={(e) => update('sex', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                        <option value="">Select...</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nationality</label>
                      <select value={form.nationality} onChange={(e) => update('nationality', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                        <option value="Filipino">Filipino</option>
                        <option value="American">American</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Civil Status</label>
                      <select value={form.civil_status} onChange={(e) => update('civil_status', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Separated">Separated</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Weight (kg)</label>
                      <input type="number" step="0.1" value={form.weight} onChange={(e) => update('weight', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Height (cm)</label>
                      <input type="number" step="0.1" value={form.height} onChange={(e) => update('height', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Blood Type</label>
                      <select value={form.blood_type} onChange={(e) => update('blood_type', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                        <option value="">Select...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Eye Color</label>
                      <input type="text" value={form.eye_color} onChange={(e) => update('eye_color', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Student Type {form.role === 'USER' && <span className="text-red-500">*</span>}
                      </label>
                      <select value={form.student_type} onChange={(e) => update('student_type', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent">
                        <option value="">Select...</option>
                        <option value="A">Motorcycle</option>
                        <option value="B">Car</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Address Information */}
                <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-b border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Address</h3>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">House No.</label>
                      <input type="text" value={form.address_house_no} onChange={(e) => update('address_house_no', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Street</label>
                      <input type="text" value={form.address_street} onChange={(e) => update('address_street', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Barangay</label>
                      <input type="text" value={form.address_barangay} onChange={(e) => update('address_barangay', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">City/Municipality</label>
                      <input type="text" value={form.address_city_municipality} onChange={(e) => update('address_city_municipality', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Province</label>
                      <input type="text" value={form.address_province} onChange={(e) => update('address_province', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                  </div>
                </section>

                {/* Contact Information */}
                <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h3>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Cellphone</label>
                      <input type="text" value={form.cellphone_number} onChange={(e) => update('cellphone_number', e.target.value)} placeholder="+63 912 345 6789" className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Telephone</label>
                      <input type="text" value={form.telephone_number} onChange={(e) => update('telephone_number', e.target.value)} placeholder="(02) 1234-5678" className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Alternative Email</label>
                      <input type="email" value={form.email_address} onChange={(e) => update('email_address', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                  </div>
                </section>

                {/* Emergency Contact */}
                <section className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                  <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30 border-b border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Emergency Contact</h3>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Contact Name</label>
                      <input type="text" value={form.emergency_contact_name} onChange={(e) => update('emergency_contact_name', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Relationship</label>
                      <input type="text" value={form.emergency_contact_relationship} onChange={(e) => update('emergency_contact_relationship', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Contact Number</label>
                      <input type="text" value={form.emergency_contact_number} onChange={(e) => update('emergency_contact_number', e.target.value)} className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-6 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-2xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (form.role === 'USER' && !form.student_type)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
