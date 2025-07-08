export interface ExportSectionsRequest {
  sectionIds: number[];
}

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

// Helper function to convert sections to CSV format and trigger download
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
