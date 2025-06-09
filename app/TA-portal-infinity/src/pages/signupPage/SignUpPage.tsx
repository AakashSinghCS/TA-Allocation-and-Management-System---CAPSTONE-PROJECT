import React, { useState } from 'react';
import bgImage from '../../assets/ubc_image.png?url';
import Navbar from '../../components/layout/login_navbar/Navbar';
import { useNavigate } from 'react-router-dom';
import gradCap from '../../assets/grad-cap-blue.png';

const SignUpPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const navigate = useNavigate();

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    console.log('Signup attempted with:', {
      fullName,
      email,
      phoneNumber,
      role,
      password,
      confirmPassword,
    });
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <img src={bgImage} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white" style={{ opacity: 0.5 }} />
      </div>

      <Navbar />
     <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 mb-10">
  <div className="w-full max-w-md bg-white bg-opacity-90 p-6 sm:p-8 rounded-2xl shadow-lg">
    <div className="text-center mb-4">
      <img
        src={gradCap}
        alt="TA Portal Logo"
        className="w-50 h-35 mx-auto mb-1"
      />
      <h2 className="text-xl font-bold text-[#040941]">TA Portal</h2>
      <p className="text-sm text-gray-600">Efficient TA Allocation Made Easy</p>
    </div>

    <h3 className="text-md font-semibold text-center mb-4">Create an Account</h3>

    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <label className="text-sm block mb-1">Full Name*</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full border border-gray-400 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Email*</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          className="w-full border border-gray-400 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Phone Number*</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          pattern="[0-9]{10,15}"
          className="w-full border border-gray-400 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Role*</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
          className="w-full border border-gray-400 rounded px-3 py-2"
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="coordinator">TA Coordinator</option>
        </select>
      </div>

      <div>
        <label className="text-sm block mb-1">Password*</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          pattern="^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-\[\]{}|;:',.<>?]).{8,}$"
          className="w-full border border-gray-400 rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Confirm Password*</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border border-gray-400 rounded px-3 py-2"
        />
        {confirmPassword && confirmPassword !== password && (
          <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
        )}
      </div>

      <p className="text-sm text-left text-gray-900 mt-2">
        Already have an account?{" "}
        <a href="/login" className="text-base text-[#000000] hover:opacity-70 transition-opacity">
          Login Here
        </a>
      </p>

      <button
        type="submit"
        className="w-full bg-[#040941] text-white py-2 rounded hover:bg-[#030735] transition-colors"
      >
        Signup
      </button>
    </form>
  </div>
</main>

      
    </div>
  );
};

export default SignUpPage;
