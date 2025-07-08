export interface ImportSectionRequest {
  deptCode: string;
  courseNum: string;
  name: string;
  year: number;
  semester: string;
  section: string;
  type: string;
  day?: string;
  startTime?: string;
  endTime?: string;
}

export interface ImportSectionResponse {
  success: boolean;
  created: boolean; // true if new section was created, false if updated
  sectionId: number;
  message?: string;
}

export interface ImportSectionsBatchResponse {
  success: boolean;
  results: ImportSectionResponse[];
  errors: string[];
  totalProcessed: number;
  totalCreated: number;
  totalUpdated: number;
}

export async function fetchImportSectionsFromCSV(sections: ImportSectionRequest[]): Promise<ImportSectionsBatchResponse | null> {
  const token = localStorage.getItem('token');
  const BASE = 'http://localhost:8080/sections/import';

  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ sections }),
    });

    if (!res.ok) {
      console.error('Import request failed with status:', res.status);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error('Import request failed:', err);
    return null;
  }
}

// Helper function to parse CSV content
export function parseCSVContent(csvText: string): ImportSectionRequest[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  // Remove header row
  const dataLines = lines.slice(1);
  const sections: ImportSectionRequest[] = [];

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i].trim();
    if (!line) continue; // Skip empty lines

    // Simple CSV parsing (handles quoted fields)
    const fields = parseCSVLine(line);
    
    if (fields.length < 7) {
      throw new Error(`Row ${i + 2}: Insufficient columns. Expected at least 7 columns.`);
    }

    // Validate required fields
    const [deptCode, courseNum, name, year, semester, section, type, day, startTime, endTime] = fields;
    
    if (!deptCode.trim()) {
      throw new Error(`Row ${i + 2}: Department Code is required`);
    }
    if (!courseNum.trim()) {
      throw new Error(`Row ${i + 2}: Course Number is required`);
    }
    if (!name.trim()) {
      throw new Error(`Row ${i + 2}: Course Name is required`);
    }
    if (!year.trim() || isNaN(Number(year))) {
      throw new Error(`Row ${i + 2}: Valid year is required`);
    }
    if (!semester.trim()) {
      throw new Error(`Row ${i + 2}: Semester is required`);
    }
    if (!section.trim()) {
      throw new Error(`Row ${i + 2}: Section is required`);
    }
    if (!type.trim()) {
      throw new Error(`Row ${i + 2}: Section Type is required`);
    }

    sections.push({
      deptCode: deptCode.trim(),
      courseNum: courseNum.trim(),
      name: name.trim(),
      year: Number(year.trim()),
      semester: semester.trim(),
      section: section.trim(),
      type: type.trim(),
      day: day?.trim() || undefined,
      startTime: startTime?.trim() || undefined,
      endTime: endTime?.trim() || undefined,
    });
  }

  return sections;
}

// Helper function to parse a single CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Double quote escape
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  fields.push(current);
  
  return fields;
}

// Helper function to generate CSV template
export function generateCSVTemplate(): string {
  const headers = [
    'Department Code',
    'Course Number', 
    'Course Name',
    'Year',
    'Semester',
    'Section',
    'Type',
    'Day (Optional)',
    'Start Time (Optional)',
    'End Time (Optional)',
  ];

  const sampleData = [
    'COSC',
    '111',
    'Introduction to Programming',
    '2025',
    'W1',
    '001',
    'Lecture',
    'Monday',
    '14:00',
    '15:30',
  ];

  return [headers, sampleData]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\r\n');
}

// Helper function to download CSV template
export function downloadCSVTemplate(filename = 'section_import_template.csv') {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
