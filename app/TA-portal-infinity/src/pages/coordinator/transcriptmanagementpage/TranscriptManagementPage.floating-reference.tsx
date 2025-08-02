/**
 * TranscriptManagementPage - Floating Preview Reference Implementation
 * 
 * This is a reference implementation of the floating/draggable preview approach
 * that was considered during development. The main implementation uses a 
 * tab-based approach instead.
 * 
 * 🔗 Access URLs:
 * - Main (Tab-based):     /user/coordinator/transcripts
 * - Reference (Floating): /user/coordinator/transcripts-floating
 * 
 * Features demonstrated in this reference:
 * - Draggable floating preview panel
 * - Pin/unpin functionality
 * - Resizable panels
 * - Simultaneous table and preview viewing
 * 
 * Keep this file for:
 * - Future feature requests for floating UI
 * - Reference for drag & drop implementations
 * - A/B testing with users
 * - Code reuse in other components
 * 
 * Note: This file is not used in the main application.
 * The active implementation is in TranscriptManagementPage.tsx
 */

import React, { useState, useEffect, useRef } from 'react';
import { Download, Eye, Search, Filter, ChevronDown, ChevronUp, Maximize2, X, Loader2, User, Hash, Move, Pin, PinOff } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { StatusIndicator } from '../../../components/ui/statusindicator/StatusIndicator';
import { fetchAllTranscripts, downloadTranscript, fetchTranscriptForPreview, type TranscriptInfo as ApiTranscriptInfo } from '../../../api/transcript/transcriptApi';

interface TranscriptInfo extends ApiTranscriptInfo {}

interface TranscriptManagementPageFloatingProps {}

const TranscriptManagementPageFloatingReference: React.FC<TranscriptManagementPageFloatingProps> = () => {
  const { token } = useAuth();
  const [transcripts, setTranscripts] = useState<TranscriptInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof TranscriptInfo>('uploadDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  // Floating preview states
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  
  // Floating panel position and state
  const [panelPosition, setPanelPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [panelSize] = useState({ width: 500, height: 600 });
  const [isPinned, setIsPinned] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
  }, [previewUrl, fullscreenUrl]);

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFullscreen) {
          closeFullscreen();
        } else if (selectedTranscript && !isPinned) {
          closePreview();
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showFullscreen, selectedTranscript, isPinned]);

  // Drag functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setPanelPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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

  const handlePreview = async (transcript: TranscriptInfo) => {
    if (!token) return;
    
    // If the same transcript is already selected, close it
    if (selectedTranscript?.id === transcript.id) {
      closePreview();
      return;
    }

    try {
      setLoadingPreview(true);
      setSelectedTranscript(transcript);
      
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const url = await fetchTranscriptForPreview(transcript.id, token);
      setPreviewUrl(url);
      
      // Position the panel in a good spot
      if (!isPinned) {
        setPanelPosition({ x: window.innerWidth - 520, y: 100 });
      }
      
      toast.success('Preview loaded successfully');
    } catch (err) {
      toast.error('Failed to load preview');
      console.error('Preview error:', err);
      setSelectedTranscript(null);
      setPreviewUrl(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setSelectedTranscript(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const openFullscreen = (url: string) => {
    setFullscreenUrl(url);
    setShowFullscreen(true);
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
    if (fullscreenUrl) {
      setTimeout(() => {
        if (fullscreenUrl && fullscreenUrl !== previewUrl) {
          URL.revokeObjectURL(fullscreenUrl);
        }
      }, 100);
      setFullscreenUrl(null);
    }
  };

  const handleDragStart = (e: React.MouseEvent) => {
    if (isPinned) return;
    
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
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
    <div className="min-h-screen bg-gray-50 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Transcripts (Floating Preview - Reference Implementation)
          </h1>
          <p className="text-gray-600 text-lg">
            Reference implementation with draggable floating preview panels
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

        {/* Main Transcripts Table */}
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
                    <tr 
                      key={transcript.id} 
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedTranscript?.id === transcript.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                      onClick={() => handlePreview(transcript)}
                    >
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
                        <div className="flex items-center space-x-2">
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
                              {selectedTranscript?.id === transcript.id && previewUrl 
                                ? 'Hide' 
                                : loadingPreview && selectedTranscript?.id === transcript.id 
                                  ? 'Loading...' 
                                  : 'Preview'
                              }
                            </span>
                          </button>
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">📋 Reference Implementation Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Draggable Panel:</strong> Click and drag the panel header to reposition</li>
            <li>• <strong>Pin Feature:</strong> Use the pin button to lock the panel in place</li>
            <li>• <strong>Simultaneous View:</strong> Table and preview can be viewed at the same time</li>
            <li>• <strong>ESC Key:</strong> Close preview with ESC (unless pinned)</li>
            <li>• <strong>Not Used:</strong> This is a reference implementation - main app uses tab-based approach</li>
          </ul>
        </div>
      </div>

      {/* Floating Preview Panel */}
      {selectedTranscript && previewUrl && (
        <div
          ref={panelRef}
          className={`fixed bg-white rounded-lg shadow-2xl border border-gray-300 z-50 ${
            isDragging ? 'cursor-grabbing' : isPinned ? '' : 'cursor-grab'
          } ${isPinned ? 'opacity-95' : 'opacity-100'}`}
          style={{
            left: panelPosition.x,
            top: panelPosition.y,
            width: panelSize.width,
            height: panelSize.height,
            minWidth: 400,
            minHeight: 300,
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}
        >
          {/* Panel Header */}
          <div 
            className={`p-3 border-b border-gray-200 rounded-t-lg bg-gray-50 ${
              isPinned ? '' : 'cursor-grab'
            }`}
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Move className="w-4 h-4 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Transcript Preview</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{selectedTranscript.studentName}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Hash className="w-3 h-3" />
                      <span>{selectedTranscript.studentNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsPinned(!isPinned)}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                  title={isPinned ? 'Unpin (allow dragging)' : 'Pin in place'}
                >
                  {isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => openFullscreen(previewUrl)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
                <button
                  onClick={closePreview}
                  className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                  title="Close"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-2 h-full">
            <div className="border border-gray-200 rounded h-full overflow-hidden">
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                className="w-full h-full"
                title={`Floating Transcript Preview - ${selectedTranscript.studentName}`}
              />
            </div>
          </div>

          {/* Panel Footer */}
          <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="text-xs text-gray-600 text-center">
              {selectedTranscript.fileName} ({formatFileSize(selectedTranscript.fileSize)}) • 
              {formatDate(selectedTranscript.uploadDate)}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {showFullscreen && fullscreenUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
            <div className="bg-white rounded-lg shadow-2xl h-full flex flex-col">
              {/* Fullscreen Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Transcript Preview - {selectedTranscript?.studentName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedTranscript?.fileName} • {selectedTranscript ? formatFileSize(selectedTranscript.fileSize) : ''}
                  </p>
                </div>
                <button
                  onClick={closeFullscreen}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
              
              {/* Fullscreen Content */}
              <div className="flex-1 p-4">
                <div className="border border-gray-300 rounded overflow-hidden h-full">
                  <iframe
                    src={`${fullscreenUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-full"
                    title={`Fullscreen Transcript - ${selectedTranscript?.studentName}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranscriptManagementPageFloatingReference;
