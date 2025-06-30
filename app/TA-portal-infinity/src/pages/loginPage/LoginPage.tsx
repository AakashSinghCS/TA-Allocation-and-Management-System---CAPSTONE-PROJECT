import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../../assets/ubc_image.png?url';
import Navbar from '../../components/layout/login_navbar/Navbar';

import { useAuth, parseJwt } from '../../context/AuthContext';
import { UserRole } from '../../interfaces/enum/UserRole';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface RawJwt {
  sub: string;
  userId: number;
  roles: string[];  // raw roles from JWT
  iat: number;
  exp: number;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState('');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Login failed:", error);
        setFormError("Invalid email or password."); 
        return;
      }

      const { token } = await response.json();

      // store & normalize in context
      login({ token });

      // parse raw JWT to get the server‐sent roles
      const raw = parseJwt<RawJwt>(token);
      const strippedRoles = raw?.roles
        .map(r => r.replace(/^ROLE_/, '') as UserRole) 
        ?? [];

      setLoginMessage("Login successful! Redirecting...");

      setTimeout(() => {
        if (strippedRoles.includes(UserRole.STUDENT)) {
          navigate('/user/student/home', { replace: true });
        } else if (strippedRoles.includes(UserRole.INSTRUCTOR)) {
          navigate('/user/instructor/home', { replace: true });
        } else if (strippedRoles.includes(UserRole.COORDINATOR)) {
          navigate('/user/coordinator/home', { replace: true });
        } else {
          navigate('/user/error', { replace: true });
        }
      }, 1200);

    } catch (err) {
      console.error("Login error:", err);
      setFormError("Server error. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-white"
          style={{ opacity: 0.5 }}
        />
      </div>

      <Navbar />

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="flex flex-col items-center w-full px-4 sm:px-0 max-w-2xl mx-auto">
          <div className="text-center mb-15 -mt-15">
            <h1 className="text-4xl sm:text-4xl font-extrabold text-[#040941] leading-tight">
              Welcome to TA Allocation &
            </h1>
            <h1 className="text-4xl sm:text-4xl font-extrabold text-[#040941] leading-tight">
              Management System
            </h1>
          </div>

          <div className="w-full max-w-md bg-white bg-opacity-90 p-8 rounded shadow rounded-2xl">
            <p className="text-2xl text-gray-900 mt-0 mb-11 text-center">
              Please log in to continue
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-base font-medium text-gray-900 mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setEmailError('');
                    setFormError('');
                  }}
                  onInvalid={() =>
                    setEmailError('Please enter a valid email address')
                  }
                  onInput={() => setEmailError('')}
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] bg-white"
                />
                {emailError && (
                  <p className="text-sm text-red-600 mt-1">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-base font-medium text-gray-900 mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setFormError('');
                  }}
                  onInvalid={() =>
                    setPasswordError(
                      'Password must be at least 8 characters and include uppercase, number, and special character'
                    )
                  }
                  onInput={() => setPasswordError('')}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] bg-white"
                />
                {passwordError && (
                  <p className="text-sm text-red-600 mt-1">
                    {passwordError}
                  </p>
                )}
              </div>

             <div className="text-right">
                <a
                  href="#"
                  className="text-base text-[#040941] hover:opacity-70 transition-opacity"
                  style={{ color: "#040941" }}
                >
                  Forgot password?
                </a>
              </div>
             {formError && (
                <div className="flex items-center space-x-2 border-l-4 border-red-500 bg-red-100 p-3 rounded-md mt-2 animate-fadeIn">
                  <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{formError}</span>
                </div>
              )}

              {loginMessage && (
                <div className="flex items-center space-x-2 border-l-4 border-green-500 bg-green-100 p-3 rounded-md mt-2 animate-fadeIn">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{loginMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#040941] text-white py-3 px-4 rounded-md hover:bg-[#030735] focus:outline-none focus:ring-2 focus:ring-[#040941] focus:ring-offset-2 transition-colors font-medium"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
