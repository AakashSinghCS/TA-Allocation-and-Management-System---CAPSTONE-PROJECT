import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { fetchDeadlines, updateDeadline } from "../../../api/admin/FetchDeadline";
import type { DeadlineDto } from "../../../interfaces/admin/Deadline";

function formatDeadlineName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface DeadlineManagementProps {
  token: string;
}

const DeadlineManagement: React.FC<DeadlineManagementProps> = ({ token }) => {

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
    <div>
      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#040941] mb-2 sm:mb-3">Deadlines</h2>
      {loading && <p className="text-blue-600 text-center font-semibold animate-pulse text-sm">Loading...</p>}
      {error && <p className="text-red-500 text-center font-semibold text-sm">{error}</p>}

      {!loading && deadlines.length === 0 && (
        <p className="text-gray-500 text-center text-sm">No deadlines found.</p>
      )}

      {!loading && deadlines.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-300 text-[#040941] text-left">
                <th className="py-2 px-2 sm:px-3 rounded-l-lg font-semibold">Deadline Name</th>
                <th className="py-2 px-2 sm:px-3 font-semibold hidden sm:table-cell">Start Time</th>
                <th className="py-2 px-2 sm:px-3 font-semibold hidden sm:table-cell">End Time</th>
                <th className="py-2 px-2 sm:px-3 font-semibold sm:hidden">Times</th>
                <th className="py-2 px-2 sm:px-3 rounded-r-lg font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((d, idx) => (
                <tr key={d.name} className="bg-white hover:bg-blue-50 transition-colors">
                  <td className="py-2 px-2 sm:px-3 text-[#040941] font-medium align-middle">
                    <div className="break-words">{formatDeadlineName(d.name)}</div>
                  </td>
                  {/* Desktop view - separate columns for start and end */}
                  <td className="py-2 px-2 sm:px-3 align-middle hidden sm:table-cell">
                    <input
                      type="datetime-local"
                      value={d.startTime.slice(0, 16)}
                      onChange={(e) => handleChange(idx, "startTime", e.target.value)}
                      className="border border-blue-200 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-full min-w-[140px]"
                    />
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle hidden sm:table-cell">
                    <input
                      type="datetime-local"
                      value={d.endTime.slice(0, 16)}
                      onChange={(e) => handleChange(idx, "endTime", e.target.value)}
                      className="border border-blue-200 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-full min-w-[140px]"
                    />
                  </td>
                  {/* Mobile view - stacked inputs */}
                  <td className="py-2 px-2 align-middle sm:hidden">
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Start</label>
                        <input
                          type="datetime-local"
                          value={d.startTime.slice(0, 16)}
                          onChange={(e) => handleChange(idx, "startTime", e.target.value)}
                          className="border border-blue-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">End</label>
                        <input
                          type="datetime-local"
                          value={d.endTime.slice(0, 16)}
                          onChange={(e) => handleChange(idx, "endTime", e.target.value)}
                          className="border border-blue-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white w-full"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle text-center">
                    <button
                      onClick={() => handleSave(d)}
                      className="bg-[#040941] text-white px-2 sm:px-3 md:px-4 py-1 rounded hover:opacity-90 text-xs sm:text-sm font-semibold shadow w-full sm:w-auto min-w-[60px]"
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

export default DeadlineManagement;
