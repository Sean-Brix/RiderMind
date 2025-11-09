/**
 * AvatarCard - Compact avatar display with name and email
 * Overlaps the header banner for modern profile design
 */
export default function AvatarCard({ name, avatarUrl, role, email, className = '' }) {
  // Get initials from name
  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Avatar - circular with gradient background */}
      <div className="relative">
        <div className="flex w-24 h-24 rounded-full bg-white dark:bg-neutral-900 p-1 shadow-lg">
          {avatarUrl ? (
            <img 
              src={avatarUrl} 
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold">
              {getInitials(name)}
            </div>
          )}
        </div>
        {/* Online indicator */}
        <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-neutral-900 rounded-full"></div>
      </div>

      {/* Name and details */}
      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
          {name}
        </h1>
        {role && (
          <p className="flex text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {role}
          </p>
        )}
      </div>
    </div>
  );
}
