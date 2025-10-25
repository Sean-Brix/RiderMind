import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AccountForm from '../components/AccountForm.jsx';

export default function EditAccount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`/api/account/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load user');
        setData(json.user);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Edit Account</h2>
        <p className="text-sm text-neutral-500">Update user details.</p>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="card">
        {data ? (
          <AccountForm mode="edit" initialValues={data} onSuccess={() => navigate('/admin/accounts')} />
        ) : (
          <div>Loading…</div>
        )}
      </div>
    </div>
  );
}
