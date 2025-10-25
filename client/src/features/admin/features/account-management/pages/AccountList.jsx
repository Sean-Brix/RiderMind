import { useEffect, useState } from 'react';
import AccountTable from '../components/AccountTable.jsx';

export default function AccountList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function fetchUsers() {
    try {
      setError('');
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account/list', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Accounts</h2>
          <p className="text-sm text-neutral-500">List of all user accounts.</p>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="card">
        {loading ? <div>Loading…</div> : <AccountTable users={users} />}
      </div>
    </div>
  );
}
