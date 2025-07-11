import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SectionFilter from '../../../components/features/course/coursefilter/SectionFilter';
import SectionList from '../../../components/features/course/sectionlist/SectionList';
import { fetchFilteredSections, type FilterSectionsProps } from '../../../api/sectionfilter/fetchFilteredSections';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { fetchExportSectionsAsCSV, fetchExportAllSectionsAsCSV, downloadCSVBlob } from '../../../api/csv/fetchExportSections';
import type Section from '../../../interfaces/section/Section';

export default function ExportToCSVPage() {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: FilterSectionsProps) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFilteredSections(params);
      if (data) {
        const sectionsData = convertFilterSectionsToSections(data);
        setSections(sectionsData);
      } else {
        setSections([]);
      }
    } catch (err) {
      console.error('Failed to fetch sections:', err);
      setError('Failed to fetch sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionSelect = (section: Section) => {
    setSelectedSections((prev: Section[]) => {
      const isAlreadySelected = prev.some((s: Section) => s.sectionDetails?.sectionId === section.sectionDetails?.sectionId);
      if (isAlreadySelected) {
        return prev.filter((s: Section) => s.sectionDetails?.sectionId !== section.sectionDetails?.sectionId);
      } else {
        return [...prev, section];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedSections(sections);
  };

  const handleClearSelection = () => {
    setSelectedSections([]);
  };

  const handleExportToCSV = async () => {
    if (selectedSections.length === 0) {
      alert('Please select at least one section to export');
      return;
    }

    setIsLoading(true);
    try {
      const sectionIds = selectedSections
        .map((section: Section) => section.sectionDetails?.sectionId)
        .filter((id: number | undefined): id is number => id !== undefined);

      const csvBlob = await fetchExportSectionsAsCSV(sectionIds);
      
      if (csvBlob) {
        downloadCSVBlob(csvBlob);
        alert('CSV export completed successfully!');
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (err) {
      console.error('Export failed:', err);
      setError('Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAllSections = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
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
        <SectionFilter onFilterChange={handleSearch} mode="small" />
      </div>

      {/* Selection Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Selected Sections</h3>
            <p className="text-blue-700 text-sm">
              {selectedSections.length} of {sections.length} sections selected
            </p>
            {selectedSections.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-blue-600 mb-1">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSections.map((section) => (
                    <span
                      key={section.sectionDetails?.sectionId}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {section.sectionDetails?.deptCode} {section.sectionDetails?.courseNum} - {section.sectionDetails?.section}
                      <button
                        onClick={() => handleSectionSelect(section)}
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
              onClick={handleSelectAll}
              disabled={sections.length === 0}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              Select All
            </button>
            <button
              onClick={handleClearSelection}
              disabled={selectedSections.length === 0}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:bg-gray-400"
            >
              Clear Selection
            </button>
            <button
              onClick={handleExportToCSV}
              disabled={selectedSections.length === 0 || isLoading}
              className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Exporting...' : 'Export Selected'}
            </button>
            <button
              onClick={handleExportAllSections}
              disabled={isLoading}
              className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Exporting...' : 'Export All Sections'}
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
          {isLoading ? (
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
              onSelect={handleSectionSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
}
