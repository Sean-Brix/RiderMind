import { useState, useEffect } from 'react';
import Navbar from '../../../../components/Navbar';

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

export default function Profile() {
  const currentUser = getUser();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    name_extension: '',
    email: '',
    birthdate: '',
    sex: '',
    nationality: '',
    civil_status: '',
    cellphone_number: '',
    email_address: '',
    address_house_no: '',
    address_street: '',
    address_barangay: '',
    address_city_municipality: '',
    address_province: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/account/${currentUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');
      setProfile(data.user || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/account/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      
      // Update local storage
      const updatedUser = { ...currentUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  function update(key, value) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-600 dark:text-neutral-400">Loading profile...</div>
        </div>
      </>
    );
  }

  const displayName = [profile.first_name, profile.middle_name, profile.last_name, profile.name_extension]
    .filter(Boolean)
    .join(' ') || profile.email || 'User';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">My Profile</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">View and manage your personal information</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {/* Profile Header Card */}
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 mb-6 overflow-hidden">
            <div className="bg-gradient-to-r from-brand-600 to-brand-800 h-32" />
            <div className="px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-12">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-neutral-900 p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-4xl font-bold">
                    {displayName[0].toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left sm:mt-4">
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{displayName}</h2>
                  <p className="text-neutral-500 dark:text-neutral-400">{profile.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {currentUser?.role || 'USER'}
                    </span>
                  </div>
                </div>
                <div className="sm:mt-4">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                      isEditing
                        ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content Cards */}
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Personal Information</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">First Name</label>
                    {isEditing ? (
                      <input type="text" value={profile.first_name || ''} onChange={(e) => update('first_name', e.target.value)} className="input w-full" placeholder="Enter first name" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.first_name || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Middle Name</label>
                    {isEditing ? (
                      <input type="text" value={profile.middle_name || ''} onChange={(e) => update('middle_name', e.target.value)} className="input w-full" placeholder="Enter middle name" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.middle_name || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Last Name</label>
                    {isEditing ? (
                      <input type="text" value={profile.last_name || ''} onChange={(e) => update('last_name', e.target.value)} className="input w-full" placeholder="Enter last name" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.last_name || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Name Extension</label>
                    {isEditing ? (
                      <input type="text" value={profile.name_extension || ''} onChange={(e) => update('name_extension', e.target.value)} className="input w-full" placeholder="Jr., Sr., III" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.name_extension || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Birthdate</label>
                    {isEditing ? (
                      <input type="date" value={profile.birthdate ? String(profile.birthdate).substring(0, 10) : ''} onChange={(e) => update('birthdate', e.target.value)} className="input w-full" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Sex</label>
                    {isEditing ? (
                      <select value={profile.sex || ''} onChange={(e) => update('sex', e.target.value)} className="input w-full">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.sex || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Nationality</label>
                    {isEditing ? (
                      <select value={profile.nationality || ''} onChange={(e) => update('nationality', e.target.value)} className="input w-full">
                        <option value="">Select</option>
                        <option value="Filipino">Filipino</option>
                        <option value="American">American</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Korean">Korean</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.nationality || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Civil Status</label>
                    {isEditing ? (
                      <select value={profile.civil_status || ''} onChange={(e) => update('civil_status', e.target.value)} className="input w-full">
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Separated">Separated</option>
                      </select>
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.civil_status || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Contact Information</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Cellphone Number</label>
                    {isEditing ? (
                      <input type="text" value={profile.cellphone_number || ''} onChange={(e) => update('cellphone_number', e.target.value)} className="input w-full" placeholder="+63 XXX XXX XXXX" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.cellphone_number || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
                    {isEditing ? (
                      <input type="email" value={profile.email_address || ''} onChange={(e) => update('email_address', e.target.value)} className="input w-full" placeholder="email@example.com" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.email_address || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700">
              <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Address</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">House No.</label>
                    {isEditing ? (
                      <input type="text" value={profile.address_house_no || ''} onChange={(e) => update('address_house_no', e.target.value)} className="input w-full" placeholder="House/Lot/Block No." />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.address_house_no || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Street</label>
                    {isEditing ? (
                      <input type="text" value={profile.address_street || ''} onChange={(e) => update('address_street', e.target.value)} className="input w-full" placeholder="Street Name" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.address_street || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Barangay</label>
                    {isEditing ? (
                      <input type="text" value={profile.address_barangay || ''} onChange={(e) => update('address_barangay', e.target.value)} className="input w-full" placeholder="Barangay" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.address_barangay || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">City/Municipality</label>
                    {isEditing ? (
                      <input type="text" value={profile.address_city_municipality || ''} onChange={(e) => update('address_city_municipality', e.target.value)} className="input w-full" placeholder="City/Municipality" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.address_city_municipality || '—'}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Province</label>
                    {isEditing ? (
                      <input type="text" value={profile.address_province || ''} onChange={(e) => update('address_province', e.target.value)} className="input w-full" placeholder="Province" />
                    ) : (
                      <p className="text-neutral-900 dark:text-neutral-100 py-2 px-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">{profile.address_province || '—'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-6">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2.5 rounded-lg font-medium border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    Cancel Changes
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-lg font-medium bg-brand-600 text-white hover:bg-brand-700 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
