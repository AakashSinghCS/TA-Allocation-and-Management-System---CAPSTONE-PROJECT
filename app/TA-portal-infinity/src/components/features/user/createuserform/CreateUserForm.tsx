import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { validateUserFormData } from '../../../../utility/validation/user/validateUserFormData';
import type { UserRole } from '../../../../interfaces/enum/UserRole';

export interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole | "";
    password: string;
    confirmPassword: string;
}

interface UserFormProps {
    onSubmit: (data: UserFormData) => Promise<any>;
    showLoginLink?: boolean;
    onSuccess?: () => void;
    successMessage?: string;
}

const InputField = ({ label, name, type, value, onChange, error, showPassword, setShowPassword, ...rest }: any) => {
    const isPassword = name === 'password' || name === 'confirmPassword';
    return (
        <div className={isPassword ? "relative" : undefined}>
            <label htmlFor={name} className="text-sm block mb-1">{label}*</label>
            <div className={isPassword ? "relative flex items-center" : undefined}>
                <input
                    id={name}
                    type={isPassword && showPassword ? "text" : type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className={"w-full border border-gray-400 rounded px-3 py-2" + (isPassword ? " pr-10" : "")}
                    required
                    {...rest}
                />
                {isPassword && value && setShowPassword && (
                    <button
                        type="button"
                        aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                        onClick={() => setShowPassword((prev: boolean) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#040941] focus:outline-none"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    );
};

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
        role: "",
        password: '',
        confirmPassword: '',
    });
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormError(null);
        setFormSuccess(null);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // if (!validate()) return;
        console.log(formData);
        const { ok, sanitized, fieldErrors } = validateUserFormData(formData);
            if (!ok) {
            setFieldErrors(fieldErrors);
            setFormError("Please correct the highlighted fields.");
            return;
        }
        setFieldErrors({});
        setFormError(null);
        setSubmitting(true);
        try {
            await onSubmit({...formData, ...sanitized});
            setFormSuccess(successMessage);
            if (onSuccess) onSuccess();
            setFormData({         
                firstName: "",
                lastName: "",
                email: "",
                role: "",
                password: "",
                confirmPassword: "",
            });
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
              error={fieldErrors.firstName}
            />
            <InputField
              label="Last Name"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              error={fieldErrors.lastName}
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
              error={fieldErrors.email}
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
                <option value="" >Select Role</option>
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="COORDINATOR">TA Coordinator</option>
              </select>
              {fieldErrors.role && (
                <p className="text-red-600 text-sm">{fieldErrors.role}</p>
                 )}
            </div>
            
            <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                pattern="^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-\\[\\]{}|;:',.<>?]).{8,}$"
                error={fieldErrors.password}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
            <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={fieldErrors.confirmPassword}
                showPassword={showConfirmPassword}
                setShowPassword={setShowConfirmPassword}
            />

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
