export interface TranscriptInfo {
  transcriptId: number;
  id: number; // For backward compatibility, map transcriptId to id (required)
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

  const data = await response.json();
  
  // Map transcriptId to id for backward compatibility
  return data.map((transcript: any) => ({
    ...transcript,
    id: transcript.transcriptId
  }));
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
  try {
    console.log('Sending review update:', review); // Debug log
    
    const response = await fetch(`http://localhost:8080/transcripts/review/${review.transcriptId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcriptId: review.transcriptId,
        reviewStatus: review.reviewStatus,
        reviewComments: review.reviewComments
      }),
    });

    console.log('Response status:', response.status); // Debug log
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText); // Debug log
      throw new Error(`Failed to update transcript review: ${response.status} ${errorText}`);
    }
    
    const responseText = await response.text();
    console.log('Success response:', responseText); // Debug log
  } catch (error) {
    console.error('Network error:', error); // Debug log
    throw error;
  }
}
