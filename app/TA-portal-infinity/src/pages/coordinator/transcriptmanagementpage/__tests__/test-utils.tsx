import React from 'react';
import { render } from '@testing-library/react';
import { AuthContext } from '../../../../context/AuthContext';
import { UserRole } from '../../../../interfaces/enum/UserRole';
import type { TranscriptInfo } from '../../../../api/transcript/transcriptApi';

// Mock data
export const mockTranscripts: TranscriptInfo[] = [
  {
    transcriptId: 1,
    id: 1,
    studentId: 101,
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    studentNumber: '12345',
    fileName: 'john_transcript.pdf',
    uploadDate: '2024-01-15',
    fileSize: 1024,
    contentType: 'application/pdf',
    reviewStatus: 'UNDER_REVIEW' as const,
    reviewComments: '',
    reviewedBy: undefined,
    reviewerName: undefined,
    reviewDate: undefined,
  },
  {
    transcriptId: 2,
    id: 2,
    studentId: 102,
    studentName: 'Jane Smith',
    studentEmail: 'jane@example.com',
    studentNumber: '67890',
    fileName: 'jane_transcript.pdf',
    uploadDate: '2024-01-16',
    fileSize: 2048,
    contentType: 'application/pdf',
    reviewStatus: 'APPROVED' as const,
    reviewComments: 'Excellent academic record',
    reviewedBy: 1,
    reviewerName: 'Admin User',
    reviewDate: '2024-01-17',
  },
];

export const mockAuthContextValue = {
  token: 'test-token',
  login: () => {},
  logout: () => {},
  isAuthenticated: true,
  userRoles: [UserRole.COORDINATOR],
  userId: 1,
};

export const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      {component}
    </AuthContext.Provider>
  );
};
