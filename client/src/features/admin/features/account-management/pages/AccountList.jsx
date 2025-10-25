import { useEffect, useState } from 'react';
import AccountTable from '../components/AccountTable.jsx';
import AccountForm from '../components/AccountForm.jsx';
import Modal from '../../../../../components/Modal.jsx';

export default function AccountList() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  function handleAccountCreated() {
    setShowCreateModal(false);
    fetchUsers(); // Refresh the list
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Account Management</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage user accounts and permissions.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Account
        </button>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="card">
        {loading ? <div>Loading…</div> : <AccountTable users={users} />}
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Account"
        size="xlarge"
      >
        <AccountForm mode="create" onSuccess={handleAccountCreated} />
      </Modal>
    </div>
  );
}
