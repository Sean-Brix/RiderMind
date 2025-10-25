import { useState } from 'react';

export default function AccountForm({ mode = 'create', initialValues, onSuccess }) {
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
    vehicle_categories: [],
    ...(initialValues || {}),
  }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const payload = { ...form, vehicle_categories: form.vehicle_categories };
      
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

  const vehicleOptions = ['A','A1','B','B1','B2','C','D','BE','CE'];

  return (
    <form className="space-y-6" onSubmit={submit}>
      {error && <div className="text-sm text-red-600">{error}</div>}
      {/* Auth */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Password {mode === 'edit' && <span className="text-xs text-neutral-500">(leave blank to keep)</span>}</label>
          <input className="input" type="password" value={form.password || ''} onChange={(e) => update('password', e.target.value)} required={mode !== 'edit'} />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select className="input" value={form.role} onChange={(e) => update('role', e.target.value)}>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      {/* Personal */}
      <div>
        <h3 className="font-semibold mb-2">Personal Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm mb-1">Last name</label><input className="input" value={form.last_name} onChange={(e)=>update('last_name', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">First name</label><input className="input" value={form.first_name} onChange={(e)=>update('first_name', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Middle name</label><input className="input" value={form.middle_name} onChange={(e)=>update('middle_name', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Name extension</label><input className="input" value={form.name_extension} onChange={(e)=>update('name_extension', e.target.value)} placeholder="Jr., Sr., III" /></div>
          <div><label className="block text-sm mb-1">Birthdate</label><input className="input" type="date" value={form.birthdate ? String(form.birthdate).substring(0,10) : ''} onChange={(e)=>update('birthdate', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Sex</label><select className="input" value={form.sex} onChange={(e)=>update('sex', e.target.value)}><option value=""></option><option>Male</option><option>Female</option></select></div>
          <div>
            <label className="block text-sm mb-1">Nationality</label>
            <select className="input" value={form.nationality} onChange={(e)=>update('nationality', e.target.value)}>
              <option value=""></option>
              <option value="Filipino">Filipino</option>
              <option value="American">American</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Korean">Korean</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Civil status</label>
            <select className="input" value={form.civil_status} onChange={(e)=>update('civil_status', e.target.value)}>
              <option value=""></option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widowed">Widowed</option>
              <option value="Divorced">Divorced</option>
              <option value="Separated">Separated</option>
            </select>
          </div>
          <div><label className="block text-sm mb-1">Weight (kg)</label><input className="input" type="number" step="0.1" value={form.weight} onChange={(e)=>update('weight', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Height (cm)</label><input className="input" type="number" step="0.1" value={form.height} onChange={(e)=>update('height', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Blood type</label><input className="input" value={form.blood_type} onChange={(e)=>update('blood_type', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Eye color</label><input className="input" value={form.eye_color} onChange={(e)=>update('eye_color', e.target.value)} /></div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="font-semibold mb-2">Address</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm mb-1">House No</label><input className="input" value={form.address_house_no} onChange={(e)=>update('address_house_no', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Street</label><input className="input" value={form.address_street} onChange={(e)=>update('address_street', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Barangay</label><input className="input" value={form.address_barangay} onChange={(e)=>update('address_barangay', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">City/Municipality</label><input className="input" value={form.address_city_municipality} onChange={(e)=>update('address_city_municipality', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Province</label><input className="input" value={form.address_province} onChange={(e)=>update('address_province', e.target.value)} /></div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="font-semibold mb-2">Contact Information</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm mb-1">Telephone</label><input className="input" value={form.telephone_number} onChange={(e)=>update('telephone_number', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Cellphone</label><input className="input" value={form.cellphone_number} onChange={(e)=>update('cellphone_number', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Email Address</label><input className="input" type="email" value={form.email_address} onChange={(e)=>update('email_address', e.target.value)} /></div>
        </div>
      </div>

      {/* Emergency */}
      <div>
        <h3 className="font-semibold mb-2">Emergency Contact</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div><label className="block text-sm mb-1">Name</label><input className="input" value={form.emergency_contact_name} onChange={(e)=>update('emergency_contact_name', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Relationship</label><input className="input" value={form.emergency_contact_relationship} onChange={(e)=>update('emergency_contact_relationship', e.target.value)} /></div>
          <div><label className="block text-sm mb-1">Contact Number</label><input className="input" value={form.emergency_contact_number} onChange={(e)=>update('emergency_contact_number', e.target.value)} /></div>
        </div>
      </div>

      {/* Vehicle categories */}
      <div>
        <h3 className="font-semibold mb-2">Vehicle Categories</h3>
        <div className="flex flex-wrap gap-3">
          {vehicleOptions.map((v) => (
            <label key={v} className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="rounded" checked={form.vehicle_categories?.includes(v)} onChange={(e) => {
                const has = form.vehicle_categories?.includes(v);
                const next = has ? form.vehicle_categories.filter((x) => x !== v) : [...(form.vehicle_categories||[]), v];
                update('vehicle_categories', next);
              }} /> {v}
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? (mode === 'edit' ? 'Saving…' : 'Creating…') : (mode === 'edit' ? 'Save Changes' : 'Create Account')}</button>
    </form>
  );
}
