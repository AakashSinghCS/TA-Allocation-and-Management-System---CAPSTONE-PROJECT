import React, { useState } from "react";
import { toast } from 'react-toastify';
import { showToastConfirmation } from '../../../utility/confirmation/toastConfirmation';
import { getAllSemesters } from "../../../api/semester/getAllSemesters";
import { updateSemester } from "../../../api/semester/updateSemester";
import { deleteSemester } from "../../../api/semester/deleteSemester";
import type { Semester } from "../../../interfaces/semester/Semester";

interface ExistingTermsTableProps {
  token: string;
  semesters: Semester[];
  semestersLoading: boolean;
  onSemestersUpdated: (semesters: Semester[]) => void;
}

const ExistingTermsTable: React.FC<ExistingTermsTableProps> = ({
  token,
  semesters,
  semestersLoading,
  onSemestersUpdated
}) => {
  const [displayedSemesters, setDisplayedSemesters] = useState(5);
  const [editingSemester, setEditingSemester] = useState<number | null>(null);
  const [editSemesterData, setEditSemesterData] = useState<Semester | null>(null);

  // Semester management functions
  const handleEditSemester = (semester: Semester) => {
    setEditingSemester(semester.id || 0);
    setEditSemesterData({ ...semester });
  };

  const handleCancelEdit = () => {
    setEditingSemester(null);
    setEditSemesterData(null);
  };

  const handleSaveSemesterEdit = async () => {
    if (!editSemesterData || !editingSemester) return;
    
    // Client-side validation to match backend logic
    if (editSemesterData.startDate && editSemesterData.endDate) {
      const startDate = new Date(editSemesterData.startDate);
      const endDate = new Date(editSemesterData.endDate);
      
      if (startDate >= endDate) {
        toast.error("Start date must be before end date.");
        return;
      }

      // Validate year matches start date's year
      if (editSemesterData.year && startDate.getFullYear() !== editSemesterData.year) {
        toast.error("Year must match the start date's year.");
        return;
      }
    }
    
    try {
      const success = await updateSemester(editingSemester, editSemesterData, token || "");
      if (success) {
        toast.success('Semester updated successfully!');
        // Reload semesters
        const data = await getAllSemesters(token || "");
        onSemestersUpdated(data);
        setEditingSemester(null);
        setEditSemesterData(null);
      } else {
        toast.error('Failed to update semester.');
      }
    } catch (error: any) {
      console.error("Error updating semester:", error);
      
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
            toast.error(`No semester found with the specified ID.`);
            break;
          case 500: // INTERNAL SERVER ERROR
            toast.error("Internal server error. Please try again later.");
            break;
          default:
            toast.error(message || 'Error updating semester.');
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other error
        toast.error('Error updating semester.');
      }
    }
  };

  const handleSemesterEditChange = (field: keyof Semester, value: string | number | boolean) => {
    if (!editSemesterData) return;
    setEditSemesterData({
      ...editSemesterData,
      [field]: value
    });
  };

  const handleShowMore = () => {
    setDisplayedSemesters(prev => prev + 5);
  };

  const handleDeleteSemester = async (semester: Semester) => {
    if (!semester.id) return;
    
    const confirmed = await showToastConfirmation({
      title: "Delete Semester",
      message: `Are you sure you want to delete the semester ${semester.year} ${semester.semester}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: 'danger'
    });
    
    if (!confirmed) return;
    
    try {
      const success = await deleteSemester(semester.id, token || "");
      if (success) {
        toast.success('Semester deleted successfully!');
        // Reload semesters
        const data = await getAllSemesters(token || "");
        onSemestersUpdated(data);
      } else {
        toast.error('Failed to delete semester.');
      }
    } catch (error: any) {
      console.error("Error deleting semester:", error);
      
      // Handle specific HTTP status codes and backend exceptions
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || error.message;
        
        switch (status) {
          case 404: // NOT FOUND - NotFoundException
            toast.error(`Semester not found. It may have already been deleted.`);
            // Reload semesters to sync with current state
            try {
              const data = await getAllSemesters(token || "");
              onSemestersUpdated(data);
            } catch (reloadError) {
              console.error("Error reloading semesters:", reloadError);
            }
            break;
          case 400: // BAD REQUEST
            toast.error("Invalid request. Unable to delete semester.");
            break;
          case 500: // INTERNAL SERVER ERROR
            toast.error("Internal server error. Please try again later.");
            break;
          default:
            toast.error(message || 'Error deleting semester.');
        }
      } else if (error.request) {
        // Network error
        toast.error('Network error. Please check your connection and try again.');
      } else {
        // Other error
        toast.error('Error deleting semester.');
      }
    }
  };

  return (
    <div>
      <h3 className="text-md font-semibold text-[#040941] mb-3">Existing Terms</h3>
      {semestersLoading && <p className="text-blue-600 text-center font-semibold animate-pulse">Loading terms...</p>}
      
      {!semestersLoading && semesters.length === 0 && (
        <p className="text-gray-500 text-center">No terms found.</p>
      )}

      {!semestersLoading && semesters.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-xs sm:text-sm md:text-base">
            <thead>
              <tr className="bg-gray-300 text-[#040941] text-left">
                <th className="py-2 px-2 sm:px-3 rounded-l-lg font-semibold">Year</th>
                <th className="py-2 px-2 sm:px-3 font-semibold">Semester</th>
                <th className="py-2 px-2 sm:px-3 font-semibold">Start Date</th>
                <th className="py-2 px-2 sm:px-3 font-semibold">End Date</th>
                <th className="py-2 px-2 sm:px-3 font-semibold text-center">Active</th>
                <th className="py-2 px-2 sm:px-3 rounded-r-lg font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {semesters.slice(0, displayedSemesters).map((semester) => (
                <tr key={semester.id} className="bg-white hover:bg-blue-50 transition-colors">
                  <td className="py-2 px-2 sm:px-3 text-[#040941] font-medium align-middle">
                    {editingSemester === semester.id ? (
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={editSemesterData?.year || ""}
                        onChange={(e) => handleSemesterEditChange("year", parseInt(e.target.value))}
                        className="border border-blue-200 rounded px-1 py-1 text-xs sm:text-sm w-20"
                      />
                    ) : (
                      semester.year
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle">
                    {editingSemester === semester.id ? (
                      <select
                        value={editSemesterData?.semester || ""}
                        onChange={(e) => handleSemesterEditChange("semester", e.target.value)}
                        className="border border-blue-200 rounded px-1 py-1 text-xs sm:text-sm w-16"
                      >
                        <option value="W1">W1</option>
                        <option value="W2">W2</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                      </select>
                    ) : (
                      semester.semester
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle">
                    {editingSemester === semester.id ? (
                      <input
                        type="date"
                        value={editSemesterData?.startDate || ""}
                        onChange={(e) => handleSemesterEditChange("startDate", e.target.value)}
                        className="border border-blue-200 rounded px-1 py-1 text-xs sm:text-sm min-w-[120px]"
                      />
                    ) : (
                      semester.startDate
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle">
                    {editingSemester === semester.id ? (
                      <input
                        type="date"
                        value={editSemesterData?.endDate || ""}
                        onChange={(e) => handleSemesterEditChange("endDate", e.target.value)}
                        className="border border-blue-200 rounded px-1 py-1 text-xs sm:text-sm min-w-[120px]"
                      />
                    ) : (
                      semester.endDate
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle text-center">
                    {editingSemester === semester.id ? (
                      <input
                        type="checkbox"
                        checked={editSemesterData?.active || false}
                        onChange={(e) => handleSemesterEditChange("active", e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={semester.active || false}
                        readOnly
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    )}
                  </td>
                  <td className="py-2 px-2 sm:px-3 align-middle text-center">
                    {editingSemester === semester.id ? (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={handleSaveSemesterEdit}
                          className="bg-green-800 text-white px-2 py-1 rounded hover:opacity-90 text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-2 py-1 rounded hover:opacity-90 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleEditSemester(semester)}
                          className="bg-[#040941] text-white px-2 py-1 rounded hover:opacity-90 text-xs font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSemester(semester)}
                          className="bg-red-600 text-white px-2 py-1 rounded hover:opacity-90 text-xs font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {semesters.length > displayedSemesters && (
            <div className="text-center mt-4">
              <button
                onClick={handleShowMore}
                className="bg-[#040941] text-white px-4 py-2 rounded hover:opacity-90 text-sm font-semibold"
              >
                Show More ({semesters.length - displayedSemesters} remaining)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExistingTermsTable;
