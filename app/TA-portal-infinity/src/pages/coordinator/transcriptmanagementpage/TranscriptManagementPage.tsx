import React, { useState, useEffect } from 'react';
import { Download, Eye, Search, Filter, ChevronDown, ChevronUp, Maximize2, X, Loader2, User, Mail, Hash, Edit3, Check, AlertTriangle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { StatusIndicator } from '../../../components/ui/statusindicator/StatusIndicator';
import { fetchAllTranscripts, downloadTranscript, fetchTranscriptForPreview, updateTranscriptReview, type TranscriptInfo as ApiTranscriptInfo, type TranscriptReview } from '../../../api/transcript/transcriptApi';

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
  
  // Preview functionality states
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  
  // Tab view state
  const [activeView, setActiveView] = useState<'table' | 'preview'>('table');
  
  // Review functionality states
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [reviewStatus, setReviewStatus] = useState<TranscriptInfo['reviewStatus']>('PENDING');
  const [reviewComments, setReviewComments] = useState('');
  const [updatingReview, setUpdatingReview] = useState(false);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<TranscriptInfo['reviewStatus'] | 'ALL'>('ALL');
  
  // Bulk selection states
  const [selectedTranscripts, setSelectedTranscripts] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchTranscripts();
  }, [token]);

  // Cleanup preview URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (fullscreenUrl) {
        URL.revokeObjectURL(fullscreenUrl);
      }
    };
  }, []); // Remove dependencies to only run on unmount

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullscreen) {
        closeFullscreen();
      }
    };

    if (showFullscreen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showFullscreen]);

  // Cleanup URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      // Don't cleanup fullscreenUrl here as it's managed by closeFullscreen
    };
  }, []);

  // Restore preview when returning to preview view
  useEffect(() => {
    if (activeView === 'preview' && selectedTranscript && !previewUrl && !loadingPreview && token) {
      const restorePreview = async () => {
        try {
          setLoadingPreview(true);
          const url = await fetchTranscriptForPreview(selectedTranscript.id, token);
          setPreviewUrl(url);
        } catch (err) {
          console.error('Failed to restore preview:', err);
          toast.error('Failed to restore preview');
          setActiveView('table');
        } finally {
          setLoadingPreview(false);
        }
      };
      restorePreview();
    }
  }, [activeView, selectedTranscript, previewUrl, loadingPreview, token]);

  const fetchTranscripts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllTranscripts(token!);
      setTranscripts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast.error('Failed to load transcripts');
      console.error('Fetch transcripts error:', err);
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

  const handlePreview = async (transcript: TranscriptInfo) => {
    if (!token) return;
    
    // Prevent multiple preview requests for the same transcript
    if (loadingPreview) {
      return;
    }
    
    // If the same transcript is already selected and previewed, just switch to preview tab
    if (selectedTranscript?.id === transcript.id && previewUrl) {
      setActiveView('preview');
      return;
    }

    try {
      setLoadingPreview(true);
      setSelectedTranscript(transcript);
      
      // Clean up previous preview URL only if it's for a different transcript
      if (previewUrl && selectedTranscript?.id !== transcript.id) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const url = await fetchTranscriptForPreview(transcript.id, token);
      setPreviewUrl(url);
      setActiveView('preview'); // Switch to preview tab
      
      toast.success('Preview loaded successfully');
    } catch (err) {
      toast.error('Failed to load preview');
      console.error('Preview error:', err);
      setSelectedTranscript(null);
      setPreviewUrl(null);
      setActiveView('table');
    } finally {
      setLoadingPreview(false);
    }
  };

  const openFullscreen = async (_url: string) => {
    if (!selectedTranscript || !token) return;
    
    try {
      // Create a new URL for fullscreen to avoid conflicts
      const fullscreenBlobUrl = await fetchTranscriptForPreview(selectedTranscript.id, token);
      setFullscreenUrl(fullscreenBlobUrl);
      setShowFullscreen(true);
    } catch (err) {
      toast.error('Failed to open fullscreen preview');
      console.error('Fullscreen preview error:', err);
    }
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
    // Clean up fullscreen URL when closing
    if (fullscreenUrl) {
      URL.revokeObjectURL(fullscreenUrl);
      setFullscreenUrl(null);
    }
  };

  const startEditingReview = (transcript: TranscriptInfo) => {
    setEditingReview(transcript.id);
    setReviewStatus(transcript.reviewStatus || 'PENDING');
    setReviewComments(transcript.reviewComments || '');
  };

  const cancelEditingReview = () => {
    setEditingReview(null);
    setReviewStatus('PENDING');
    setReviewComments('');
  };

  const handleUpdateReview = async (transcriptId: number) => {
    if (!token) return;

    try {
      setUpdatingReview(true);
      
      const reviewData: TranscriptReview = {
        transcriptId,
        reviewStatus,
        reviewComments
      };

      await updateTranscriptReview(reviewData, token);
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh transcripts list from server
      await fetchTranscripts();
      
      // Clear editing state
      setEditingReview(null);
      setReviewStatus('PENDING');
      setReviewComments('');
      
      toast.success('Review updated successfully');
    } catch (err) {
      toast.error('Failed to update review');
      console.error('Review update error:', err);
    } finally {
      setUpdatingReview(false);
    }
  };

  const getStatusIcon = (status: TranscriptInfo['reviewStatus']) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'UNDER_REVIEW':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'APPROVED':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'NEEDS_CLARIFICATION':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status: TranscriptInfo['reviewStatus']) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'NEEDS_CLARIFICATION':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: TranscriptInfo['reviewStatus']) => {
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
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTranscripts(new Set());
      setSelectAll(false);
    } else {
      const allVisibleIds = new Set(filteredAndSortedTranscripts.map(t => t.id));
      setSelectedTranscripts(allVisibleIds);
      setSelectAll(true);
    }
  };

  const handleSelectTranscript = (transcriptId: number) => {
    const newSelected = new Set(selectedTranscripts);
    if (newSelected.has(transcriptId)) {
      newSelected.delete(transcriptId);
    } else {
      newSelected.add(transcriptId);
    }
    setSelectedTranscripts(newSelected);
    setSelectAll(newSelected.size === filteredAndSortedTranscripts.length);
  };

  const handleBulkStatusUpdate = async (newStatus: TranscriptInfo['reviewStatus']) => {
    if (!token || selectedTranscripts.size === 0) return;

    try {
      setUpdatingReview(true);
      
      // Update all selected transcripts
      const updatePromises = Array.from(selectedTranscripts).map(transcriptId => {
        const reviewData: TranscriptReview = {
          transcriptId,
          reviewStatus: newStatus,
          reviewComments: `Bulk updated to ${getStatusLabel(newStatus)}`
        };
        return updateTranscriptReview(reviewData, token);
      });

      await Promise.all(updatePromises);
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh transcripts list from server
      await fetchTranscripts();
      
      // Clear selection
      setSelectedTranscripts(new Set());
      setSelectAll(false);
      
      toast.success(`Updated ${selectedTranscripts.size} transcript(s) to ${getStatusLabel(newStatus)}`);
    } catch (err) {
      toast.error('Failed to update selected transcripts');
      console.error('Bulk update error:', err);
    } finally {
      setUpdatingReview(false);
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
    .filter(transcript => {
      // Search filter
      const matchesSearch = transcript.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transcript.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transcript.studentNumber.includes(searchTerm) ||
        transcript.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'ALL' || transcript.reviewStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
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

  // Reset selection when filters change
  useEffect(() => {
    setSelectedTranscripts(new Set());
    setSelectAll(false);
  }, [searchTerm, statusFilter]);

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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <StatusIndicator loading={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Transcripts
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Review and download official academic transcripts submitted by TA applicants
          </p>
          
          {/* Operation Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">How to use this page:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span><strong>Search & Filter:</strong> Use the search bar to find specific students or filter by review status</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span><strong>Individual Review:</strong> Click "Review" button to edit status and add comments</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span><strong>Bulk Operations:</strong> Select multiple transcripts using checkboxes for batch status updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span><strong>Preview:</strong> Click "Preview" to view transcript content in a separate tab</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>•</span>
                <span><strong>Download:</strong> Use the download button to save transcript files locally</span>
              </div>
            </div>
          </div>
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
            
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TranscriptInfo['reviewStatus'] | 'ALL')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="NEEDS_CLARIFICATION">Needs Clarification</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: {filteredAndSortedTranscripts.length} transcripts</span>
              {selectedTranscripts.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-medium">
                    {selectedTranscripts.size} selected
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-500">Bulk update:</span>
                    <button
                      onClick={() => handleBulkStatusUpdate('UNDER_REVIEW')}
                      disabled={updatingReview}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('APPROVED')}
                      disabled={updatingReview}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 border border-green-300 rounded hover:bg-green-200 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('REJECTED')}
                      disabled={updatingReview}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleBulkStatusUpdate('NEEDS_CLARIFICATION')}
                      disabled={updatingReview}
                      className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 border border-yellow-300 rounded hover:bg-yellow-200 disabled:opacity-50"
                    >
                      Needs Clarification
                    </button>
                  </div>
                </div>
              )}
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

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveView('table')}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'table'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transcripts List ({filteredAndSortedTranscripts.length})
              </button>
              <button
                onClick={() => setActiveView('preview')}
                disabled={!selectedTranscript || !previewUrl}
                className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'preview' && selectedTranscript && previewUrl
                    ? 'border-blue-500 text-blue-600'
                    : selectedTranscript && previewUrl
                    ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    : 'border-transparent text-gray-400 cursor-not-allowed'
                }`}
              >
                Preview {selectedTranscript ? `- ${selectedTranscript.studentName}` : ''}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Table View */}
          {activeView === 'table' && (
            <>
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
                      <th className="px-3 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
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
                        onClick={() => handleSort('uploadDate')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Upload Date</span>
                          <SortIcon field="uploadDate" />
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('reviewStatus')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <SortIcon field="reviewStatus" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedTranscripts.map((transcript) => (
                      <React.Fragment key={transcript.id}>
                        <tr 
                          className={`hover:bg-gray-50 transition-colors ${
                            selectedTranscript?.id === transcript.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <td className="px-3 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedTranscripts.has(transcript.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleSelectTranscript(transcript.id);
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
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
                            {formatDate(transcript.uploadDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingReview === transcript.id ? (
                              /* Editing mode - Status dropdown */
                              <select
                                value={reviewStatus}
                                onChange={(e) => setReviewStatus(e.target.value as TranscriptInfo['reviewStatus'])}
                                className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="NEEDS_CLARIFICATION">Needs Clarification</option>
                              </select>
                            ) : (
                              /* Display mode - Status badge with comments */
                              <div className="space-y-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(transcript.reviewStatus || 'PENDING')}`}>
                                  {getStatusIcon(transcript.reviewStatus || 'PENDING')}
                                  <span className="ml-1">{getStatusLabel(transcript.reviewStatus || 'PENDING')}</span>
                                </span>
                                {transcript.reviewComments && (
                                  <div className="text-xs text-gray-600 max-w-xs">
                                    <div className="bg-blue-50 rounded px-2 py-1 border border-blue-200">
                                      <div className="font-medium text-gray-900 mb-1">Comment:</div>
                                      <div 
                                        className="truncate cursor-help text-gray-800" 
                                        title={transcript.reviewComments}
                                        style={{ maxWidth: '240px' }}
                                      >
                                        {transcript.reviewComments}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {/* Review Action - Only show for non-editing rows */}
                              {editingReview !== transcript.id ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingReview(transcript);
                                  }}
                                  className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                                >
                                  <Edit3 className="w-3 h-3" />
                                  <span>Review</span>
                                </button>
                              ) : (
                                /* Editing controls */
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateReview(transcript.id);
                                    }}
                                    disabled={updatingReview}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300 disabled:opacity-50"
                                  >
                                    {updatingReview ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                    <span className="ml-1">Save</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      cancelEditingReview();
                                    }}
                                    disabled={updatingReview}
                                    className="inline-flex items-center px-2 py-1 rounded text-xs transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 disabled:opacity-50"
                                  >
                                    <X className="w-3 h-3" />
                                    <span className="ml-1">Cancel</span>
                                  </button>
                                </div>
                              )}
                              
                              {/* Preview Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreview(transcript);
                                }}
                                disabled={loadingPreview && selectedTranscript?.id === transcript.id}
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                                  selectedTranscript?.id === transcript.id
                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {loadingPreview && selectedTranscript?.id === transcript.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                                <span>
                                  {loadingPreview && selectedTranscript?.id === transcript.id 
                                    ? 'Loading...' 
                                    : 'Preview'
                                  }
                                </span>
                              </button>
                              
                              {/* Download Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(transcript.id, transcript.fileName);
                                }}
                                disabled={downloadingIds.has(transcript.id)}
                                className={`inline-flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                                  downloadingIds.has(transcript.id)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-[#040941] text-white hover:bg-[#040941]/90'
                                }`}
                              >
                                <Download className="w-3 h-3" />
                                <span>
                                  {downloadingIds.has(transcript.id) ? 'Downloading...' : 'Download'}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expandable comment row when editing */}
                        {editingReview === transcript.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Review Comments
                                  </label>
                                  <textarea
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    placeholder="Add your review comments here..."
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                </div>
                                <div className="text-xs text-gray-500">
                                  Last updated: {transcript.reviewDate ? formatDate(transcript.reviewDate) : 'Never'} 
                                  {transcript.reviewerName && ` by ${transcript.reviewerName}`}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Preview View */}
        {activeView === 'preview' && selectedTranscript && previewUrl && (
          <div className="h-screen flex flex-col">
            {/* Preview Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">Transcript Preview</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedTranscript.studentName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>{selectedTranscript.studentNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{selectedTranscript.studentEmail}</span>
                    </div>
                  </div>
                  {/* Review Status and Comments in Preview */}
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">Review Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(selectedTranscript.reviewStatus || 'PENDING')}`}>
                          {getStatusIcon(selectedTranscript.reviewStatus || 'PENDING')}
                          <span className="ml-1">{getStatusLabel(selectedTranscript.reviewStatus || 'PENDING')}</span>
                        </span>
                      </div>
                    </div>
                    {selectedTranscript.reviewComments && (
                      <div>
                        <span className="text-sm font-medium text-gray-900 block mb-2">Comments:</span>
                        <div className="text-sm text-gray-800 bg-white p-3 rounded border border-blue-200 max-h-32 overflow-y-auto">
                          {selectedTranscript.reviewComments}
                        </div>
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {selectedTranscript.reviewDate ? formatDate(selectedTranscript.reviewDate) : 'Never'}
                      {selectedTranscript.reviewerName && ` by ${selectedTranscript.reviewerName}`}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setActiveView('table')}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded border border-gray-300 transition-colors flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Back to List</span>
                  </button>
                  <button
                    onClick={() => openFullscreen(previewUrl)}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded border border-blue-300 transition-colors flex items-center space-x-1"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Fullscreen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 p-4 flex flex-col">
              {/* File Info Header */}
              <div className="mb-3 text-center">
                <div className="text-sm font-medium text-gray-900">
                  {selectedTranscript.fileName}
                </div>
                <div className="text-xs text-gray-600">
                  Uploaded: {formatDate(selectedTranscript.uploadDate)}
                </div>
              </div>
              
              {/* PDF Preview */}
              <div className="flex-1 border border-gray-300 rounded overflow-hidden bg-white">
                <iframe
                  src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                  className="w-full h-full border-0 bg-white"
                  title={`Transcript Preview - ${selectedTranscript.studentName}`}
                  style={{ minHeight: '500px' }}
                />
              </div>
            </div>
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

        {/* Fullscreen Modal */}
        {showFullscreen && fullscreenUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full h-full max-w-screen-2xl max-h-screen p-4">
              <div className="bg-white rounded-lg shadow-2xl h-full flex flex-col">
                {/* Fullscreen Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Transcript Preview - {selectedTranscript?.studentName}
                    </h2>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedTranscript?.fileName}
                    </p>
                    {/* Review Status in Fullscreen */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">Review Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(selectedTranscript?.reviewStatus || 'PENDING')}`}>
                          {getStatusIcon(selectedTranscript?.reviewStatus || 'PENDING')}
                          <span className="ml-1">{getStatusLabel(selectedTranscript?.reviewStatus || 'PENDING')}</span>
                        </span>
                      </div>
                      {selectedTranscript?.reviewComments && (
                        <div className="flex items-start space-x-2">
                          <span className="text-sm font-medium text-gray-900">Comments:</span>
                          <div className="text-sm text-gray-800 bg-blue-50 px-3 py-1 rounded border border-blue-200 max-w-md">
                            <div className="max-h-16 overflow-y-auto" title={selectedTranscript.reviewComments}>
                              {selectedTranscript.reviewComments}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeFullscreen}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
                
                {/* Fullscreen Content */}
                <div className="flex-1 p-4 flex flex-col">
                  {/* File Info Header */}
                  <div className="mb-3 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {selectedTranscript?.fileName}
                    </div>
                    <div className="text-xs text-gray-600">
                      Uploaded: {selectedTranscript ? formatDate(selectedTranscript.uploadDate) : ''}
                    </div>
                  </div>
                  
                  {/* PDF Preview */}
                  <div className="flex-1 border border-gray-300 rounded overflow-hidden bg-white">
                    <iframe
                      src={`${fullscreenUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="w-full h-full border-0 bg-white"
                      title={`Fullscreen Transcript - ${selectedTranscript?.studentName}`}
                      style={{ minHeight: '600px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptManagementPage;
