import React, { useState, useEffect, useCallback } from "react";
import type Section from "../../../interfaces/section/Section";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { fetchFilteredSections, type FilterSectionsProps } from "../../../api/sectionfilter/fetchFilteredSections";
import { convertFilterSectionsToSections } from "../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections";
import SectionList from "../../../components/features/course/sectionlist/SectionList";
import SectionFilter from "../../../components/features/course/coursefilter/SectionFilter";
import { fetchStudentAllocationHistory } from "../../../api/student/fetchStudentAllocationHistory";
import { fetchPostAllocationHistory } from "../../../api/student/fetchPostAllocationHistory";

export default function AddAllocationHistory() {
  const { userId: studentId } = useAuth();
  const navigate = useNavigate();
  const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [initialSections, setInitialSections] = useState<Section[]>([]);

  useEffect(() => {
    const fetchData = async () => {
    const fetched = await fetchStudentAllocationHistory(studentId);
    // ensure every Section has a sectionDetails.sectionId+    
     const sectionsWithSids: Section[] = fetched.map(sec => ({
      ...sec,
      sectionDetails: {
        ...sec.sectionDetails,
        // if the real sectionId is missing, fall back to the course‐level id
       sectionId: sec.sectionDetails?.sectionId ?? sec.sectionDetails?.id ?? -1
      }
    }));

    setSelectedSections(sectionsWithSids);
    setInitialSections(sectionsWithSids);
  };
    fetchData();
  }, [studentId]);

  const handleFilterChange = async (filters: FilterSectionsProps) => {
    setLoading(true);
    try {
      const raw = await fetchFilteredSections(filters);
      setFilteredSections(convertFilterSectionsToSections(raw || []));
    } catch (e) {
      navigate("/error", { replace: true, state: { message: (e as Error).message } });
    } finally {
      setLoading(false);
    }
  };

  // toggle a single section by sectionId
  const onSelect = useCallback((sec: Section) => {
    const sid = sec.sectionDetails?.sectionId;
    if (sid == null) return;

    setSelectedSections(prev => {
      if (prev.some(s => s.sectionDetails?.sectionId === sid)) {
        return prev.filter(s => s.sectionDetails?.sectionId !== sid);
      }
      return [...prev, sec];
    });
  }, []);


  // remove by sectionId
  const onRemovePrereq = (sidToRemove: number) => {
    setSelectedSections(prev =>
      prev.filter(s => s.sectionDetails?.sectionId !== sidToRemove)
    );
  };

  const handleSaveHistory = async () => {
    const ok = await fetchPostAllocationHistory(studentId, selectedSections, initialSections);
    alert(ok ? "History updated!" : "Failed to update history.");
    navigate(`/user/taprofile/${studentId}`);
  };

  return (
    <div className="container mx-auto p-4 w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Search for a Section</h1>
        <p className="text-sm text-gray-400">
          Search for a section and click Select in the far right column
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Selected Sections</h3>
        <div className="space-y-2">
          {selectedSections.map(sec => {
            const sid = sec.sectionDetails?.sectionId;
            return (
              <div
                key={sid}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded"
              >
                <span>
                  {sec.sectionDetails?.deptCode} {sec.sectionDetails?.courseNum} –{" "}
                  {sec.sectionDetails?.name}
                </span>
                <button
                  type="button"
                  onClick={() => sid != null && onRemovePrereq(sid)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

//       <div className="border p-4 rounded-md shadow-sm mb-4">
//         <SectionFilter onFilterChange={handleFilterChange} mode="large" />
//       </div>

      {loading ? (
        <p>Loading sections…</p>
      ) : (
        <SectionList
          sections={filteredSections}
          mode="studentAddHistory"
          onSelect={onSelect}
        />
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSaveHistory}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save History
        </button>
      </div>
    </div>
  );
}
