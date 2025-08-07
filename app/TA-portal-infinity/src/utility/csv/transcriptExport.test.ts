import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  convertTranscriptsToCSV, 
  generateCSVContent, 
  downloadTranscriptsCSV 
} from './transcriptExport';
import type { TranscriptInfo } from '../../api/transcript/transcriptApi';

// Mock URL and document APIs for testing
const createObjectURLMock = vi.fn();
const revokeObjectURLMock = vi.fn();
const appendChildMock = vi.fn();
const removeChildMock = vi.fn();
const clickMock = vi.fn();

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: createObjectURLMock,
    revokeObjectURL: revokeObjectURLMock,
  },
  writable: true,
});

Object.defineProperty(document, 'createElement', {
  value: vi.fn(() => ({
    href: '',
    download: '',
    click: clickMock,
  })),
  writable: true,
});

Object.defineProperty(document.body, 'appendChild', {
  value: appendChildMock,
  writable: true,
});

Object.defineProperty(document.body, 'removeChild', {
  value: removeChildMock,
  writable: true,
});

describe('transcriptExport', () => {
  const mockTranscript: TranscriptInfo = {
    transcriptId: 1,
    id: 1,
    studentId: 100,
    studentName: 'John Doe',
    studentEmail: 'john.doe@example.com',
    studentNumber: '12345678',
    fileName: 'transcript.pdf',
    uploadDate: '2024-01-15T10:30:00Z',
    fileSize: 1024000,
    contentType: 'application/pdf',
    reviewStatus: 'PENDING',
    reviewComments: 'Initial submission',
    reviewedBy: 2,
    reviewDate: '2024-01-16T09:00:00Z',
    reviewerName: 'Dr. Smith'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    createObjectURLMock.mockReturnValue('blob:mock-url');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('convertTranscriptsToCSV', () => {
    it('converts single transcript to CSV data', () => {
      const result = convertTranscriptsToCSV([mockTranscript]);

      expect(result).toHaveLength(1);
      const csvData = result[0];
      
      expect(csvData.studentName).toBe('John Doe');
      expect(csvData.studentNumber).toBe('12345678');
      expect(csvData.studentEmail).toBe('john.doe@example.com');
      expect(csvData.fileName).toBe('transcript.pdf');
      expect(csvData.reviewStatus).toBe('Pending');
      expect(csvData.reviewComments).toBe('Initial submission');
      expect(csvData.reviewerName).toBe('Dr. Smith');
    });

    it('formats dates correctly', () => {
      const result = convertTranscriptsToCSV([mockTranscript]);
      const csvData = result[0];
      
      // Upload date formatting
      const uploadDate = csvData.uploadDate;
      expect(uploadDate).toMatch(/Jan 15, 2024/);
      expect(uploadDate).toMatch(/\d{2}:\d{2}/); // Contains time format
      
      // Review date formatting
      const reviewDate = csvData.reviewDate;
      expect(reviewDate).toMatch(/Jan 16, 2024/);
      expect(reviewDate).toMatch(/\d{2}:\d{2}/); // Contains time format
    });

    it('handles multiple transcripts', () => {
      const transcripts = [
        mockTranscript,
        { ...mockTranscript, transcriptId: 2, id: 2, studentName: 'Jane Smith' }
      ];
      
      const result = convertTranscriptsToCSV(transcripts);
      
      expect(result).toHaveLength(2);
      expect(result[0].studentName).toBe('John Doe');
      expect(result[1].studentName).toBe('Jane Smith');
    });

    it('handles missing optional fields', () => {
      const transcriptWithoutOptionals: TranscriptInfo = {
        ...mockTranscript,
        reviewComments: undefined,
        reviewerName: undefined,
        reviewDate: undefined
      };
      
      const result = convertTranscriptsToCSV([transcriptWithoutOptionals]);
      const csvData = result[0];
      
      expect(csvData.reviewComments).toBe('');
      expect(csvData.reviewerName).toBe('');
      expect(csvData.reviewDate).toBe('');
    });

    it('converts all review statuses correctly', () => {
      const statuses: Array<TranscriptInfo['reviewStatus']> = [
        'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CLARIFICATION'
      ];
      const expectedLabels = [
        'Pending', 'Under Review', 'Approved', 'Rejected', 'Needs Clarification'
      ];
      
      statuses.forEach((status, index) => {
        const transcript = { ...mockTranscript, reviewStatus: status };
        const result = convertTranscriptsToCSV([transcript]);
        expect(result[0].reviewStatus).toBe(expectedLabels[index]);
      });
    });

    it('handles unknown review status with default', () => {
      const transcript = { ...mockTranscript, reviewStatus: 'UNKNOWN_STATUS' as any };
      const result = convertTranscriptsToCSV([transcript]);
      expect(result[0].reviewStatus).toBe('Pending');
    });

    it('handles empty array', () => {
      const result = convertTranscriptsToCSV([]);
      expect(result).toEqual([]);
    });
  });

  describe('generateCSVContent', () => {
    it('generates CSV content correctly', () => {
      const csvData = convertTranscriptsToCSV([mockTranscript]);
      const csvContent = generateCSVContent(csvData);
      
      // Test headers and single row data
      expect(csvContent).toContain('"Student Name","Student Number","Student Email"');
      expect(csvContent).toContain('"John Doe","12345678","john.doe@example.com"');
      expect(csvContent).toContain('"transcript.pdf"');
      expect(csvContent).toContain('"Pending"');
      
      // Test multiple rows
      const multipleTranscripts = [
        mockTranscript,
        { ...mockTranscript, transcriptId: 2, id: 2, studentName: 'Jane Smith' }
      ];
      
      const multiCsvData = convertTranscriptsToCSV(multipleTranscripts);
      const multiCsvContent = generateCSVContent(multiCsvData);
      
      const lines = multiCsvContent.split('\r\n');
      expect(lines).toHaveLength(3); // header + 2 data rows
      expect(lines[0]).toContain('Student Name');
      expect(lines[1]).toContain('John Doe');
      expect(lines[2]).toContain('Jane Smith');
    });

    it('handles empty and invalid data', () => {
      // Test empty array for CSV generation
      const emptyContent = generateCSVContent([]);
      expect(emptyContent).toBe('');
      
      // Test null/undefined input for CSV generation
      const nullContent = generateCSVContent(null as any);
      const undefinedContent = generateCSVContent(undefined as any);
      expect(nullContent).toBe('');
      expect(undefinedContent).toBe('');
    });

    it('properly escapes quotes in data', () => {
      const transcriptWithQuotes: TranscriptInfo = {
        ...mockTranscript,
        studentName: 'John "Johnny" Doe',
        reviewComments: 'Good work, but needs "improvement"'
      };
      
      const csvData = convertTranscriptsToCSV([transcriptWithQuotes]);
      const csvContent = generateCSVContent(csvData);
      
      expect(csvContent).toContain('"John ""Johnny"" Doe"');
      expect(csvContent).toContain('"Good work, but needs ""improvement"""');
    });

    it('handles special characters in data', () => {
      const transcriptWithSpecialChars: TranscriptInfo = {
        ...mockTranscript,
        studentName: 'José María',
        reviewComments: 'Contains, commas and\nnewlines'
      };
      
      const csvData = convertTranscriptsToCSV([transcriptWithSpecialChars]);
      const csvContent = generateCSVContent(csvData);
      
      expect(csvContent).toContain('"José María"');
      expect(csvContent).toContain('"Contains, commas and\nnewlines"');
    });
  });

  describe('downloadTranscriptsCSV', () => {
    it('creates and downloads CSV file correctly', () => {
      downloadTranscriptsCSV([mockTranscript]);
      
      // Test blob creation with correct content type
      expect(createObjectURLMock).toHaveBeenCalledWith(expect.any(Blob));
      const blobCall = createObjectURLMock.mock.calls[0][0];
      expect(blobCall.type).toBe('text/csv;charset=utf-8;');
      
      // Test download process
      expect(appendChildMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalled();
      
      // Test multiple transcripts handling
      const transcripts = [
        mockTranscript,
        { ...mockTranscript, transcriptId: 2, id: 2, studentName: 'Jane Smith' }
      ];
      
      downloadTranscriptsCSV(transcripts);
      expect(createObjectURLMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
    });

    it('warns and returns early for empty data', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      downloadTranscriptsCSV([]);
      
      expect(consoleSpy).toHaveBeenCalledWith('No data to export');
      expect(createObjectURLMock).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('integration tests', () => {
    it('complete workflow from transcript to download', () => {
      const transcripts = [mockTranscript];
      
      downloadTranscriptsCSV(transcripts, 'test-export.csv');
      
      // Verify the entire workflow
      expect(createObjectURLMock).toHaveBeenCalled();
      
      const blob = createObjectURLMock.mock.calls[0][0];
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/csv;charset=utf-8;');
      
      expect(appendChildMock).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(removeChildMock).toHaveBeenCalled();
      expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
    });

    it('handles complex transcript data end-to-end', () => {
      const complexTranscript: TranscriptInfo = {
        ...mockTranscript,
        studentName: 'María José "Quotes" Smith',
        reviewComments: 'Complex, data with\nspecial chars & symbols!',
        reviewStatus: 'NEEDS_CLARIFICATION'
      };
      
      const csvData = convertTranscriptsToCSV([complexTranscript]);
      const csvContent = generateCSVContent(csvData);
      
      expect(csvContent).toContain('"María José ""Quotes"" Smith"');
      expect(csvContent).toContain('"Needs Clarification"');
      expect(csvContent).toContain('"Complex, data with\nspecial chars & symbols!"');
      
      // Verify it can be downloaded
      downloadTranscriptsCSV([complexTranscript]);
      expect(createObjectURLMock).toHaveBeenCalled();
    });
  });
});
