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
