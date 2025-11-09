// Mock profile data for demonstration
export const profileData = {
  // User identity
  name: 'Juan Dela Cruz',
  email: 'juan.delacruz@example.com',
  role: 'Student',
  avatarUrl: null, // Will use initials if null
  
  // Primary information sections
  sections: [
    {
      title: 'Personal Information',
      icon: 'user',
      rows: [
        { label: 'First Name', value: 'Juan' },
        { label: 'Middle Name', value: 'Santos' },
        { label: 'Last Name', value: 'Dela Cruz' },
        { label: 'Extension', value: 'Jr.' },
        { label: 'Birthdate', value: 'January 15, 1995' },
        { label: 'Sex', value: 'Male' },
        { label: 'Nationality', value: 'Filipino' },
        { label: 'Civil Status', value: 'Single' },
      ]
    },
    {
      title: 'Address',
      icon: 'location',
      rows: [
        { label: 'House No.', value: '123' },
        { label: 'Street', value: 'Rizal Street' },
        { label: 'Barangay', value: 'Poblacion' },
        { label: 'City', value: 'Manila' },
        { label: 'Province', value: 'Metro Manila' },
      ]
    }
  ],
  
  // Contact details
  contact: {
    phone: '+63 912 345 6789',
    email: 'juan.delacruz@example.com',
    alternateEmail: 'juan.personal@gmail.com'
  }
};
