import React, { useState } from "react";
import { toast } from 'react-toastify';
import { addSemester } from "../../../api/semester/addSemester";
import { getAllSemesters } from "../../../api/semester/getAllSemesters";
import type { SemesterCreate, Semester } from "../../../interfaces/semester/Semester";

interface AddTermFormProps {
  token: string;
  onTermAdded: (semesters: Semester[]) => void;
}

const AddTermForm: React.FC<AddTermFormProps> = ({ token, onTermAdded }) => {
  const initialTermConfig = {
    year: new Date().getFullYear(),
    semester: "W1",
    startDate: "",
    endDate: "",
    isActive: true
  };
  
  const [termConfig, setTermConfig] = useState(initialTermConfig);
  const [termLoading, setTermLoading] = useState(false);

  const handleTermChange = (field: string, value: string | boolean) => {
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

    // Additional validation to match backend logic
    const startYear = new Date(termConfig.startDate).getFullYear();
    const configYear = parseInt(termConfig.year.toString());
    if (startYear !== configYear) {
      toast.error("Year must match the start date's year.");
      return;
    }

    setTermLoading(true);
    
    try {
      const semesterData: SemesterCreate = {
        year: parseInt(termConfig.year.toString()),
        semester: termConfig.semester as "W1" | "W2" | "S1" | "S2",
        startDate: termConfig.startDate,
        endDate: termConfig.endDate,
        isActive: termConfig.isActive
      };
      const success = await addSemester(semesterData, token || "");
      
      if (success) {
        toast.success('Term configuration saved successfully!');
        
        setTermConfig(initialTermConfig);
        // Reload semesters and notify parent
        const data = await getAllSemesters(token || "");
        onTermAdded(data);
      } else {
        toast.error('Failed to save term configuration.');
      }
    } catch (error: any) {
      console.error("Error saving term:", error);
      
      // Handle specific HTTP status codes and backend exceptions
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || error.message;
        
        switch (status) {
          case 409: // CONFLICT - DuplicateEntryException
            if (message.includes("Duplicate Entry")) {
              toast.error("This semester already exists. Please choose a different year and semester combination.");
            } else {
              toast.error("Duplicate entry detected.");
            }
            break;
          case 400: // BAD REQUEST - BadRequestException
            if (message.includes("Start date must be before end date")) {
              toast.error("Start date must be before end date.");
            } else if (message.includes("Year must match the start date's year")) {
              toast.error("Year must match the start date's year.");
            } else {
              toast.error(message || "Invalid data provided.");
            }
            break;
          case 404: // NOT FOUND - NotFoundException
            toast.error("Resource not found.");
            break;
          case 500: // INTERNAL SERVER ERROR
            toast.error("Internal server error. Please try again later.");
            break;
          default:
            toast.error(message || 'Error saving term configuration.');
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other error
        toast.error('Error saving term configuration.');
      }
    } finally {
      setTermLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
      <h3 className="text-sm sm:text-md font-semibold text-[#040941] mb-2 sm:mb-3">Add New Term</h3>
      <div className="flex flex-col sm:flex-row sm:flex-wrap md:flex-row md:items-end gap-3 sm:gap-4">
        <div className="flex flex-col">
          <label htmlFor="year-input" className="text-xs text-gray-600 mb-1">Year</label>
          <input
            id="year-input"
            type="number"
            min="2000"
            max="2100"
            value={termConfig.year}
            onChange={e => handleTermChange("year", e.target.value)}
            className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-28"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="semester-select" className="text-xs text-gray-600 mb-1">Semester</label>
          <select
            id="semester-select"
            value={termConfig.semester}
            onChange={e => handleTermChange("semester", e.target.value)}
            className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-40"
          >
            <option value="W1">W1</option>
            <option value="W2">W2</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="start-date-input" className="text-xs text-gray-600 mb-1">Start Date</label>
          <input
            id="start-date-input"
            type="date"
            value={termConfig.startDate}
            onChange={e => handleTermChange("startDate", e.target.value)}
            className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-40"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="end-date-input" className="text-xs text-gray-600 mb-1">End Date</label>
          <input
            id="end-date-input"
            type="date"
            value={termConfig.endDate}
            onChange={e => handleTermChange("endDate", e.target.value)}
            className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-40"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1" htmlFor="active-checkbox">
            Active
          </label>
          <div className="border border-blue-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 w-full sm:w-16 h-8 flex items-center justify-center">
            <input
              id="active-checkbox"
              type="checkbox"
              checked={termConfig.isActive}
              onChange={e => handleTermChange("isActive", e.target.checked)}
              className="w-5 h-5 accent-blue-600 border border-blue-200 rounded"
            />
          </div>
        </div>
        <button
          onClick={handleSaveTerm}
          disabled={termLoading}
          className="bg-[#040941] text-white px-4 py-2 rounded hover:opacity-90 text-sm font-semibold shadow mt-2 md:mt-0 disabled:opacity-60 w-full sm:w-auto"
          aria-label="save-term"
        >
          {termLoading ? "Saving..." : "Add Term"}
        </button>
      </div>
    </div>
  );
};

export default AddTermForm;
