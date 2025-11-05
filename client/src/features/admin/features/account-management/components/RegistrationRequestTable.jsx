import { formatDistanceToNow } from 'date-fns';

export default function RegistrationRequestTable({ requests, onViewDetails }) {
  function getStatusBadge(status) {
    const styles = {
      PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      APPROVED: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
      REJECTED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          status === 'PENDING' ? 'bg-yellow-500' :
          status === 'APPROVED' ? 'bg-green-500' :
          'bg-red-500'
        }`}></span>
        {status}
      </span>
    );
  }

  function getStudentTypeBadge(type) {
    if (!type) return <span className="text-neutral-400">—</span>;
    
    const labels = {
      A: 'Motorcycle',
      A1: 'Light Motorcycle',
      B: 'Car',
      B1: 'Tricycle',
      B2: 'Heavy Vehicle',
      C: 'Light Truck',
      D: 'Heavy Truck',
      BE: 'Articulated',
      CE: 'Trailer Truck'
    };

    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800">
        {labels[type] || type}
      </span>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
        <div className="px-6 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">No registration requests</h3>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            No registration requests match your current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
        <thead className="bg-neutral-50 dark:bg-neutral-800/50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Applicant
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700/50 bg-white dark:bg-neutral-800">
          {requests.map((request) => {
            // Build full name properly - name_extension might contain full name, so check if it's actually an extension
            const nameExtension = request.name_extension;
            const isActualExtension = nameExtension && ['Jr.', 'Sr.', 'II', 'III', 'IV', 'V'].some(ext => 
              nameExtension.toUpperCase().includes(ext.toUpperCase())
            );
            
            const fullName = [
              request.first_name, 
              request.middle_name, 
              request.last_name,
              isActualExtension ? nameExtension : null
            ]
              .filter(Boolean)
              .join(' ') || 'No name provided';

            return (
              <tr 
                key={request.id}
                className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      #{String(request.id).padStart(3, '0')}
                    </span>
                    {request.status === 'PENDING' && (
                      <span className="flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-yellow-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                      {(request.first_name?.[0] || request.email?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {fullName}
                      </div>
                      {request.sex && (
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {request.sex} {request.birthdate && `• Born ${new Date(request.birthdate).getFullYear()}`}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-neutral-900 dark:text-neutral-100">{request.email}</div>
                  {request.cellphone_number && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{request.cellphone_number}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetails(request)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 hover:bg-brand-100 dark:hover:bg-brand-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
