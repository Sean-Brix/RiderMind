import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Account Information
    email: '',
    password: '',
    confirmPassword: '',
    
    // Personal Information
    last_name: '',
    first_name: '',
    middle_name: '',
    name_extension: '',
    birthdate: '',
    sex: '',
    nationality: 'Filipino',
    civil_status: 'Single',
    weight: '',
    height: '',
    blood_type: '',
    eye_color: '',
    
    // Address Information
    address_house_no: '',
    address_street: '',
    address_barangay: '',
    address_city_municipality: '',
    address_province: '',
    
    // Contact Information
    telephone_number: '',
    cellphone_number: '',
    email_address: '',
    
    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_number: '',
    
    // Student Type
    student_type: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const validateStep = (step) => {
    setError('');

    switch (step) {
      case 1:
        // Account Information validation
        if (!formData.email) {
          setError('Email is required');
          return false;
        }
        if (!formData.password) {
          setError('Password is required');
          return false;
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          setError(passwordError);
          return false;
        }
        if (!formData.confirmPassword) {
          setError('Please confirm your password');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        break;

      case 2:
        // Personal Information validation
        if (!formData.last_name) {
          setError('Last name is required');
          return false;
        }
        if (!formData.first_name) {
          setError('First name is required');
          return false;
        }
        if (!formData.birthdate) {
          setError('Birthdate is required');
          return false;
        }
        if (!formData.sex) {
          setError('Sex is required');
          return false;
        }
        if (!formData.student_type) {
          setError('Student type is required');
          return false;
        }
        break;

      case 3:
        // Address Information validation
        if (!formData.address_barangay) {
          setError('Barangay is required');
          return false;
        }
        if (!formData.address_city_municipality) {
          setError('City/Municipality is required');
          return false;
        }
        if (!formData.address_province) {
          setError('Province is required');
          return false;
        }
        break;

      case 4:
        // Contact Information validation
        if (!formData.cellphone_number) {
          setError('Cellphone number is required');
          return false;
        }
        if (!formData.emergency_contact_name) {
          setError('Emergency contact name is required');
          return false;
        }
        if (!formData.emergency_contact_relationship) {
          setError('Emergency contact relationship is required');
          return false;
        }
        if (!formData.emergency_contact_number) {
          setError('Emergency contact number is required');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final validation before submission
    if (!validateStep(4)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          last_name: formData.last_name,
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          name_extension: formData.name_extension,
          birthdate: formData.birthdate || null,
          sex: formData.sex,
          nationality: formData.nationality || null,
          civil_status: formData.civil_status || null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          height: formData.height ? parseFloat(formData.height) : null,
          blood_type: formData.blood_type,
          eye_color: formData.eye_color,
          address_house_no: formData.address_house_no,
          address_street: formData.address_street,
          address_barangay: formData.address_barangay,
          address_city_municipality: formData.address_city_municipality,
          address_province: formData.address_province,
          telephone_number: formData.telephone_number,
          cellphone_number: formData.cellphone_number,
          email_address: formData.email_address,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_relationship: formData.emergency_contact_relationship,
          emergency_contact_number: formData.emergency_contact_number,
          student_type: formData.student_type || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Show success modal with request ID
      setRequestId(data.requestId);
      setShowSuccessModal(true);

    } catch (err) {
      setError(err.message || 'Failed to submit registration request');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setError('');
    setCurrentStep(step);
  };

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Registration Request Submitted!
          </h3>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
            Your registration request has been successfully submitted and is pending admin approval.
          </p>

          <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-4 mb-6">
            <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Your Request ID
            </p>
            <div className="bg-white dark:bg-neutral-800 rounded border-2 border-dashed border-brand-600 dark:border-brand-400 p-3">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 font-mono">
                #{requestId}
              </p>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-2">
              Please save this ID and show it to the admin for verification
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/login');
              }}
              className="w-full px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`Request ID: ${requestId}`);
              }}
              className="w-full px-4 py-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg font-medium transition-colors text-sm"
            >
              Copy Request ID
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      {showSuccessModal && <SuccessModal />}

      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Create Account
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Register for RiderMind - Your request will be reviewed by an admin
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => goToStep(step)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-110 ${
                      currentStep >= step
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                    }`}
                  >
                    {step}
                  </button>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      currentStep > step
                        ? 'bg-brand-600'
                        : 'bg-neutral-200 dark:bg-neutral-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span>Account</span>
              <span>Personal</span>
              <span>Address</span>
              <span>Contact</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Must be at least 8 characters with uppercase, lowercase, numbers, and special characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personal Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Name Extension
                    </label>
                    <input
                      type="text"
                      name="name_extension"
                      value={formData.name_extension}
                      onChange={handleChange}
                      placeholder="Jr., Sr., III, etc."
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Birthdate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Sex <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nationality
                    </label>
                    <select
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    >
                      <option value="Filipino">Filipino</option>
                      <option value="American">American</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Korean">Korean</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Civil Status
                    </label>
                    <select
                      name="civil_status"
                      value={formData.civil_status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Blood Type
                    </label>
                    <select
                      name="blood_type"
                      value={formData.blood_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    >
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
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Eye Color
                    </label>
                    <input
                      type="text"
                      name="eye_color"
                      value={formData.eye_color}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Student Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="student_type"
                      value={formData.student_type}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      <option value="A">Motorcycle</option>
                      <option value="B">Car</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Address Information */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      House No.
                    </label>
                    <input
                      type="text"
                      name="address_house_no"
                      value={formData.address_house_no}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Street
                    </label>
                    <input
                      type="text"
                      name="address_street"
                      value={formData.address_street}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Barangay <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_barangay"
                      value={formData.address_barangay}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      City/Municipality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_city_municipality"
                      value={formData.address_city_municipality}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address_province"
                      value={formData.address_province}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact Information */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Telephone Number
                    </label>
                    <input
                      type="tel"
                      name="telephone_number"
                      value={formData.telephone_number}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Cellphone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="cellphone_number"
                      value={formData.cellphone_number}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Address (Alternative)
                    </label>
                    <input
                      type="email"
                      name="email_address"
                      value={formData.email_address}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 mt-6">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
                    Emergency Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="emergency_contact_name"
                        value={formData.emergency_contact_name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Relationship <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="emergency_contact_relationship"
                        value={formData.emergency_contact_relationship}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Mother, Father, Spouse"
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="emergency_contact_number"
                        value={formData.emergency_contact_number}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    ← Previous
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium"
              >
                Login here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
