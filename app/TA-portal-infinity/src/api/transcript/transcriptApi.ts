export interface TranscriptInfo {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  studentNumber: string;
  fileName: string;
  uploadDate: string;
  fileSize: number;
  contentType: string;
  // Review workflow fields
  reviewStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_CLARIFICATION';
  reviewComments?: string;
  reviewedBy?: number;
  reviewDate?: string;
  reviewerName?: string;
}

export interface TranscriptReview {
  transcriptId: number;
  reviewStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_CLARIFICATION';
  reviewComments: string;
}

export async function fetchAllTranscripts(token: string): Promise<TranscriptInfo[]> {
  const response = await fetch('http://localhost:8080/transcripts/list', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcripts');
  }

  return response.json();
}

export async function downloadTranscript(
  transcriptId: number, 
  fileName: string, 
  token: string
): Promise<void> {
  const response = await fetch(`http://localhost:8080/transcripts/download/${transcriptId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to download transcript');
  }

  // Create blob and download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function fetchTranscriptForPreview(
  transcriptId: number,
  token: string
): Promise<string> {
  const response = await fetch(`http://localhost:8080/transcripts/download/${transcriptId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcript for preview');
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

export async function updateTranscriptReview(
  review: TranscriptReview,
  token: string
): Promise<void> {
  const response = await fetch(`http://localhost:8080/transcripts/review/${review.transcriptId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(review),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update transcript review: ${response.status} ${errorText}`);
  }
}
