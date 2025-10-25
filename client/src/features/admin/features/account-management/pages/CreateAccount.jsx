import AccountForm from '../components/AccountForm.jsx';

export default function CreateAccount() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Create Account</h2>
        <p className="text-sm text-neutral-500">Only admins can create accounts.</p>
      </div>
      <div className="card max-w-xl">
        <AccountForm onSuccess={() => {}} />
      </div>
    </div>
  );
}
