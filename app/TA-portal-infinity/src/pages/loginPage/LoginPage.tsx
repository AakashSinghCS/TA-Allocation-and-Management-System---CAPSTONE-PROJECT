import React, { useState } from 'react';
import bgImage from '../../assets/ubc_image.png?url';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempted with:', { username, password });
  };

  return (
          <div className="min-h-screen relative">
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <img src={bgImage} alt="Background" className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-white" style={{ opacity: 0.5 }} />
      </div>

      {/* Header Navigation */}
      <header className="relative z-10 flex items-center justify-between p-4 flex-wrap gap-y-2">
        <div className="flex gap-2 flex-wrap">
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
            Home
          </button>
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
            About
          </button>
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
            Contact
          </button>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 bg-[#040941] text-white rounded hover:bg-[#030735] transition-colors">
            Sign Up
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="flex flex-col items-center w-full px-4 sm:px-0 max-w-2xl mx-auto">
          {/* Heading Block */}
          <div className="text-center mb-15 -mt-15">
            <h1 className="text-4xl sm:text-4xl font-extrabold text-[#040941] leading-tight">
              Welcome to TA Allocation &
            </h1>
            <h1 className="text-4xl sm:text-4xl font-extrabold text-[#040941] leading-tight">
              Management System
            </h1>
          </div>

          {/* Login Form Block */}
          <div className="w-full max-w-md bg-opacity bg-opacity-90 p-8 rounded shadow">
            <p className="text-2xl text-gray-900 mt-3 mb-5 text-center">
              Please log in to continue
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-base font-medium text-gray-900 mb-2">
                  Username/Email
                </label>
                <input id="username" type="text"value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] bg-white" placeholder="Enter your username or email" required />
              </div>
              <div>
                <label htmlFor="password" className="block text-base font-medium text-gray-900 mb-2"> Password </label>
                <input id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#040941] focus:border-[#040941] bg-white" placeholder="Enter your password" required
                />
              </div>
              <div className="text-right">
                <a href="#" className="text-base text-[#040941] hover:opacity-70 transition-opacity" style={{ color: "#000000" }}>
                  Forgot password?
                </a>
              </div>
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
