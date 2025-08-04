import type { TranscriptInfo } from '../../api/transcript/transcriptApi';

// Interface for CSV export data
export interface TranscriptCsvData {
  studentName: string;
  studentNumber: string;
  studentEmail: string;
  fileName: string;
  uploadDate: string;
  reviewStatus: string;
  reviewComments: string;
  reviewerName: string;
  reviewDate: string;
}

// Convert transcript data to CSV format
export function convertTranscriptsToCSV(transcripts: TranscriptInfo[]): TranscriptCsvData[] {
  return transcripts.map(transcript => ({
    studentName: transcript.studentName,
    studentNumber: transcript.studentNumber,
    studentEmail: transcript.studentEmail,
    fileName: transcript.fileName,
    uploadDate: new Date(transcript.uploadDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    reviewStatus: getStatusLabel(transcript.reviewStatus),
    reviewComments: transcript.reviewComments || '',
    reviewerName: transcript.reviewerName || '',
    reviewDate: transcript.reviewDate ? new Date(transcript.reviewDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : ''
  }));
}

// Convert TranscriptInfo status to readable label
function getStatusLabel(status: TranscriptInfo['reviewStatus']): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'UNDER_REVIEW':
      return 'Under Review';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    case 'NEEDS_CLARIFICATION':
      return 'Needs Clarification';
    default:
      return 'Pending';
  }
}

// Generate CSV content from transcript data
export function generateCSVContent(transcripts: TranscriptCsvData[]): string {
  if (!transcripts || transcripts.length === 0) {
    return '';
  }

  // CSV Headers
  const headers = [
    'Student Name',
    'Student Number',
    'Student Email',
    'File Name',
    'Upload Date',
    'Review Status',
    'Review Comments',
    'Reviewer Name',
    'Review Date'
  ];

  // Convert data to CSV rows
  const csvRows = transcripts.map(transcript => [
    transcript.studentName,
    transcript.studentNumber,
    transcript.studentEmail,
    transcript.fileName,
    transcript.uploadDate,
    transcript.reviewStatus,
    transcript.reviewComments,
    transcript.reviewerName,
    transcript.reviewDate
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

  return csvContent;
}

// Download CSV file
export function downloadTranscriptsCSV(transcripts: TranscriptInfo[], filename?: string): void {
  const csvData = convertTranscriptsToCSV(transcripts);
  const csvContent = generateCSVContent(csvData);
  
  if (!csvContent) {
    console.warn('No data to export');
    return;
  }

  // Create and download CSV blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `transcripts_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
