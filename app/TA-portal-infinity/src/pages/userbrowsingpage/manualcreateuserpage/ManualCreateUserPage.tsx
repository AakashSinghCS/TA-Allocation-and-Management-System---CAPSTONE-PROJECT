import { useNavigate } from 'react-router-dom';
import CreateUserForm, { type UserFormData } from '../../../components/features/user/createuserform/CreateUserForm';

export default function ManualCreateUserPage() {
  const navigate = useNavigate();

  async function handleCreate(data: UserFormData) {
    const res = await fetch('http://localhost:8080/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        userType: data.role,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      if (text.includes('An account with this email already exists')) {
        throw new Error('Email already exists. Please use a different email.');
      } else {
        throw new Error('Signup failed. Check the form or try again.');
      }
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h3 className="text-xl font-semibold mb-4">Add New User</h3>
      <CreateUserForm
        onSubmit={handleCreate}
        onSuccess={() => setTimeout(() => navigate(-1), 500)}
        showLoginLink={false}
        successMessage="User Created!"
      />
      <button
        type="button"
        onClick={() => navigate(-1)}
        className=" w-full mt-2 py-2 rounded bg-transparent hover:bg-red-100 transition-colors">
        Cancel
      </button>
    </div>
  );
}