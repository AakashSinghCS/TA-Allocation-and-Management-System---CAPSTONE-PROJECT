import React, { useState } from "react";
import type ExamAssignmentDto  from "../../../interfaces/exam/ExamAssignment";
import {toast} from "react-toastify";
import DatePicker from "react-datepicker";

interface UpdateAssignmentModalProps {
  isOpen: boolean;
  assignment: ExamAssignmentDto;
  onUpdate: (updated: ExamAssignmentDto) => void;
  onClose: () => void;
}

const taskOptions = ["MARKING", "PREPARATION", "COORDINATION"];

const UpdateAssignmentModal: React.FC<UpdateAssignmentModalProps> = ({
  isOpen,
  assignment,
  onUpdate,
  onClose,
}) => {
  const [task, setTask] = useState(assignment.task);
  const [date, setDate] = useState<Date | null>(new Date(assignment.date));
  const [startTime, setStartTime] = useState(assignment.startTime);
  const [endTime, setEndTime] = useState(assignment.endTime);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !date || !startTime || !endTime) {
      toast.error("Please fill in all fields.");
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
      return;
    }
    
    if (endTotalMin < minAllowed || endTotalMin > maxAllowed) {
      toast.warn("End time must be between 08:00 and 20:00.");
      return;
    }
      
    if (endTotalMin <= startTotalMin) {
      toast.error("End time must be after start time.");
      return;
    }

    
    onUpdate({
      ...assignment,
      task,
      date: date ? formatDateToYyyyMmDdLocal(date) : "",
      startTime,
      endTime,
    });
  };

  function formatDateToYyyyMmDdLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Assignment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task" className="block mb-2">Task</label>
            <select
              id="task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            >
              <option value="" disabled>
                Select task
              </option>
              {taskOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="date" className="block mb-2">Date</label>
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => setDate(d)}
              className="w-full border rounded px-3 py-2"
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              placeholderText="Select a date"
            />
          </div>

          <div>
            <label htmlFor="startTime" className="block mb-2">Start Time</label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block mb-2">End Time</label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#040941] text-white rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssignmentModal;

