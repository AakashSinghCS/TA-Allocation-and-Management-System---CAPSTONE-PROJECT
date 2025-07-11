export interface ExportSectionsRequest {
  sectionIds: number[];
}

// New simplified interface for CSV export/import compatibility
export interface SectionCsvData {
  deptCode: string;
  courseNum: string;
  name: string;
  year: number;
  semester: string;
  section: string;
  type: string;
  day: string;
  startTime: string;
  endTime: string;
}

// Legacy interface for complex export data
export interface ExportedSectionData {
  sectionId: number;
  year: number;
  semester: string;
  sectionCode: string;
  type: string;
  courseId: number;
  deptCode: string;
  courseNum: string;
  courseName: string;
  needId?: number;
  needDescription?: string;
  requiredGradingHours?: number;
  numHoursCurrentlyAllocated?: number;
  allocationId?: number;
  studentId?: number;
  studentFirstName?: string;
  studentLastName?: string;
  isConfirmed?: boolean;
  numberOfHours?: number;
}

// Legacy function for complex export data
export async function fetchExportSectionsToCSV(sectionIds: number[]): Promise<ExportedSectionData[] | null> {
  const token = localStorage.getItem('token');
  const BASE = 'http://localhost:8080/sections/export';

  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sectionIds }),
    });

    if (!res.ok) {
      console.error('Export request failed with status:', res.status);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error('Export request failed:', err);
    return null;
  }
}

// New simplified CSV export function for direct CSV download
export async function fetchExportSectionsAsCSV(sectionIds: number[]): Promise<Blob | null> {
  const token = localStorage.getItem('token');
  const BASE = 'http://localhost:8080/sections/export-csv';

  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sectionIds }),
    });

    if (!res.ok) {
      console.error('CSV export request failed with status:', res.status);
      return null;
    }

    // Convert JSON response to CSV
    const jsonData = await res.json();
    return convertSectionCsvDataToBlob(jsonData);
  } catch (err) {
    console.error('CSV export request failed:', err);
    return null;
  }
}

// Export all sections as CSV
export async function fetchExportAllSectionsAsCSV(): Promise<Blob | null> {
  const token = localStorage.getItem('token');
  const BASE = 'http://localhost:8080/sections/export-csv/all';

  try {
    const res = await fetch(BASE, {
      method: 'GET',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      console.error('Export all sections CSV request failed with status:', res.status);
      return null;
    }

    // Convert JSON response to CSV
    const jsonData = await res.json();
    return convertSectionCsvDataToBlob(jsonData);
  } catch (err) {
    console.error('Export all sections CSV request failed:', err);
    return null;
  }
}

// Helper function to convert sections to CSV format and trigger download (legacy format)
export function downloadSectionsAsCSV(data: ExportedSectionData[], filename?: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // CSV Headers
  const headers = [
    'Section ID',
    'Year',
    'Semester',
    'Section Code',
    'Type',
    'Course ID',
    'Dept Code',
    'Course Number',
    'Course Name',
    'Need ID',
    'Need Description',
    'Required Grading Hours',
    'Currently Allocated Hours',
    'Allocation ID',
    'Student ID',
    'Student First Name',
    'Student Last Name',
    'Is Confirmed',
    'Number of Hours',
  ];

  // Convert data to CSV rows
  const csvRows = data.map(row => [
    row.sectionId,
    row.year,
    row.semester,
    row.sectionCode,
    row.type,
    row.courseId,
    row.deptCode,
    row.courseNum,
    row.courseName,
    row.needId || '',
    row.needDescription || '',
    row.requiredGradingHours || '',
    row.numHoursCurrentlyAllocated || '',
    row.allocationId || '',
    row.studentId || '',
    row.studentFirstName || '',
    row.studentLastName || '',
    row.isConfirmed !== undefined ? row.isConfirmed : '',
    row.numberOfHours || '',
  ]);

  // Combine headers and rows
  const allRows = [headers, ...csvRows];

  // Convert to CSV string
  const csvContent = allRows
    .map(row =>
      row
        .map(cell => {
          const cellStr = String(cell).replace(/"/g, '""');
          return `"${cellStr}"`;
        })
        .join(',')
    )
    .join('\r\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `sections_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// New simplified CSV download function for import compatibility
export function downloadSectionsCsvData(data: SectionCsvData[], filename?: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // CSV Headers matching import format
  const headers = [
    'Dept Code',
    'Course Number',
    'Course Name',
    'Year',
    'Semester',
    'Section',
    'Type',
    'Day',
    'Start Time',
    'End Time',
  ];

  // Convert data to CSV rows
  const csvRows = data.map(row => [
    row.deptCode,
    row.courseNum,
    row.name,
    row.year,
    row.semester,
    row.section,
    row.type,
    row.day,
    row.startTime,
    row.endTime,
  ]);

  // Combine headers and rows
  const allRows = [headers, ...csvRows];

  // Convert to CSV string
  const csvContent = allRows
    .map(row =>
      row
        .map(cell => {
          const cellStr = String(cell).replace(/"/g, '""');
          return `"${cellStr}"`;
        })
        .join(',')
    )
    .join('\r\n');

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `sections_csv_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Direct CSV download function for the new API
export function downloadCSVBlob(blob: Blob, filename?: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `sections_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper function to convert SectionCsvData array to CSV Blob
function convertSectionCsvDataToBlob(data: SectionCsvData[]): Blob {
  if (!data || data.length === 0) {
    return new Blob([''], { type: 'text/csv;charset=utf-8;' });
  }

  // CSV Headers matching SectionCsvData interface
  const headers = [
    'Dept Code',
    'Course Number',
    'Course Name',
    'Year',
    'Semester',
    'Section',
    'Type',
    'Day',
    'Start Time',
    'End Time',
  ];

  // Convert data to CSV rows
  const csvRows = data.map(row => [
    row.deptCode,
    row.courseNum,
    row.name,
    row.year,
    row.semester,
    row.section,
    row.type,
    row.day,
    row.startTime,
    row.endTime,
  ]);

  // Combine headers and rows
  const allRows = [headers, ...csvRows];

  // Convert to CSV string
  const csvContent = allRows
    .map(row =>
      row
        .map(cell => {
          const cellStr = String(cell).replace(/"/g, '""');
          return `"${cellStr}"`;
        })
        .join(',')
    )
    .join('\r\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}
