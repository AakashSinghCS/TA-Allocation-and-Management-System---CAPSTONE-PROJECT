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
      const sectionsWithSids: Section[] = fetched.map((sec) => ({
        ...sec,
        id: sec?.id ?? sec.course?.id ?? -1,
      }));
      setSelectedSections(sectionsWithSids);
      setInitialSections(sectionsWithSids);
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

  const onRemovePrereq = (sidToRemove: number) => {
    setSelectedSections((prev) => prev.filter((s) => s?.id !== sidToRemove));
  };

  const handleSaveHistory = async () => {
    const ok = await fetchPostAllocationHistory(
      studentId,
      selectedSections,
      initialSections
    );
    alert(ok ? "History updated!" : "Failed to update history.");
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
    <div className="container mx-auto p-4 w-full max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Search for a Section</h1>
        <p className="text-sm text-gray-400">
          Search for a section and click Select in the far right column
        </p>
      </div>

      {/* Selected list */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Selected Sections</h3>
        <div className="space-y-2">
          {selectedSections.map((sec) => {
            const sid = sec?.id;
            return (
              <div
                key={sid}
                className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded"
              >
                <span>
                  {sec.course?.deptCode} {sec.course?.courseNum} –{" "}
                  {sec.course?.name}
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save History
        </button>
      </div>
    </div>
  );
}

