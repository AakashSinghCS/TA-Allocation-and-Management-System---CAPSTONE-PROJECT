import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDeleteCourse } from '../../../api/course/fetchDeleteCourse';
import { fetchFilteredSections, type FilterSectionsProps } from '../../../api/course/sectionfilter/fetchFilteredSections';
import { fetchDeleteSection } from '../../../api/section/fetchDeleteSection';
import SectionFilter from '../../../components/features/course/coursefilter/SectionFilter';
import SectionList from '../../../components/features/course/sectionlist/SectionList';
import type Section from '../../../interfaces/section/Section';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { confirmDeletion } from '../../../utility/confirmation/confirmDeletion';
import Papa from 'papaparse';
import { fetchImportAllocations } from '../../../api/allocation/fetchImportAllocations';
import type { Allocation } from '../../../interfaces/allocation/Allocation';



export default function SectionListPage() {
  const navigate = useNavigate();
  const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);
  const [lastFilters, setLastFilters] = useState<FilterSectionsProps | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = async (filters: FilterSectionsProps) => {
    setLoading(true);
    setLastFilters(filters);
    try {
      const raw = await fetchFilteredSections(filters);
      const sections = convertFilterSectionsToSections(raw || []);
      setFilteredSections(sections);
    } catch (e) {
      navigate('/error', { replace: true, state: { message: (e as Error).message } });
    } finally {
      setLoading(false);
    }
  };

  // this will be passed down to <SectionList> and called after delete
  const handleDeleted = async (id: number, isCourse: boolean) => {
    if (isCourse) {
      const confirm = confirmDeletion("course","This will delete all associated sections.");
      if (!confirm) return;
      await fetchDeleteCourse(id);
    } else {
      const confirm = confirmDeletion("section","This will delete associated schedule and exam data");
      if (!confirm) return;
      await fetchDeleteSection(id);
    }
    if (lastFilters) {
      void handleFilterChange(lastFilters);
    }
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
    if (!file) return;

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
          setImportResult(response);
          setSuccessMessage('Allocations imported successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
          setShowImportModal(false);
        } catch (err:any) {
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

          setErrorMsg(friendlyMessage);
        }
      },
      error: (error) => {
        setCsvError('Failed to parse CSV: ' + error.message);
      },
    });
  };

  return (
    <div className="container mx-auto p-4 z-10">
      <div className="flex justify-between items-stretch mb-4">
          <h1 className="text-xl font-semibold">Search for a Section or Course</h1>
          <div className="flex gap-2">
            <Link
              to="/user/coordinator/sections/add"
              className="bg-[#00c89c] text-white px-4 py-1 rounded hover:bg-[#c7fcec] transition-colors"
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
        <SectionFilter onFilterChange={handleFilterChange} mode="large" />
      </div>

      {loading
        ? <p>Loading courses…</p>
        : <SectionList
          sections={filteredSections}
          onDeleted={handleDeleted}
        mode = 'coordinator'
        />
      }

      
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