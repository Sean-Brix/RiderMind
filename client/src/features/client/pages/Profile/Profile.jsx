/**
 * ProfilePage - Clean, compact profile page with responsive layout
 * 
 * Layout breakdown:
 * - Compact header with matte blue gradient (120px height)
 * - Avatar overlaps banner by ~50% for modern look
 * - Two-column layout: main info (left) + contact sidebar (right, sticky on desktop)
 * - Mobile: single column with centered avatar
 * - Minimal whitespace: tight padding (py-4, px-6) and margins
 */

import { useState, useEffect } from 'react';
import Navbar from '../../../../components/Navbar';
import AvatarCard from './components/AvatarCard';
import InfoCard from './components/InfoCard';
import ContactCard from './components/ContactCard';

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

  // Build display name
  const displayName = [profile.first_name, profile.middle_name, profile.last_name, profile.name_extension]
    .filter(Boolean)
    .join(' ') || profile.email || 'User';

  // Transform profile data to match component structure
  const profileData = {
    name: displayName,
    email: profile.email,
    role: currentUser?.role || 'Student',
    avatarUrl: null,
    sections: [
      {
        title: 'Personal Information',
        icon: 'user',
        rows: [
          { label: 'First Name', value: profile.first_name },
          { label: 'Middle Name', value: profile.middle_name },
          { label: 'Last Name', value: profile.last_name },
          { label: 'Extension', value: profile.name_extension },
          { label: 'Birthdate', value: profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : null },
          { label: 'Sex', value: profile.sex },
          { label: 'Nationality', value: profile.nationality },
          { label: 'Civil Status', value: profile.civil_status },
        ]
      },
      {
        title: 'Address',
        icon: 'location',
        rows: [
          { label: 'House No.', value: profile.address_house_no },
          { label: 'Street', value: profile.address_street },
          { label: 'Barangay', value: profile.address_barangay },
          { label: 'City', value: profile.address_city_municipality },
          { label: 'Province', value: profile.address_province },
        ]
      }
    ],
    contact: {
      phone: profile.cellphone_number,
      email: profile.email,
      alternateEmail: profile.email_address
    }
  };

  // Quick action handlers
  const handleCall = () => {
    if (profileData.contact.phone) {
      window.location.href = `tel:${profileData.contact.phone}`;
    }
  };

  const handleEmail = () => {
    if (profileData.contact.email) {
      window.location.href = `mailto:${profileData.contact.email}`;
    }
  };

  const contactActions = [
    {
      label: 'Call',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      onClick: handleCall
    },
    {
      label: 'Send Email',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      onClick: handleEmail
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Alerts */}
        {error && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-green-700 dark:text-green-400">{success}</span>
            </div>
          </div>
        )}

        {/* Compact header with matte blue gradient - low height, no huge gaps */}
        <div className="relative h-24"></div>

        {/* Main content container - reduced top padding for avatar overlap */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-8">
          {/* Avatar and header content - overlaps banner */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <AvatarCard
              name={profileData.name}
              avatarUrl={profileData.avatarUrl}
              role={profileData.role}
              email={profileData.email}
            />

            {/* Edit button - small, rounded, with icon */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              aria-label="Edit profile"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                isEditing
                  ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {isEditing ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* Two-column layout: main content (left) + sidebar (right) */}
          {/* On mobile (below md), sidebar stacks below main content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main content area - 2 columns wide on desktop */}
            <div className="md:col-span-2">
              <InfoCard sections={profileData.sections} isEditing={isEditing} profile={profile} update={update} />
            </div>

            {/* Sidebar - 1 column wide on desktop, sticky positioning */}
            <div className="md:col-span-1">
              <div className="md:sticky md:top-6">
                <ContactCard
                  phone={profileData.contact.phone}
                  email={profileData.contact.email}
                  alternateEmail={profileData.contact.alternateEmail}
                  actions={contactActions}
                />
                
                {/* Save button */}
                {isEditing && (
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={handleSave}
                      className="w-full px-5 py-3 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
