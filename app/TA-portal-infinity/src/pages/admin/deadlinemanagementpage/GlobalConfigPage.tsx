import React, { useState, useEffect } from "react";
import { LuCalendarCog } from "react-icons/lu";
import { useAuth } from '../../../context/AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchDeadlines, updateDeadline } from "../../../api/admin/FetchDeadline";
import type { DeadlineDto } from "../../../interfaces/admin/Deadline";
import { addSemester } from "../../../api/semester/addSemester";
import type { SemesterCreate } from "../../../interfaces/semester/Semester";

function formatDeadlineName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

const DeadlineManagementPage: React.FC = () => {
  const { token } = useAuth();
  // Term config hooks 
  const initialTermConfig = {
    year: new Date().getFullYear(),
    semester: "W1",
    startDate: "",
    endDate: ""
  };
  const [termConfig, setTermConfig] = useState(initialTermConfig);
  const [termLoading, setTermLoading] = useState(false);
  useEffect(() => {
    setTermConfig(initialTermConfig);
  }, []);
  const handleTermChange = (field: string, value: string) => {
    setTermConfig((prev) => ({ ...prev, [field]: value }));
  };
  // Client-side validation for term config dates
  const isValidTermDates = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate < endDate;
  };

  const handleSaveTerm = async () => {
    if (!termConfig.startDate || !termConfig.endDate) {
      toast.error("Both start and end dates must be specified.");
      return;
    }

    if (!isValidTermDates(termConfig.startDate, termConfig.endDate)) {
      toast.error("Start date must be before end date.");
      return;
    }
    setTermLoading(true);
    
    try {
      const semesterData: SemesterCreate = {
        year: parseInt(termConfig.year.toString()),
        semester: termConfig.semester as "W1" | "W2" | "S1" | "S2",
        startDate: termConfig.startDate,
        endDate: termConfig.endDate
      };
      
      const success = await addSemester(semesterData, token || "");
      
      if (success) {
        toast.success('Term configuration saved successfully!');
        // Reset form to initial state
        setTermConfig(initialTermConfig);
      } else {
        toast.error('Failed to save term configuration.');
      }
    } catch (error) {
      console.error("Error saving term:", error);
      toast.error('Error saving term configuration.');
    } finally {
      setTermLoading(false);
    }
  };
  // Deadlines state
  const [deadlines, setDeadlines] = useState<DeadlineDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load deadlines on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchDeadlines(token || "");
        setDeadlines(data);
      } catch (err) {
        setError("Failed to load deadlines.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  // Handle field changes
  const handleChange = (index: number, field: "startTime" | "endTime", value: string) => {
    const updated = [...deadlines];
    const newValue = value ? value + ":00" : "";
    console.log(`handleChange: index=${index}, field=${field}, value=${value}, newValue=${newValue}`);
    updated[index] = {
      ...updated[index],
      [field]: newValue
    } as DeadlineDto;
    setDeadlines(updated);
  };


  // Client-side validation for start and end time
  const isValidDeadline = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return startDate < endDate;
  };

  // Handle save click with validation
  const handleSave = async (deadline: DeadlineDto) => {
    const start = deadline.startTime.slice(0, 16);
    const end = deadline.endTime.slice(0, 16);

    if (!start || !end) {
      toast.error("Both start and end time must be specified.");
      return;
    }

    if (!isValidDeadline(start, end)) {
      toast.error("Start time must be before end time.");
      return;
    }
    try {
      await updateDeadline(deadline.name, deadline, token || "");
      const data = await fetchDeadlines(token || "");
      setDeadlines(data);
      toast.success('Deadline updated successfully!');
    } catch (err) {
      console.error("Failed to update deadline:", err);
      toast.error("Error updating deadline");
    }
  };

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

      {/* Global Term Config Section */}
      <div className="mb-8 sm:mb-10">
        <h2 className="text-lg sm:text-xl font-semibold text-[#040941] mb-3">Term Configuration</h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-row md:items-end gap-4">
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Year</label>
            <input
              type="number"
              min="2000"
              max="2100"
              value={termConfig.year}
              onChange={e => handleTermChange("year", e.target.value)}
              className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-28"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Semester</label>
            <select
              value={termConfig.semester}
              onChange={e => handleTermChange("semester", e.target.value)}
              className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-40"
            >
              <option value="W1">W1</option>
              <option value="W2">W2</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">Start Date</label>
            <input
              type="date"
              value={termConfig.startDate}
              onChange={e => handleTermChange("startDate", e.target.value)}
              className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-40"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-gray-600 mb-1">End Date</label>
            <input
              type="date"
              value={termConfig.endDate}
              onChange={e => handleTermChange("endDate", e.target.value)}
              className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-40"
            />
          </div>
          <button
            onClick={handleSaveTerm}
            disabled={termLoading}
            className="bg-[#040941] text-white px-4 py-2 rounded hover:opacity-90 text-sm font-semibold shadow mt-2 md:mt-0 disabled:opacity-60"
            aria-label="save-term"
          >
            {termLoading ? "Saving..." : "Save Term"}
          </button>
        </div>
      </div>

      <h2 className="text-lg sm:text-xl font-semibold text-[#040941] mb-3">Deadlines</h2>
      {loading && <p className="text-blue-600 text-center font-semibold animate-pulse">Loading...</p>}
      {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

      {!loading && deadlines.length === 0 && (
        <p className="text-gray-500 text-center">No deadlines found.</p>
      )}

      {!loading && deadlines.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-gray-300 text-[#040941] text-left">
                <th className="py-2 px-2 sm:px-3 rounded-l-lg font-semibold">Deadline Name</th>
                <th className="py-2 px-2 sm:px-3 font-semibold">Start Time</th>
                <th className="py-2 px-2 sm:px-3 font-semibold">End Time</th>
                <th className="py-2 px-2 sm:px-3 rounded-r-lg font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d, idx) => (
                <tr key={d.name} className="bg-white hover:bg-blue-50 transition-colors">
                  <td className="py-2 px-2 sm:px-3 text-[#040941] font-medium whitespace-nowrap align-middle">
                    {formatDeadlineName(d.name)}
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle">
                    <input
                      type="datetime-local"
                      value={d.startTime.slice(0, 16)}
                      onChange={(e) => handleChange(idx, "startTime", e.target.value)}
                      className="border border-blue-200 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-full min-w-[120px]"
                    />
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle">
                    <input
                      type="datetime-local"
                      value={d.endTime.slice(0, 16)}
                      onChange={(e) => handleChange(idx, "endTime", e.target.value)}
                      className="border border-blue-200 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-full min-w-[120px]"
                    />
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle text-center">
                    <button
                      onClick={() => handleSave(d)}
                      className="bg-[#040941] text-white px-3 sm:px-4 py-1 rounded hover:opacity-90 text-xs sm:text-sm font-semibold shadow w-full"
                      aria-label={`save-deadline-${d.name}`}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeadlineManagementPage;
