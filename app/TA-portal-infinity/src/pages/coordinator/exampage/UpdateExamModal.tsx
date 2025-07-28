import { useState } from "react";
import type { ExamDto } from "../../../interfaces/exam/Exam";
import {toast, ToastContainer} from "react-toastify"

interface UpdateExamModalProps {
  exam: ExamDto;
  closeModal: () => void;
  onUpdate: () => void;
}

export default function UpdateExamModal({
  exam,
  closeModal,
  onUpdate,
}: UpdateExamModalProps) {
  const [date, setDate] = useState(exam.date);
  const [startTime, setStartTime] = useState(exam.startTime);
  const [endTime, setEndTime] = useState(exam.endTime);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    if (!date || !startTime || !endTime) {
        toast.error("Please fill in all fields.");
        setLoading(false);
        return;
    }

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
      
    const startTotalMin = startHour * 60 + startMinute;
    const endTotalMin = endHour * 60 + endMinute;
      
    const minAllowed = 8 * 60;
    const maxAllowed = 20 * 60;
    
    if (startTotalMin < minAllowed || startTotalMin > maxAllowed) {
      toast.warn("Start time must be between 08:00 and 20:00.");
      setLoading(false);
      return;
    }
    
    if (endTotalMin < minAllowed || endTotalMin > maxAllowed) {
      toast.warn("End time must be between 08:00 and 20:00.");
      setLoading(false);
      return;
    }
      
    if (endTotalMin <= startTotalMin) {
      toast.error("End time must be after start time.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const updatedExam: ExamDto = {
        ...exam,
        date,
        startTime,
        endTime,
      };

      const response = await fetch(`http://localhost:8080/exams/${exam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedExam),
      });

      if (!response.ok) {
        throw new Error("Failed to update exam");
      }
      toast.success("Exam updated successfully.");
      onUpdate();
      closeModal();
    } catch (err) {
      setError("Failed to update exam. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-transparent backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Exam</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <label className="block mb-2">
          Date
          <input
            type="date"
            className="w-full mt-1 border rounded px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label className="block mb-2">
          Start Time
          <input
            type="time"
            className="w-full mt-1 border rounded px-3 py-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          End Time
          <input
            type="time"
            className="w-full mt-1 border rounded px-3 py-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            onClick={closeModal}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded bg-[#040941] text-white hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
