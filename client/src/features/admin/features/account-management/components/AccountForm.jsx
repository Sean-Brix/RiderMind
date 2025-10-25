import { useState } from 'react';

export default function AccountForm({ onSuccess }) {
  const [form, setForm] = useState({ email: '', name: '', password: '', role: 'USER' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');
      onSuccess?.(data.user);
      setForm({ email: '', name: '', password: '', role: 'USER' });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <label className="block text-sm mb-1">Name</label>
        <input className="input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Email</label>
        <input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Password</label>
        <input className="input" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
      </div>
      <div>
        <label className="block text-sm mb-1">Role</label>
        <select className="input" value={form.role} onChange={(e) => update('role', e.target.value)}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>
      <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create Account'}</button>
    </form>
  );
}
