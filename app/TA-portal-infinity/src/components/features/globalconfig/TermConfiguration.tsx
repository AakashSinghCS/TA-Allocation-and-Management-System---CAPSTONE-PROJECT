import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { getAllSemesters } from "../../../api/semester/getAllSemesters";
import type { Semester } from "../../../interfaces/semester/Semester";
import AddTermForm from './AddTermForm';
import ExistingTermsTable from './ExistingTermsTable';

interface TermConfigurationProps {
  token: string;
}

const TermConfiguration: React.FC<TermConfigurationProps> = ({ token }) => {
  // Semesters state
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [semestersLoading, setSemestersLoading] = useState(true);
  
  // Load semesters on mount
  useEffect(() => {
    async function loadSemesters() {
      setSemestersLoading(true);
      try {
        const data = await getAllSemesters(token || "");
        setSemesters(data);
      } catch (error: any) {
        console.error("Failed to load semesters:", error);
        
        // Handle specific HTTP status codes
        if (error.response) {
          const status = error.response.status;
          const message = error.response.data || error.message;
          
          switch (status) {
            case 404: // NOT FOUND
              toast.error("No semesters found.");
              break;
            case 500: // INTERNAL SERVER ERROR
              toast.error("Server error while loading semesters. Please try again later.");
              break;
            default:
              toast.error(message || "Failed to load semesters");
          }
        } else if (error.request) {
          // Network error
          toast.error('Network error. Please check your connection and try again.');
        } else {
          // Other error
          toast.error("Failed to load semesters");
        }
      } finally {
        setSemestersLoading(false);
      }
    }
    if (token) {
      loadSemesters();
    }
  }, [token]);

  const handleSemestersUpdated = (updatedSemesters: Semester[]) => {
    setSemesters(updatedSemesters);
  };

  return (
    <div className="mb-8 sm:mb-10">
      <h2 className="text-lg sm:text-xl font-semibold text-[#040941] mb-3">Term Configuration</h2>
      
      {/* Add New Term Form */}
      <AddTermForm token={token} onTermAdded={handleSemestersUpdated} />

      {/* Existing Terms Table */}
      <ExistingTermsTable 
        token={token}
        semesters={semesters}
        semestersLoading={semestersLoading}
        onSemestersUpdated={handleSemestersUpdated}
      />
    </div>
  );
};

export default TermConfiguration;
