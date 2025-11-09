/**
 * InfoCard - Displays labeled information in a clean grid layout
 * Supports multiple sections with icons and edit mode
 */
export default function InfoCard({ sections, isEditing, profile, update, className = '' }) {
  // Icon mapping using inline SVG (Heroicons style)
  const icons = {
    user: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    location: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  };

  // Field name mapping for edit mode
  const fieldMap = {
    'First Name': 'first_name',
    'Middle Name': 'middle_name',
    'Last Name': 'last_name',
    'Extension': 'name_extension',
    'Birthdate': 'birthdate',
    'Sex': 'sex',
    'Nationality': 'nationality',
    'Civil Status': 'civil_status',
    'House No.': 'address_house_no',
    'Street': 'address_street',
    'Barangay': 'address_barangay',
    'City': 'address_city_municipality',
    'Province': 'address_province'
  };

  const renderField = (row) => {
    const fieldName = fieldMap[row.label];
    
    if (!isEditing || !fieldName) {
      return <dd className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{row.value || '—'}</dd>;
    }

    // Render appropriate input based on field type
    if (fieldName === 'birthdate') {
      return (
        <input 
          type="date" 
          value={profile[fieldName] ? String(profile[fieldName]).substring(0, 10) : ''} 
          onChange={(e) => update(fieldName, e.target.value)} 
          className="input w-full text-sm" 
        />
      );
    } else if (fieldName === 'sex') {
      return (
        <select 
          value={profile[fieldName] || ''} 
          onChange={(e) => update(fieldName, e.target.value)} 
          className="input w-full text-sm"
        >
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      );
    } else if (fieldName === 'nationality') {
      return (
        <select 
          value={profile[fieldName] || ''} 
          onChange={(e) => update(fieldName, e.target.value)} 
          className="input w-full text-sm"
        >
          <option value="">Select</option>
          <option value="Filipino">Filipino</option>
          <option value="American">American</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Korean">Korean</option>
          <option value="Other">Other</option>
        </select>
      );
    } else if (fieldName === 'civil_status') {
      return (
        <select 
          value={profile[fieldName] || ''} 
          onChange={(e) => update(fieldName, e.target.value)} 
          className="input w-full text-sm"
        >
          <option value="">Select</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Divorced">Divorced</option>
          <option value="Separated">Separated</option>
        </select>
      );
    } else {
      return (
        <input 
          type="text" 
          value={profile[fieldName] || ''} 
          onChange={(e) => update(fieldName, e.target.value)} 
          className="input w-full text-sm"
          placeholder={row.label}
        />
      );
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((section, idx) => (
        <div 
          key={idx}
          className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-6"
        >
          {/* Section header with icon */}
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="text-blue-600 dark:text-blue-400">
              {icons[section.icon] || icons.user}
            </div>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {section.title}
            </h2>
          </div>

          {/* Two-column grid for compact info display */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {section.rows.map((row, rowIdx) => (
              <div key={rowIdx} className="flex flex-col">
                <dt className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">
                  {row.label}
                </dt>
                {renderField(row)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
