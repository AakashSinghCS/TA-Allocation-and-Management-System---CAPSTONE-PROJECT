import React, { useState, useEffect } from "react";
import { useAuth } from '../../../context/AuthContext';
import { fetchDeadlines, updateDeadline } from "../../../api/admin/FetchDeadline";
import type { DeadlineDto } from "../../../interfaces/config/Deadline";

const DeadlineManagementPage: React.FC = () => {
  const { token } = useAuth();
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
    updated[index] = {
      ...updated[index],
      [field]: value ? new Date(value).toISOString() : ""
    } as DeadlineDto;
    setDeadlines(updated);
  };

  // Handle save click
  const handleSave = async (deadline: DeadlineDto) => {
    try {
      const updated = await updateDeadline(deadline.name, deadline, token || "");
      setDeadlines((prev) =>
        prev.map((d) => (d.name === updated.name ? updated : d))
      );
    } catch (err) {
      console.error("Failed to update deadline:", err);
      alert("Error updating deadline");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-[#040941] mb-6">Deadline Management</h1>

        {loading && <p className="text-gray-600">Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && deadlines.length === 0 && (
          <p className="text-gray-500">No deadlines found.</p>
        )}

        {!loading && deadlines.length > 0 && (
          <div className="space-y-4">
            {deadlines.map((d, idx) => (
              <div
                key={d.name}
                className="bg-white p-4 rounded-xl shadow border border-blue-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <h2 className="font-semibold text-lg text-[#040941]">{d.name}</h2>
                  <p className="text-sm text-gray-500">Edit start and end times below:</p>
                </div>
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                  <input
                    type="datetime-local"
                    value={d.startTime.slice(0, 16)}
                    onChange={(e) => handleChange(idx, "startTime", e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={d.endTime.slice(0, 16)}
                    onChange={(e) => handleChange(idx, "endTime", e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <button
                    onClick={() => handleSave(d)}
                    className="bg-[#040941] text-white px-4 py-1 rounded hover:opacity-90 text-sm"
                  >
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeadlineManagementPage;
