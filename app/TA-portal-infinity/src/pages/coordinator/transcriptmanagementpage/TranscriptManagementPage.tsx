import React, { useState, useEffect } from 'react';
import { Download, Eye, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { StatusIndicator } from '../../../components/ui/statusindicator/StatusIndicator';
import { fetchAllTranscripts, downloadTranscript, type TranscriptInfo as ApiTranscriptInfo } from '../../../api/transcript/transcriptApi';

interface TranscriptInfo extends ApiTranscriptInfo {}

interface TranscriptManagementPageProps {}

const TranscriptManagementPage: React.FC<TranscriptManagementPageProps> = () => {
  const { token } = useAuth();
  const [transcripts, setTranscripts] = useState<TranscriptInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TranscriptInfo>('uploadDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTranscripts();
  }, [token]);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTranscripts(token!);
      setTranscripts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load transcripts');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (transcriptId: number, fileName: string) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(transcriptId));
      
      await downloadTranscript(transcriptId, fileName, token!);

      toast.success('Transcript downloaded successfully');
    } catch (err) {
      toast.error('Failed to download transcript');
      console.error('Download error:', err);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(transcriptId);
        return newSet;
      });
    }
  };

  const handleSort = (field: keyof TranscriptInfo) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedTranscripts = transcripts
    .filter(transcript => 
      transcript.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transcript.studentNumber.includes(searchTerm) ||
      transcript.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const SortIcon = ({ field }: { field: keyof TranscriptInfo }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatusIndicator loading={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Transcripts
          </h1>
          <p className="text-gray-600 text-lg">
            Review and download official academic transcripts submitted by TA applicants
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student name, email, student number, or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>Total: {filteredAndSortedTranscripts.length} transcripts</span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchTranscripts}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Transcripts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredAndSortedTranscripts.length === 0 ? (
            <div className="p-8 text-center">
              <Eye className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transcripts found</h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria or clearing the search to see all transcripts.' 
                  : 'No students have uploaded transcripts yet. Students can upload their transcripts through their application portal.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('studentName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Student</span>
                        <SortIcon field="studentName" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('studentNumber')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Student #</span>
                        <SortIcon field="studentNumber" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('fileName')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>File Name</span>
                        <SortIcon field="fileName" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('fileSize')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Size</span>
                        <SortIcon field="fileSize" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('uploadDate')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Upload Date</span>
                        <SortIcon field="uploadDate" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedTranscripts.map((transcript) => (
                    <tr key={transcript.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {transcript.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transcript.studentEmail}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transcript.studentNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs" title={transcript.fileName}>
                          {transcript.fileName}
                        </div>
                        <div className="text-xs text-gray-500">PDF</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatFileSize(transcript.fileSize)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(transcript.uploadDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDownload(transcript.id, transcript.fileName)}
                          disabled={downloadingIds.has(transcript.id)}
                          className={`inline-flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors ${
                            downloadingIds.has(transcript.id)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#040941] text-white hover:bg-[#040941]/90'
                          }`}
                        >
                          <Download className="w-4 h-4" />
                          <span>
                            {downloadingIds.has(transcript.id) ? 'Downloading...' : 'Download'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredAndSortedTranscripts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">
                {filteredAndSortedTranscripts.length}
              </div>
              <div className="text-sm text-gray-500">Total Transcripts</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  filteredAndSortedTranscripts.reduce((sum, t) => sum + t.fileSize, 0)
                )}
              </div>
              <div className="text-sm text-gray-500">Total Size</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-900">
                {formatFileSize(
                  filteredAndSortedTranscripts.reduce((sum, t) => sum + t.fileSize, 0) / 
                  filteredAndSortedTranscripts.length
                )}
              </div>
              <div className="text-sm text-gray-500">Average Size</div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Transcript Review Guidelines:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Academic Standing:</strong> Verify the student meets minimum GPA requirements for TA positions</li>
            <li>• <strong>Course History:</strong> Check for relevant coursework in the subject area they're applying to assist with</li>
            <li>• <strong>Prerequisites:</strong> Ensure completion of required prerequisite courses for advanced TA roles</li>
            <li>• <strong>File Quality:</strong> All transcripts are in PDF format and should be clear and readable</li>
            <li>• <strong>Privacy:</strong> Handle all student academic records with confidentiality and in accordance with FERPA guidelines</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TranscriptManagementPage;
