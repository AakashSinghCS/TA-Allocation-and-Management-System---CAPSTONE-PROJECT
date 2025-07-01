import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import bgImage from '../../assets/ubc_image.png?url';
import Navbar from '../../components/layout/login_navbar/Navbar';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get the reset token from URL
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    if (token) {
      setToken(token);
    } else {
      setFormError('Invalid reset token.');
    }
  }, [location]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("Error resetting password:", error);
        setFormError("Failed to reset password. Please try again.");
        return;
      }

      setSuccessMessage("Your password has been successfully reset.");
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      console.error("Reset password error:", err);
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
              Reset Your Password
            </h1>
          </div>

          <div className="w-full max-w-md bg-white bg-opacity-90 p-8 rounded shadow rounded-2xl">
            <p className="text-2xl text-gray-900 mt-0 mb-11 text-center">
              Please enter your new password
            </p>
            <form onSubmit={handleResetPassword} className="space-y-6">
              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-base font-medium text-gray-900 mb-2"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] bg-white"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-base font-medium text-gray-900 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] bg-white"
                />
              </div>

              {passwordError && (
                <p className="text-sm text-red-600 mt-1">
                  {passwordError}
                </p>
              )}

              {formError && (
                <div className="flex items-center space-x-2 border-l-4 border-red-500 bg-red-100 p-3 rounded-md mt-2 animate-fadeIn">
                  <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{formError}</span>
                </div>
              )}

              {successMessage && (
                <div className="flex items-center space-x-2 border-l-4 border-green-500 bg-green-100 p-3 rounded-md mt-2 animate-fadeIn">
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{successMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#040941] text-white py-3 px-4 rounded-md hover:bg-[#030735] focus:outline-none focus:ring-2 focus:ring-[#040941] focus:ring-offset-2 transition-colors font-medium"
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
