import React, { useState } from "react";
import type ExamAssignmentDto  from "../../../interfaces/exam/ExamAssignment";
import {toast} from "react-toastify";

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
  const [date, setDate] = useState(assignment.date);
  const [startTime, setStartTime] = useState(assignment.startTime);
  const [endTime, setEndTime] = useState(assignment.endTime);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !date || !startTime || !endTime) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (new Date(`1970-01-01T${endTime}`) <= new Date(`1970-01-01T${startTime}`)) {
      toast.error("End time must be after start time.");
      return;
    }

    
    onUpdate({
      ...assignment,
      task,
      date,
      startTime,
      endTime,
    });
  };

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
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 border rounded px-3 py-2"
              required
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
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAssignmentModal;

