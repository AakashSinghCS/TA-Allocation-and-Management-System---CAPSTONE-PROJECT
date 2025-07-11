import { useState } from 'react';
import CSVExporter from '../generic/CSVExporter';
import type Section from '../../../../interfaces/section/Section';
import { fetchExportSectionsToCSV, type ExportedSectionData } from '../../../../api/csv/fetchExportSections';

interface SectionCSVExportProps {
  sections: Section[];
  filename?: string;
  className?: string;
  buttonLabel?: string;
}

const SECTION_CSV_HEADERS = [
  { label: 'Section ID', key: 'sectionId' },
  { label: 'Year', key: 'year' },
  { label: 'Semester', key: 'semester' },
  { label: 'Section Code', key: 'sectionCode' },
  { label: 'Type', key: 'type' },
  { label: 'Course ID', key: 'courseId' },
  { label: 'Department Code', key: 'deptCode' },
  { label: 'Course Number', key: 'courseNum' },
  { label: 'Course Name', key: 'courseName' },
  { label: 'Need ID', key: 'needId' },
  { label: 'Need Description', key: 'needDescription' },
  { label: 'Required Grading Hours', key: 'requiredGradingHours' },
  { label: 'Currently Allocated Hours', key: 'numHoursCurrentlyAllocated' },
  { label: 'Allocation ID', key: 'allocationId' },
  { label: 'Student ID', key: 'studentId' },
  { label: 'Student First Name', key: 'studentFirstName' },
  { label: 'Student Last Name', key: 'studentLastName' },
  { label: 'Is Confirmed', key: 'isConfirmed' },
  { label: 'Number of Hours', key: 'numberOfHours' },
];

export default function SectionCSVExport({
  sections,
  filename = `sections_export_${new Date().toISOString().split('T')[0]}`,
  className,
  buttonLabel = 'Export Sections to CSV',
}: SectionCSVExportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [exportData, setExportData] = useState<ExportedSectionData[]>([]);

  const handleExportStart = async () => {
    setIsLoading(true);
    
    try {
      // Extract section IDs
      const sectionIds = sections
        .map((section: Section) => section.sectionDetails?.sectionId)
        .filter((id: number | undefined): id is number => id !== undefined);

      if (sectionIds.length === 0) {
        throw new Error('No valid section IDs found');
      }

      // Fetch export data from API
      const data = await fetchExportSectionsToCSV(sectionIds);
      
      if (!data || data.length === 0) {
        throw new Error('No export data received from server');
      }

      setExportData(data);
      return data;
    } catch (error) {
      console.error('Failed to prepare export data:', error);
      throw error;
    }
  };

  const handleExportComplete = () => {
    setIsLoading(false);
    setExportData([]);
  };

  const handleExportError = (error: Error) => {
    setIsLoading(false);
    setExportData([]);
    alert(`Export failed: ${error.message}`);
  };

  return (
    <CSVExporter
      data={exportData}
      headers={SECTION_CSV_HEADERS}
      filename={filename}
      className={className}
      buttonLabel={isLoading ? 'Exporting...' : buttonLabel}
      onExportStart={handleExportStart}
      onExportComplete={handleExportComplete}
      onExportError={handleExportError}
    />
  );
}
