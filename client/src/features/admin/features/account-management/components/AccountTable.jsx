import { Link } from 'react-router-dom';

export default function AccountTable({ users = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50 bg-white dark:bg-neutral-800">
          {users.map((u) => {
            const displayName = u.displayName || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email;
            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const createdDate = new Date(u.createdAt);
            
            return (
              <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                {/* User Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {displayName}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        ID: {u.id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">{u.email}</div>
                  {u.cellphone_number && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{u.cellphone_number}</div>
                  )}
                </td>

                {/* Role */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {u.role === 'ADMIN' ? (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                    {u.role}
                  </span>
                </td>

                {/* Created */}
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">
                    {createdDate.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <Link 
                    to={`/admin/accounts/${u.id}/edit`} 
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
