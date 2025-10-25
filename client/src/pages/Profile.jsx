import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Profile</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">View and manage your personal information</p>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
        {/* Profile Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-3xl font-bold">
                {displayName[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{displayName}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{profile.email}</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-400">
                  {currentUser?.role || 'USER'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.first_name || ''}
                    onChange={(e) => update('first_name', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.first_name || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Middle Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.middle_name || ''}
                    onChange={(e) => update('middle_name', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.middle_name || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.last_name || ''}
                    onChange={(e) => update('last_name', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.last_name || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Name Extension</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name_extension || ''}
                    onChange={(e) => update('name_extension', e.target.value)}
                    className="input w-full"
                    placeholder="Jr., Sr., III"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.name_extension || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Birthdate</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profile.birthdate ? String(profile.birthdate).substring(0, 10) : ''}
                    onChange={(e) => update('birthdate', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : '—'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Sex</label>
                {isEditing ? (
                  <select value={profile.sex || ''} onChange={(e) => update('sex', e.target.value)} className="input w-full">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.sex || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Nationality</label>
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
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.nationality || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Civil Status</label>
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
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.civil_status || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Cellphone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.cellphone_number || ''}
                    onChange={(e) => update('cellphone_number', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.cellphone_number || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email_address || ''}
                    onChange={(e) => update('email_address', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.email_address || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">House No.</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.address_house_no || ''}
                    onChange={(e) => update('address_house_no', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.address_house_no || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Street</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.address_street || ''}
                    onChange={(e) => update('address_street', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.address_street || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Barangay</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.address_barangay || ''}
                    onChange={(e) => update('address_barangay', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.address_barangay || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">City/Municipality</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.address_city_municipality || ''}
                    onChange={(e) => update('address_city_municipality', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.address_city_municipality || '—'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Province</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.address_province || ''}
                    onChange={(e) => update('address_province', e.target.value)}
                    className="input w-full"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-neutral-100">{profile.address_province || '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <button onClick={handleSave} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
