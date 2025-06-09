import React from 'react';

const Navbar: React.FC = () => {
  return (
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
  );
};

export default Navbar;
