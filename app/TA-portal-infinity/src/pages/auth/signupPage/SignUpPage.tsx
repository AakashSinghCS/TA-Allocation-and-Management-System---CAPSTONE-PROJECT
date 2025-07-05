import Navbar from '../../../components/layout/login_navbar/Navbar';
import bgImage from '../../assets/ubc_image.png?url';
import gradCap from '../../assets/grad-cap-blue.png';
import { useNavigate } from 'react-router-dom';
import CreateUserForm, { type UserFormData } from '../../../components/features/user/createuserform/CreateUserForm';

export default function SignUpPage() {
    const navigate = useNavigate();

    async function handleSignUp(data: UserFormData) {

        const response = await fetch('http://localhost:8080/auth/register', {
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

        if (!response.ok) {
            const text = await response.text();
            if (text.includes('An account with this email already exists')) {
                throw new Error('Email already exists. Please use a different email.');
            } else {
                throw new Error('Signup failed. Check the form or try again.');
            }
        }
    }

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 z-0">
                <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-white opacity-50" />
            </div>

            <Navbar />
            <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 mb-10">
                <div className="w-full max-w-2xl bg-white bg-opacity-90 p-6 sm:p-8 rounded-2xl shadow-lg">
                    <div className="text-center mb-1">
                        <img src={gradCap} alt="TA Portal Logo" className="w-50 h-35 mx-auto mb-0" />
                        <p className="-mt-8 mb-8 text-gray-600">Efficient TA Allocation Made Easy</p>
                    </div>

                    <h3 className="text-md font-semibold text-center mb-4">Create an Account</h3>
                    <CreateUserForm
                        onSubmit={handleSignUp}
                        onSuccess={() => setTimeout(() => navigate('/login'), 1500)}
                        showLoginLink={true}
                        successMessage="Signup successful! Redirecting to login…"
                    />
                </div>
            </main>
        </div>
    );
}
