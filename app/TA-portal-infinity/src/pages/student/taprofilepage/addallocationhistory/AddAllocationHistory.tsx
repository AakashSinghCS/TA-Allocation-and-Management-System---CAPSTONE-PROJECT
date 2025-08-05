// AddAllocationHistory.tsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionFilter from "../../../../components/features/course/coursefilter/SectionFilter";
import SectionList from "../../../../components/features/course/sectionlist/SectionList";
import { useAuth } from "../../../../context/AuthContext";
import type Section from "../../../../interfaces/section/Section";
import { convertFilterSectionsToSections } from "../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections";
import { fetchStudentAllocationHistory } from "../../../../api/student/allocation/fetchStudentAllocationHistory";
import { fetchPostAllocationHistory } from "../../../../api/student/allocation/fetchPostAllocationHistory";
import { type FilterSectionsProps } from "../../../../api/course/sectionfilter/fetchFilteredSections";
import { useDebounce } from "../../../../utility/pagination/useDebounce";
import { useSectionSearchPage } from "../../../../api/course/sectionfilter/useSectionFilter";
import Pagination from "../../../../utility/pagination/pagination/Pagination";
import { StatusIndicator } from "../../../../components/ui/statusindicator/StatusIndicator";
import { toast } from 'react-toastify';
import { Info } from 'lucide-react';

export default function AddAllocationHistory() {
  const { userId: studentId } = useAuth();
  const navigate = useNavigate();

  // ----- Selection state -----
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [initialSections, setInitialSections] = useState<Section[]>([]);

  // Fetch existing history on mount
  useEffect(() => {
    const fetchData = async () => {
      const fetched = await fetchStudentAllocationHistory(studentId);
      const sectionsWithNoSIds: Section[] = fetched.map((sec) => ({
        ...sec,
      }));
      setSelectedSections(sectionsWithNoSIds);
      setInitialSections(sectionsWithNoSIds);
    };
    fetchData();
  }, [studentId]);

  // Toggle select
  const onSelect = useCallback((sec: Section) => {
    const sid = sec?.id;
    if (sid == null) return;
    setSelectedSections((prev) =>
      prev.some((s) => s?.id === sid)
        ? prev.filter((s) => s?.id !== sid)
        : [...prev, sec]
    );
  }, []);

  const onRemovePrereq = (courseId : number, semester : string, year : number) => {
    setSelectedSections(prev =>
      prev.filter(s =>
        s.course?.id !== courseId ||
        s.semester      !== semester ||
        s.year          !== year
      )
    );
  };

  const handleSaveHistory = async () => {
    const ok = await fetchPostAllocationHistory(
      studentId,
      selectedSections,
      initialSections
    );
    if (ok) {
      toast.success("History updated!");
    } else {
      toast.error("Failed to update history.");
    }
    navigate(`/user/taprofile/${studentId}/allocationHistory`);
  };

  // ----- Filtering + pagination -----
  const [filters, setFilters] = useState<FilterSectionsProps>({});
  const [page, setPage] = useState(0);
  const size = 10;

  const debouncedFilters = useDebounce(filters, 300);

  const { data, isFetching, isError, error } = useSectionSearchPage(
    debouncedFilters,
    page,
    size
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedFilters]);

  const handleFilterChange = useCallback((f: FilterSectionsProps) => {
    setFilters(f);
  }, []);

  const sections = convertFilterSectionsToSections(data?.content ?? []);

  return (
    <div className="container mx-auto p-4 w-full max-w-7xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Search for a Section</h1>
      </div>

      {/* Selected list */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Selected Sections</h3>
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-900 px-4 py-2 rounded shadow text-sm mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-400" />
           Search for a section and click Select in the far right column.
        </div>
        <div className="space-y-2">
          {selectedSections.map((sec) => {
            const key = `${sec.course?.id}-${sec.semester}-${sec.year}-${sec.section}`
            return (
              <div
                key={key}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded"
              >
                <span>
                  {sec.course?.deptCode} {sec.course?.courseNum} –{" "}
                  {sec.course?.name}-{sec.semester}-{sec.year}
                </span>
                <button
                  type="button"
                  onClick={() => key != null && onRemovePrereq(sec.course?.id ?? -1, sec.semester ?? "", sec.year ?? -1)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="border p-4 rounded-md shadow-sm mb-4">
        <SectionFilter onFilterChange={handleFilterChange} mode="large" />
      </div>

      {/* Results */}
      {isError && (
        <p className="text-red-600">
          {(error as Error)?.message ?? "Failed to load sections"}
        </p>
      )}

      {isFetching && <StatusIndicator loading={isFetching} />}

      {!isFetching && !isError && (
        <>
          <SectionList
            sections={sections}
            mode="studentAddHistory"
            onSelect={onSelect}
            askForConfirmation={true}
          />

          <Pagination
            page={page}
            pageCount={data?.totalPages ?? 0}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() =>
              setPage((p) =>
                Math.min((data?.totalPages ?? 1) - 1, p + 1)
              )
            }
          />
        </>
      )}

      {/* Save */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSaveHistory}
          className="px-6 py-2 bg-[#040941] text-white rounded hover:bg-blue-800 rounded-sm"
        >
          Save History
        </button>
      </div>
    </div>
  );
}

