import { useState } from 'react';

const VEHICLE_CATEGORIES = [
  { code: 'A', name: 'Motorcycle', icon: '🏍️', description: 'Two-wheeled motorcycles' },
  { code: 'A1', name: 'Light Motorcycle', icon: '🛵', description: 'Light motorcycles and scooters' },
  { code: 'B', name: 'Car', icon: '🚗', description: 'Private cars and light vehicles' },
  { code: 'B1', name: 'Tricycle', icon: '🛺', description: 'Motorized tricycles' },
  { code: 'B2', name: 'Light Truck', icon: '🚚', description: 'Light trucks up to 4500kg' },
  { code: 'C', name: 'Heavy Truck', icon: '🚛', description: 'Trucks over 4500kg' },
  { code: 'D', name: 'Bus/Passenger', icon: '🚌', description: 'Buses and passenger vehicles' },
  { code: 'BE', name: 'Car with Trailer', icon: '🚙', description: 'Car with attached trailer' },
  { code: 'CE', name: 'Truck with Trailer', icon: '🚚', description: 'Truck with attached trailer' },
];

export default function AccountForm({ mode = 'create', initialValues, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(() => ({
    // Auth basics
    email: '',
    password: '',
    role: 'USER',
    // Personal
    last_name: '', first_name: '', middle_name: '', name_extension: '', birthdate: '', sex: '', nationality: '', civil_status: '', weight: '', height: '', blood_type: '', eye_color: '',
    // Address
    address_house_no: '', address_street: '', address_barangay: '', address_city_municipality: '', address_province: '',
    // Contact
    telephone_number: '', cellphone_number: '', email_address: '',
    // Emergency
    emergency_contact_name: '', emergency_contact_relationship: '', emergency_contact_number: '',
    // Vehicle
    student_type: '', // Single vehicle category (required for USER)
    ...(initialValues || {}),
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function nextStep() {
    setCurrentStep((s) => Math.min(s + 1, 5));
  }

  function prevStep() {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    
    // Validate student_type for USER accounts
    if (form.role === 'USER' && !form.student_type) {
      setError('Please select a primary vehicle category for USER accounts.');
      setCurrentStep(5); // Go to vehicle step
      return;
    }
    
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form };
      
      // Convert empty strings to null for enum fields
      if (!payload.nationality || payload.nationality === '') delete payload.nationality;
      if (!payload.civil_status || payload.civil_status === '') delete payload.civil_status;
      
      const url = mode === 'edit' && initialValues?.id ? `/api/account/${initialValues.id}` : '/api/account';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      // If editing and password is empty, don't send it
      if (mode === 'edit' && !payload.password) delete payload.password;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (mode === 'edit' ? 'Failed to update account' : 'Failed to create account'));
      onSuccess?.(data.user);
      if (mode !== 'edit') setForm((f) => ({ ...f, email: '', password: '', last_name: '', first_name: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const steps = [
    { num: 1, title: 'Account', icon: '🔐' },
    { num: 2, title: 'Personal', icon: '👤' },
    { num: 3, title: 'Address', icon: '🏠' },
    { num: 4, title: 'Contact', icon: '📞' },
    { num: 5, title: 'Vehicle', icon: '🚗' },
  ];

  return (
    <form className="space-y-6" onSubmit={submit}>
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-700 pb-4">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {mode === 'edit' ? 'Edit Account' : 'Create New Account'}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
          {mode === 'edit' ? 'Update account information' : 'Fill in the details to create a new user account'}
        </p>
      </div>

      {/* Stepper */}
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative flex-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.num)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all ${
                    currentStep === step.num
                      ? 'bg-brand-600 text-white shadow-lg scale-110'
                      : currentStep > step.num
                      ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400 dark:text-neutral-500'
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.icon}
                </button>
                <span className={`text-xs font-medium mt-2 ${
                  currentStep === step.num
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 -mt-6 transition-colors ${
                  currentStep > step.num
                    ? 'bg-brand-600'
                    : 'bg-neutral-200 dark:bg-neutral-700'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">
        {/* Step 1: Account */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input 
                  className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => update('email', e.target.value)} 
                  required 
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password {mode === 'edit' && <span className="text-xs text-neutral-500">(leave blank to keep)</span>} {mode !== 'edit' && <span className="text-red-500">*</span>}
                </label>
                <input 
                  className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                  type="password" 
                  value={form.password || ''} 
                  onChange={(e) => update('password', e.target.value)} 
                  required={mode !== 'edit'} 
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" 
                  value={form.role} 
                  onChange={(e) => update('role', e.target.value)}
                >
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Personal */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Last name</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.last_name} onChange={(e)=>update('last_name', e.target.value)} placeholder="Dela Cruz" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">First name</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.first_name} onChange={(e)=>update('first_name', e.target.value)} placeholder="Juan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Middle name</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.middle_name} onChange={(e)=>update('middle_name', e.target.value)} placeholder="Santos" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Name extension</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.name_extension} onChange={(e)=>update('name_extension', e.target.value)} placeholder="Jr., Sr., III" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Birthdate</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" type="date" value={form.birthdate ? String(form.birthdate).substring(0,10) : ''} onChange={(e)=>update('birthdate', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Sex</label>
                <select className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.sex} onChange={(e)=>update('sex', e.target.value)}>
                  <option value="">Select...</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Nationality</label>
                <select className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.nationality} onChange={(e)=>update('nationality', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Filipino">Filipino</option>
                  <option value="American">American</option>
                  <option value="Chinese">Chinese</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Korean">Korean</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Civil status</label>
                <select className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.civil_status} onChange={(e)=>update('civil_status', e.target.value)}>
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Separated">Separated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Weight (kg)</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" type="number" step="0.1" value={form.weight} onChange={(e)=>update('weight', e.target.value)} placeholder="70" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Height (cm)</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" type="number" step="0.1" value={form.height} onChange={(e)=>update('height', e.target.value)} placeholder="170" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Blood type</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.blood_type} onChange={(e)=>update('blood_type', e.target.value)} placeholder="O+" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Eye color</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.eye_color} onChange={(e)=>update('eye_color', e.target.value)} placeholder="Brown" />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Address */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">House No.</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.address_house_no} onChange={(e)=>update('address_house_no', e.target.value)} placeholder="123" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Street</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.address_street} onChange={(e)=>update('address_street', e.target.value)} placeholder="Main Street" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Barangay</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.address_barangay} onChange={(e)=>update('address_barangay', e.target.value)} placeholder="Barangay 1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">City/Municipality</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.address_city_municipality} onChange={(e)=>update('address_city_municipality', e.target.value)} placeholder="Quezon City" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Province</label>
                <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.address_province} onChange={(e)=>update('address_province', e.target.value)} placeholder="Metro Manila" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Contact */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Telephone</label>
                  <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.telephone_number} onChange={(e)=>update('telephone_number', e.target.value)} placeholder="(02) 1234-5678" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Cellphone</label>
                  <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.cellphone_number} onChange={(e)=>update('cellphone_number', e.target.value)} placeholder="+63 912 345 6789" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
                  <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" type="email" value={form.email_address} onChange={(e)=>update('email_address', e.target.value)} placeholder="contact@example.com" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Emergency Contact</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Name</label>
                  <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.emergency_contact_name} onChange={(e)=>update('emergency_contact_name', e.target.value)} placeholder="Maria Dela Cruz" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Relationship</label>
                  <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.emergency_contact_relationship} onChange={(e)=>update('emergency_contact_relationship', e.target.value)} placeholder="Mother" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Contact Number</label>
                  <input className="w-full px-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent" value={form.emergency_contact_number} onChange={(e)=>update('emergency_contact_number', e.target.value)} placeholder="+63 912 345 6789" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Vehicle Categories */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Vehicle Classification</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {form.role === 'USER' 
                  ? 'Select the vehicle category for this student\'s training'
                  : 'Optionally select a vehicle category (not required for administrators)'
                }
              </p>
              
              {/* Vehicle Category Selection */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VEHICLE_CATEGORIES.map((vehicle) => {
                  const isSelected = form.student_type === vehicle.code;
                  
                  return (
                    <button
                      key={vehicle.code}
                      type="button"
                      onClick={() => {
                        // Toggle selection - if already selected, deselect it
                        update('student_type', isSelected ? '' : vehicle.code);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20 shadow-lg ring-2 ring-brand-500'
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-brand-300 dark:hover:border-brand-600 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{vehicle.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-brand-600 text-white'
                                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                            }`}>
                              {vehicle.code}
                            </span>
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {vehicle.name}
                            </h4>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            {vehicle.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="text-brand-600 dark:text-brand-400">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selection Summary */}
              {form.student_type && (
                <div className="mt-6 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {VEHICLE_CATEGORIES.find(v => v.code === form.student_type)?.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-brand-900 dark:text-brand-100 font-semibold">
                        Selected: {VEHICLE_CATEGORIES.find(v => v.code === form.student_type)?.name}
                      </p>
                      <p className="text-xs text-brand-700 dark:text-brand-300">
                        Category {form.student_type} - {VEHICLE_CATEGORIES.find(v => v.code === form.student_type)?.description}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600 text-white rounded-full text-sm font-medium">
                      ✓ Selected
                    </span>
                  </div>
                </div>
              )}

              {/* Warning for USER without selection */}
              {form.role === 'USER' && !form.student_type && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                        Vehicle category required
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Please select a vehicle category for this student account.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <div className="flex gap-3">
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors"
            >
              Next →
            </button>
          ) : (
            <button 
              type="submit" 
              disabled={busy || (form.role === 'USER' && !form.student_type)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={form.role === 'USER' && !form.student_type ? 'Please select a primary vehicle category' : ''}
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'edit' ? 'Saving…' : 'Creating…'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'edit' ? '✓ Save Changes' : '✓ Create Account'}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
