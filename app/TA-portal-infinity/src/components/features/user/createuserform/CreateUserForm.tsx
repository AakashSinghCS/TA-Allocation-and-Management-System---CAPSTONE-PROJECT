// src/components/user/UserForm.tsx
import React, { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    role: string[];
    password: string;
    confirmPassword: string;
}

interface UserFormProps {
    onSubmit: (data: UserFormData) => Promise<any>;
    showLoginLink?: boolean;
    onSuccess?: () => void;
    successMessage?: string;
}

const InputField = ({ label, name, type, value, onChange, ...rest }: any) => (
    <div>
        <label htmlFor={name} className="text-sm block mb-1">{label}*</label>
        <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full border border-gray-400 rounded px-3 py-2"
            required
            {...rest}
        />
    </div>
);

export default function CreateUserForm({
    onSubmit,
    showLoginLink = true,
    onSuccess,
    successMessage = 'Success!'
}: UserFormProps) {
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        email: '',
        role: [],
        password: '',
        confirmPassword: '',
    });
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setConfirmPasswordError('');
        setFormError(null);
        setFormSuccess(null);
    }

    function validate() {
        if (formData.password !== formData.confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return false;
        }
        return true;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            console.log(formData);
            await onSubmit(formData);
            setFormSuccess(successMessage);
            if (onSuccess) onSuccess();
        } catch (err: any) {
            console.error('Signup error:', err);
            setFormError(err?.message || 'Server error. Please try again later.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="First Name"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
            />

            <InputField
              label="Last Name"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            />

            <div>
              <label htmlFor="role" className="text-sm block mb-1">Role*</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full border border-gray-400 rounded px-3 py-2"
              >
                <option value="">Select Role</option>
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="COORDINATOR">TA Coordinator</option>
              </select>
            </div>

            <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                pattern="^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-\\[\\]{}|;:',.<>?]).{8,}$"
            />

            <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
            />
            {confirmPasswordError && (<p className="text-sm text-red-600 mt-1">{confirmPasswordError}</p>)}

            {formError && (
                <div className="flex items-center space-x-2 border-l-4 border-red-500 bg-red-100 p-3 rounded-md mt-2 animate-fadeIn">
                    <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                    <span className="text-red-700 text-sm">{formError}</span>
                </div>
            )}

            {formSuccess && (
                <div className="flex items-center space-x-2 border-l-4 border-green-500 bg-green-100 p-3 rounded-md mt-2 animate-fadeIn">
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                    <span className="text-green-700 text-sm">{formSuccess}</span>
                </div>
            )}

            {showLoginLink && (
                <p className="text-base text-left text-black mt-2">
                    Already have an account?{' '}
                    <a
                        href="/login"
                        className="text-sm text-[#040491] hover:opacity-50 transition-opacity"
                        style={{ color: "#040941" }}
                    >
                        Login Here
                    </a>
                </p>
            )}

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#040941] text-white py-2 rounded hover:bg-[#040491] transition-colors"
            >
                {showLoginLink ? 'Sign Up' : 'Submit'}
            </button>
            {submitting ? 'Submitting...' : ''}
        </form>
    );
}
