/**
 * ContactCard - Sticky sidebar card for contact information
 * Shows primary contact details and quick action buttons
 */
export default function ContactCard({ phone, email, alternateEmail, actions = [], className = '' }) {
  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 p-6 ${className}`}>
      {/* Card header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
          Contact
        </h2>
      </div>

      {/* Contact details */}
      <div className="space-y-4">
        {/* Phone */}
        {phone && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="flex text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-0.5">
                Phone
              </p>
              <p className="flex text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {phone}
              </p>
            </div>
          </div>
        )}

        {/* Primary Email */}
        {email && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="flex text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-0.5">
                Email
              </p>
              <p className="flex text-sm font-medium text-neutral-900 dark:text-neutral-100 break-all">
                {email}
              </p>
            </div>
          </div>
        )}

        {/* Alternate Email */}
        {alternateEmail && alternateEmail !== email && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-0.5">
                Alternate Email
              </p>
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 break-all">
                {alternateEmail}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {actions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              aria-label={action.label}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
