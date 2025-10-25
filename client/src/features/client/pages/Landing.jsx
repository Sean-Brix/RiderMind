export default function Landing() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-brand-700">Landing</h2>
        <p className="text-neutral-600 dark:text-neutral-300">Welcome{user ? `, ${user.name}` : ''}.</p>
      </div>
    </div>
  );
}
