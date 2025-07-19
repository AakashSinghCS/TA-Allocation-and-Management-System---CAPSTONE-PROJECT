import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionFilter from '../../../components/features/course/coursefilter/SectionFilter';
import SectionList from '../../../components/features/course/sectionlist/SectionList';
import { type FilterSectionsProps } from '../../../api/course/sectionfilter/fetchFilteredSections';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { fetchExportSectionsAsCSV, fetchExportAllSectionsAsCSV, downloadCSVBlob } from '../../../api/csv/fetchExportSections';
import type Section from '../../../interfaces/section/Section';
import { useDebounce } from '../../../utility/pagination/useDebounce';
import { useSectionSearchPage } from '../../../api/course/sectionfilter/useSectionFilter';

export default function ExportToCSVPage() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterSectionsProps>({});
  const [page, setPage] = useState(0);
  const debouncedFilters = useDebounce(filters, 300);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [debouncedFilters]);

  // Fetch paginated sections via React Query
  const {
    data: sectionPage,
    isFetching: loadingSections,
    isError: errorSections,
    error: sectionsErrorMsg,
  } = useSectionSearchPage(debouncedFilters, page, 10);

  const raw = sectionPage?.content ?? [];
  const sections: Section[] = convertFilterSectionsToSections(raw);
  
  const [selected, setSelected] = useState<Section[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSelect = (sec: Section) => {
    setSelected(prev =>
      prev.some(s => s.id === sec.id)
        ? prev.filter(s => s.id !== sec.id)
        : [...prev, sec]
    );
  };

   const selectAll = () => setSelected(sections);
    const clearAll  = () => setSelected([]);

  const handleExportToCSV = async () => {
    if (!selected.length) {
      alert('Please select at least one section to export');
      return;
    }

    setIsExporting(true);
    setError(null);
    try {
      const sectionIds = selected
        .map((section: Section) => section.id)
        .filter((id: number | undefined): id is number => id !== undefined);

      console.log('Exporting sections with IDs:', sectionIds);

      if (sectionIds.length === 0) {
        alert('Selected sections do not have valid IDs');
        return;
      }

      const csvBlob = await fetchExportSectionsAsCSV(sectionIds);
      
      if (csvBlob) {
        downloadCSVBlob(csvBlob);
        alert('CSV export completed successfully!');
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed: ' + (err as Error).message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAllSections = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const csvBlob = await fetchExportAllSectionsAsCSV();
      
      if (csvBlob) {
        downloadCSVBlob(csvBlob);
        alert('All sections exported successfully!');
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (err) {
      console.error('Export all failed:', err);
      setError('Export all failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Export Sections to CSV</h1>
        <p className="text-gray-600">Search and select sections to export their data to CSV format.</p>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4">Search Sections</h2>
        <SectionFilter onFilterChange={setFilters} mode="large" />
      </div>

      {/* Selection Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Selected Sections</h3>
            <p className="text-blue-700 text-sm">
              {selected.length} of {sections.length} sections selected
            </p>
            {selected.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-blue-600 mb-1">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selected.map((section) => (
                    <span
                      key={section.id}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {section.course?.deptCode} {section.course?.courseNum} - {section.section}
                      <button
                        onClick={() => toggleSelect(section)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={selectAll}
              disabled={sections.length === 0}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Select All
            </button>
            <button
              onClick={clearAll}
              disabled={selected.length === 0}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:bg-gray-400"
            >
              Clear Selection
            </button>
            <button
              onClick={handleExportToCSV}
              disabled={selected.length === 0 || isExporting}
              className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
            >
              {isExporting ? 'Exporting...' : 'Export Selected'}
            </button>
            <button
              onClick={handleExportAllSections}
              disabled={isExporting}
              className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isExporting ? 'Exporting...' : 'Export All Sections'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Available Sections</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click on sections to select them for export
          </p>
        </div>
        <div className="p-4">
          {isExporting ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sections...</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Use the search filter above to find sections
            </div>
          ) : (
            <SectionList
              sections={sections}
              mode="instructorAddSection"
              onSelect={toggleSelect}
              askForConfirmation={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
