import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDeleteCourse } from '../../../api/course/fetchDeleteCourse';
import { type FilterSectionsProps } from '../../../api/course/sectionfilter/fetchFilteredSections';
import { fetchDeleteSection } from '../../../api/section/fetchDeleteSection';
import SectionFilter from '../../../components/features/course/coursefilter/SectionFilter';
import SectionList from '../../../components/features/course/sectionlist/SectionList';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { confirmDeletion } from '../../../utility/confirmation/confirmDeletion';
import Papa from 'papaparse';
import { fetchImportAllocations } from '../../../api/allocation/fetchImportAllocations';
import type { Allocation } from '../../../interfaces/allocation/Allocation';
import { useDebounce } from '../../../utility/pagination/useDebounce';
import { useSectionSearchPage } from '../../../api/course/sectionfilter/useSectionFilter';
import Pagination from '../../../utility/pagination/pagination/Pagination';
import { StatusIndicator } from '../../../components/ui/statusindicator/StatusIndicator';



export default function SectionListPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterSectionsProps>({});
  const [page, setPage] = useState(0);

  const debounced = useDebounce(filters, 300);

  const { data, isFetching, isError, error,refetch } = useSectionSearchPage(debounced, page, 10);
  const sections = data?.content ?? [];

  useEffect(() => {
    setPage(0);
  }, [filters]);
  
  // this will be passed down to <SectionList> and called after delete
  const handleDeleted = async (id: number, isCourse: boolean) => {
    const confirmText = isCourse
      ? "Delete this course and all its sections?"
      : "Delete this section (and its schedules and exams)?";
    if (!confirmDeletion(isCourse ? "course" : "section", confirmText))
      return;

    await (isCourse ? fetchDeleteCourse(id) : fetchDeleteSection(id));
    refetch();
  };

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<Allocation[] | null>(null);

  const token = localStorage.getItem('token');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [autoCreateMissing, setAutoCreateMissing] = useState(false);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return setCsvError("No file selected.");
    if (!file.name.endsWith('.csv')) {
      setCsvError('Only CSV files are allowed.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data as Record<string, string>[];

          const isValid = data.every(row =>
            row.firstName && row.lastName && row.studentNum &&
            row.deptCode && row.courseNum && row.section &&
            row.year && row.semester
          );

          if (!isValid) {
            setCsvError('CSV format is invalid. Make sure all required columns exist.');
            return;
          }

          const response = await fetchImportAllocations(data, autoCreateMissing, token ?? undefined);
          // setImportResult(response);
          setSuccessMessage('Allocations imported successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
          setShowImportModal(false);
        } catch (err: any) {
          let friendlyMessage = allocationsChangeErrorMsg(err);
          setErrorMsg(friendlyMessage);
        }
      },
      error: (error) => {
        setCsvError('Failed to parse CSV: ' + error.message);
      },
    });
  };
const handleFilterChange = useCallback((f: FilterSectionsProps) => {
    setFilters(f);
  }, []);
  return (
    <div className="container mx-auto p-4 z-10">
      <div className="flex justify-between items-stretch mb-4">
        <h1 className="text-xl font-semibold">Search for a Section or Course</h1>
        <div className="flex gap-2">
          <Link
            to="/user/coordinator/sections/add"
            className="bg-[#00c89c] text-white px-4 py-1 rounded hover:bg-[#c7fcec] hover:text-[#0089b2] transition-colors"
          >
            Add New Section or Course
          </Link>

          <Link
            to="/user/coordinator/sections/export"
            className="bg-[#040941] text-white px-4 py-1 rounded hover:bg-[#363a7a] transition-colors"
          >
            Export to CSV
          </Link>

          <button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-300 transition-colors"
          >
            Import Past Allocations
          </button>
        </div>
      </div>
      <div className="shadow-lg p-4 rounded-2xl  mb-4 ">
        <SectionFilter
          onFilterChange={handleFilterChange}
          mode="large"
          // loading={isFetching}
        />
      </div>

      {isError && <p className="text-red-600">{(error as Error).message}</p>}
      {isFetching && <StatusIndicator loading={isFetching}/>}

      {!isFetching && !isError && (
        <>
          <SectionList sections={convertFilterSectionsToSections(sections)} mode="coordinator" 
          onDeleted={handleDeleted}
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


      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Import Past Allocations</h2>

            {errorMsg && (
              <p className="text-red-600 text-sm mt-2">{errorMsg}</p>
            )}

            {csvError && <p className="text-red-500 mb-2">{csvError}</p>}

            <label htmlFor="csvFileInput" className="block mb-4">
              <span className="text-gray-700">Select CSV File</span>
              <input
                id="csvFileInput"
                type="file"
                accept=".csv"
                className="mt-1 block w-full"
                onChange={handleCsvUpload}
              />
              <p className="mt-2 text-sm text-red-600">
                ⚠️ Please ensure Excel does not automatically remove leading zeroes (e.g. <code>001</code> may become <code>1</code>).
                This can cause the import to fail.
              </p>

            </label>

            <label className="flex items-center mt-2">
              <input
                type="checkbox"
                checked={autoCreateMissing}
                onChange={(e) => setAutoCreateMissing(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Create new courses or sections if they don't exist.
              </span>
            </label>


            <div className="flex justify-end gap-2">
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300 text-center">
          {successMessage}
        </div>
      )}

    </div>
  );
}

function allocationsChangeErrorMsg(err: any): string {
  let friendlyMessage = 'Failed to import allocations: Unknown error occurred.';

  const errorText = err.message || '';

  if (errorText.includes('User with student number')) {
    const match = errorText.match(/User with student number (\d+) not found/);
    const studentNum = match ? match[1] : 'unknown';
    friendlyMessage = `❌ Failed to import allocations: Student with student number ${studentNum} not found. Please verify student details or add a new student.`;
  } else if (errorText.includes('Course not found:')) {
    const match = errorText.match(/Course not found:([A-Z]+ \d+)/);
    const courseInfo = match ? match[1] : 'unknown';
    friendlyMessage = `❌ Failed to import allocations: Course ${courseInfo} not found. Please create a new course.`;
  } else if (errorText.includes('Section') && errorText.includes('not found for Course')) {
    const match = errorText.match(/Section (\S+) (\d{4}) (\S+) not found for Course ([A-Z]+) (\d+)/);
    if (match) {
      const [, sectionName, year, semester, deptCode, courseNum] = match;
      friendlyMessage = `❌ Failed to import allocations: Section ${sectionName} ${semester} ${year} not found for course ${deptCode} ${courseNum}. Please add a new section to the course.`;
    } else {
      friendlyMessage = `❌ Failed to import allocations: Section not found. Please add a new section to the course.`;
    }
  }
  return friendlyMessage;
}