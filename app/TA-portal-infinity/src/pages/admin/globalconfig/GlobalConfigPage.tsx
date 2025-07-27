import React from "react";
import { LuCalendarCog } from "react-icons/lu";
import { useAuth } from '../../../context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TermConfiguration from '../../../components/features/globalconfig/TermConfiguration';
import DeadlineManagement from '../../../components/features/globalconfig/DeadlineManagement';

const GlobalConfigPage: React.FC = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen w-full max-w-6xl mx-auto flex flex-col py-4 px-2 sm:px-4 md:px-6 lg:px-0">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="flex flex-col md:flex-row items-center mb-8 gap-4 md:gap-6">
        <div className="w-full md:flex-1 min-w-0 flex flex-col items-start">
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-[#040941] mb-2 tracking-tight">Global Configuration</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-500 mb-4 md:mb-6">Manage term and deadline settings </p>
        </div>
        <div className="flex justify-center md:justify-end items-center w-full md:w-auto mb-4 md:mb-0">
          <LuCalendarCog size={72} color="#e5e7eb" title="Configuration" className="block" />
        </div>
      </div>

      {/* Term Configuration */}
      <TermConfiguration token={token || ""} />

      {/* Deadline Management */}
      <DeadlineManagement token={token || ""} />
    </div>
  );
};

export default GlobalConfigPage;
