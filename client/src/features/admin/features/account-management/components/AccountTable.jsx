import { Link } from 'react-router-dom';

export default function AccountTable({ users = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            {['ID','Name','Email','Role','Created','Actions'].map((h) => (
              <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-2 text-sm">{u.id}</td>
              <td className="px-4 py-2 text-sm">{u.displayName || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email}</td>
              <td className="px-4 py-2 text-sm">{u.email}</td>
              <td className="px-4 py-2 text-sm">
                <span className="inline-flex items-center rounded-full bg-brand-100 text-brand-800 px-2 py-0.5 text-xs font-medium dark:bg-neutral-800 dark:text-neutral-100">
                  {u.role}
                </span>
              </td>
              <td className="px-4 py-2 text-sm">{new Date(u.createdAt).toLocaleString()}</td>
              <td className="px-4 py-2 text-sm">
                <Link to={`/admin/accounts/${u.id}/edit`} className="btn btn-secondary !px-3 !py-1 text-xs">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
