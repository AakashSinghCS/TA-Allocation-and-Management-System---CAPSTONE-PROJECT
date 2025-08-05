import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Download, Eye, Search, Filter, ChevronDown, ChevronUp, Maximize2, X, Loader2, User, Mail, Hash, Edit3, Check, AlertTriangle, Clock, XCircle, Calendar, MessageSquare, Plus, FileText, ThumbsUp, ThumbsDown, HelpCircle, Info } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { StatusIndicator } from '../../../components/ui/statusindicator/StatusIndicator';
import { fetchAllTranscripts, downloadTranscript, fetchTranscriptForPreview, updateTranscriptReview, type TranscriptInfo as ApiTranscriptInfo, type TranscriptReview } from '../../../api/transcript/transcriptApi';

interface CommentTemplate {
  id: string;
  name: string;
  comment: string;
  category: 'approval' | 'rejection' | 'clarification' | 'general';
}

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
  
  // Comment template states
  const [showTemplateDropdown, setShowTemplateDropdown] = useState<number | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CommentTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<CommentTemplate['category'] | 'all'>('all');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<TranscriptInfo['reviewStatus'] | 'ALL'>('ALL');
  
  // Bulk selection states
  const [selectedTranscripts, setSelectedTranscripts] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Bulk operation progress states
  const [bulkOperationProgress, setBulkOperationProgress] = useState({
    isRunning: false,
    completed: 0,
    total: 0,
    operation: '',
    errors: [] as string[]
  });
  
  // Date range filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateRangeError, setDateRangeError] = useState('');
  
  // Download states
  const [downloading, setDownloading] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    isDangerous?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {},
    isDangerous: false
  });

  // Date validation helper
  const validateDateRange = (start: string, end: string): string => {
    if (!start && !end) return '';
    
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (start) {
      const startDate = new Date(start);
      if (startDate > today) {
        return 'Start date cannot be in the future';
      }
    }
    
    if (end) {
      const endDate = new Date(end);
      if (endDate > today) {
        return 'End date cannot be in the future';
      }
    }
    
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (startDate > endDate) {
        return 'Start date must be before or equal to end date';
      }
    }
    
    return '';
  };

  // Handle date range changes with validation
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    const error = validateDateRange(newRange.start, newRange.end);
    
    setDateRange(newRange);
    setDateRangeError(error);
  };

  // Predefined comment templates
  const predefinedTemplates: CommentTemplate[] = [
    {
      id: 'approve-excellent',
      name: 'Excellent Academic Record',
      comment: 'Excellent academic performance with strong GPA and relevant coursework. All requirements met for TA position.',
      category: 'approval'
    },
    {
      id: 'approve-qualified',
      name: 'Qualified Candidate',
      comment: 'Meets all academic requirements. Good performance in relevant courses. Approved for TA consideration.',
      category: 'approval'
    },
    {
      id: 'reject-gpa',
      name: 'GPA Requirements Not Met',
      comment: 'Current GPA does not meet the minimum requirement of 3.0 for undergraduate TAs or 3.5 for graduate TAs.',
      category: 'rejection'
    },
    {
      id: 'reject-prerequisites',
      name: 'Missing Prerequisites',
      comment: 'Required prerequisite courses have not been completed. Please ensure all necessary coursework is finished before reapplying.',
      category: 'rejection'
    },
    {
      id: 'clarify-courses',
      name: 'Course Information Needed',
      comment: 'Please provide more detailed information about specific courses taken, including course codes and grades received.',
      category: 'clarification'
    },
    {
      id: 'clarify-document',
      name: 'Document Quality Issues',
      comment: 'The submitted transcript is difficult to read or appears incomplete. Please submit a clearer, official copy.',
      category: 'clarification'
    },
    {
      id: 'general-review',
      name: 'Under Review',
      comment: 'Your transcript is currently under review. We will provide feedback within 3-5 business days.',
      category: 'general'
    }
  ];

  // Get all available templates (predefined + custom)
  const allTemplates = [...predefinedTemplates, ...customTemplates];

  // Filter templates by category and search
  const getFilteredTemplates = (category?: CommentTemplate['category']) => {
    let templates = allTemplates;
    
    // Filter by category if specified
    if (category) {
      templates = templates.filter(template => template.category === category);
    } else if (selectedTemplateCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedTemplateCategory);
    }
    
    // Filter by search term
    if (templateSearch) {
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        template.comment.toLowerCase().includes(templateSearch.toLowerCase())
      );
    }
    
    return templates;
  };

  // Handle template selection
  const handleTemplateSelect = (template: CommentTemplate) => {
    setReviewComments(template.comment);
    setShowTemplateDropdown(null);
    setTemplateSearch(''); // Clear search when template is selected
  };

  // Get category icon
  const getCategoryIcon = (category: CommentTemplate['category']) => {
    switch (category) {
      case 'approval':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'rejection':
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      case 'clarification':
        return <HelpCircle className="w-4 h-4 text-yellow-600" />;
      case 'general':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get category color classes
  const getCategoryClasses = (category: CommentTemplate['category']) => {
    switch (category) {
      case 'approval':
        return {
          bg: 'hover:bg-green-50',
          border: 'border-l-green-500',
          text: 'text-green-800',
          badge: 'bg-green-100 text-green-800'
        };
      case 'rejection':
        return {
          bg: 'hover:bg-red-50',
          border: 'border-l-red-500',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-800'
        };
      case 'clarification':
        return {
          bg: 'hover:bg-yellow-50',
          border: 'border-l-yellow-500',
          text: 'text-yellow-800',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'general':
        return {
          bg: 'hover:bg-blue-50',
          border: 'border-l-blue-500',
          text: 'text-blue-800',
          badge: 'bg-blue-100 text-blue-800'
        };
      default:
        return {
          bg: 'hover:bg-gray-50',
          border: 'border-l-gray-500',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  // Tooltip component
  const Tooltip: React.FC<{ children: React.ReactNode; content: string; className?: string }> = ({ 
    children, 
    content, 
    className = "" 
  }) => (
    <div className={`group relative ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );

  useEffect(() => {
    fetchTranscripts();
  }, [token]);

  // Close template dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTemplateDropdown !== null) {
        const target = event.target as Element;
        if (!target.closest('.template-dropdown')) {
          setShowTemplateDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTemplateDropdown]);

  // Cleanup preview URLs on component unmount and state changes
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

  // Clean up preview URL when changing to different transcript
  useEffect(() => {
    return () => {
      if (previewUrl && selectedTranscript) {
        // Only cleanup if we're switching to a different transcript
        const currentId = selectedTranscript.id;
        setTimeout(() => {
          // Check if we're still on the same transcript after a brief delay
          if (!selectedTranscript || selectedTranscript.id !== currentId) {
            URL.revokeObjectURL(previewUrl);
          }
        }, 100);
      }
    };
  }, [selectedTranscript?.id]);

  // Clean up fullscreen URL when closing
  useEffect(() => {
    if (!showFullscreen && fullscreenUrl) {
      URL.revokeObjectURL(fullscreenUrl);
      setFullscreenUrl(null);
    }
  }, [showFullscreen]);

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

      console.log('Updating review:', reviewData); // Debug log
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
      console.error('Review update error:', err);
      
      // More detailed error message
      let errorMessage = 'Failed to update review';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for specific error types
        if (errorMessage.includes('401')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (errorMessage.includes('403')) {
          errorMessage = 'You do not have permission to update transcript reviews.';
        } else if (errorMessage.includes('404')) {
          errorMessage = 'Transcript not found.';
        } else if (errorMessage.includes('500')) {
          errorMessage = 'Server error. Please try again later.';
        }
      }
      
      toast.error(errorMessage);
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
  // Memoized callbacks to prevent unnecessary re-renders
  const handleSelectTranscript = useCallback((transcriptId: number) => {
    const newSelected = new Set(selectedTranscripts);
    if (newSelected.has(transcriptId)) {
      newSelected.delete(transcriptId);
    } else {
      newSelected.add(transcriptId);
    }
    setSelectedTranscripts(newSelected);
  }, [selectedTranscripts]);

  // Helper function to show confirmation dialog
  const showConfirmDialog = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Confirm',
    isDangerous: boolean = false
  ) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: 'Cancel',
      onConfirm,
      isDangerous
    });
  };

  const handleBulkStatusUpdateWithConfirm = (newStatus: TranscriptInfo['reviewStatus']) => {
    const count = selectedTranscripts.size;
    const statusLabel = getStatusLabel(newStatus);
    
    showConfirmDialog(
      'Confirm Bulk Status Update',
      `Are you sure you want to update ${count} transcript(s) to "${statusLabel}"? This action cannot be undone.`,
      () => handleBulkStatusUpdate(newStatus),
      'Update All',
      false
    );
  };

  const handleBulkStatusUpdate = async (newStatus: TranscriptInfo['reviewStatus']) => {
    if (!token || selectedTranscripts.size === 0) return;

    const totalItems = selectedTranscripts.size;
    setBulkOperationProgress({
      isRunning: true,
      completed: 0,
      total: totalItems,
      operation: `Updating to ${getStatusLabel(newStatus)}`,
      errors: []
    });

    try {
      setUpdatingReview(true);
      
      // Update with progress tracking
      const transcriptIds = Array.from(selectedTranscripts);
      let completed = 0;
      const errors: string[] = [];

      for (const transcriptId of transcriptIds) {
        try {
          const reviewData: TranscriptReview = {
            transcriptId,
            reviewStatus: newStatus,
            reviewComments: `Bulk updated to ${getStatusLabel(newStatus)}`
          };
          await updateTranscriptReview(reviewData, token);
          completed++;
          
          setBulkOperationProgress(prev => ({ ...prev, completed }));
        } catch (err) {
          const errorMsg = `Failed to update transcript ID ${transcriptId}`;
          errors.push(errorMsg);
          console.error(errorMsg, err);
        }
      }
      
      // Small delay to ensure database transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh transcripts list from server
      await fetchTranscripts();
      
      // Clear selection
      setSelectedTranscripts(new Set());
      setSelectAll(false);
      
      if (errors.length === 0) {
        toast.success(`Successfully updated ${completed} transcript(s) to ${getStatusLabel(newStatus)}`);
      } else {
        toast.warning(`Updated ${completed} of ${totalItems} transcripts. ${errors.length} failed.`);
      }
    } catch (err) {
      toast.error('Failed to update selected transcripts');
      console.error('Bulk update error:', err);
    } finally {
      setUpdatingReview(false);
      setBulkOperationProgress(prev => ({ ...prev, isRunning: false }));
    }
  };

  const handleExportToCSV = () => {
    try {
      const dataToExport = filteredAndSortedTranscripts.map(transcript => ({
        'Student Name': transcript.studentName,
        'Student Email': transcript.studentEmail,
        'Student Number': transcript.studentNumber,
        'File Name': transcript.fileName,
        'Upload Date': formatDate(transcript.uploadDate),
        'Review Status': getStatusLabel(transcript.reviewStatus),
        'Review Comments': transcript.reviewComments || '',
        'Reviewer': transcript.reviewerName || 'N/A'
      }));

      const csvContent = convertToCSV(dataToExport);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `transcripts_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${dataToExport.length} transcripts to CSV`);
    } catch (error) {
      toast.error('Failed to export transcripts');
      console.error('Export error:', error);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedTranscripts.size === 0) return;

    try {
      setDownloading(true);
      const downloadPromises = Array.from(selectedTranscripts).map(async (transcriptId) => {
        const transcript = transcripts.find(t => t.id === transcriptId);
        if (transcript) {
          await handleDownload(transcriptId, transcript.fileName);
        }
      });

      await Promise.all(downloadPromises);
      toast.success(`Downloaded ${selectedTranscripts.size} transcript(s)`);
    } catch (error) {
      toast.error('Failed to download selected transcripts');
      console.error('Bulk download error:', error);
    } finally {
      setDownloading(false);
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: Record<string, string>[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  // Memoized callbacks to prevent unnecessary re-renders
  const handleSort = useCallback((field: keyof TranscriptInfo) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  // Memoized filtering and sorting for performance
  const filteredAndSortedTranscripts = useMemo(() => {
    return transcripts
      .filter(transcript => {
        // Search filter - defensive programming for null/undefined values
        const matchesSearch = (transcript.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (transcript.studentEmail?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
          (transcript.studentNumber || '').includes(searchTerm) ||
          (transcript.fileName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        
        // Status filter
        const matchesStatus = statusFilter === 'ALL' || transcript.reviewStatus === statusFilter;
        
        // Date range filter
        let matchesDate = true;
        if ((dateRange.start || dateRange.end) && !dateRangeError) {
          const transcriptDate = new Date(transcript.uploadDate);
          
          if (dateRange.start) {
            // Create date in UTC to avoid timezone issues
            const startDate = new Date(dateRange.start + 'T00:00:00.000Z');
            matchesDate = matchesDate && transcriptDate >= startDate;
          }
          if (dateRange.end) {
            // Create date in UTC to avoid timezone issues
            const endDate = new Date(dateRange.end + 'T23:59:59.999Z');
            matchesDate = matchesDate && transcriptDate <= endDate;
          }
        }
        
        return matchesSearch && matchesStatus && matchesDate;
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
  }, [transcripts, searchTerm, statusFilter, dateRange, dateRangeError, sortField, sortDirection]);

  // Handle select all functionality - defined after filteredAndSortedTranscripts
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedTranscripts(new Set());
      setSelectAll(false);
    } else {
      const allVisibleIds = new Set(filteredAndSortedTranscripts.map(t => t.id));
      setSelectedTranscripts(allVisibleIds);
      setSelectAll(true);
    }
  }, [selectAll, filteredAndSortedTranscripts]);

  // Update selectAll state when filtered data changes
  useEffect(() => {
    if (selectedTranscripts.size > 0 && filteredAndSortedTranscripts.length > 0) {
      const allVisibleIds = new Set(filteredAndSortedTranscripts.map(t => t.id));
      if (selectAll && !Array.from(allVisibleIds).every(id => selectedTranscripts.has(id))) {
        setSelectAll(false);
      } else if (!selectAll && selectedTranscripts.size === allVisibleIds.size && Array.from(allVisibleIds).every(id => selectedTranscripts.has(id))) {
        setSelectAll(true);
      }
    }
  }, [filteredAndSortedTranscripts, selectedTranscripts, selectAll]);

  // Reset selection when filters change
  useEffect(() => {
    setSelectedTranscripts(new Set());
    setSelectAll(false);
  }, [searchTerm, statusFilter, dateRange]);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <StatusIndicator loading={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Transcripts
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Review and download official academic transcripts submitted by TA applicants
          </p>
          
          {/* Operation Guide */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-amber-900 mb-2">Quick Start Guide:</h3>
                <div className="text-xs text-amber-800 space-y-1">
                  <p><strong>Search & Filter:</strong> Use search bar and status filter to find specific transcripts.</p>
                  <p><strong>Review Process:</strong> Click "Review" → Select status → Add comments using Templates → Save changes.</p>
                  <p><strong>Bulk Actions:</strong> Select multiple transcripts → Use bulk status buttons or download selected files.</p>
                  <p><strong>Preview:</strong> Click "Preview" to view content, "Fullscreen" for detailed examination.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Operation Progress */}
        {bulkOperationProgress.isRunning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-blue-800">
                {bulkOperationProgress.operation}
              </h3>
              <span className="text-sm text-blue-600">
                {bulkOperationProgress.completed} / {bulkOperationProgress.total}
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(bulkOperationProgress.completed / bulkOperationProgress.total) * 100}%`
                }}
              />
            </div>
            {bulkOperationProgress.errors.length > 0 && (
              <div className="text-sm text-red-600">
                {bulkOperationProgress.errors.length} error(s) occurred
              </div>
            )}
          </div>
        )}

        {/* 3-Row Control Panel - Option B */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          {/* Row 1: Search, Status Filter, and Statistics */}
          <div className="flex flex-col sm:flex-row gap-4 items-center mb-6 pb-6 border-b border-gray-100">
            {/* Search Bar */}
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white min-w-[140px]"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="NEEDS_CLARIFICATION">Needs Clarification</option>
              </select>
            </div>
            
            {/* Statistics */}
            <div className="flex items-center text-sm text-gray-600 whitespace-nowrap">
              <span>Total: {filteredAndSortedTranscripts.length}</span>
              {selectedTranscripts.size > 0 && (
                <span className="ml-3 text-blue-600 font-medium">
                  {selectedTranscripts.size} selected
                </span>
              )}
            </div>
          </div>

          {/* Row 2: Date Filter + Action Buttons */}
          <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-100">
            {/* Date Range Filter */}
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Date Range:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      dateRangeError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="From"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      dateRangeError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="To"
                    max={new Date().toISOString().split('T')[0]}
                  />
                  <Tooltip content="Clear date range filter">
                    <button
                      onClick={() => {
                        setDateRange({ start: '', end: '' });
                        setDateRangeError('');
                      }}
                      className="px-3 py-2 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Clear
                    </button>
                  </Tooltip>
                </div>
              </div>
              {dateRangeError && (
                <div className="flex items-center space-x-1 text-red-600 text-xs ml-6">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{dateRangeError}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:space-x-4">
              <button
                onClick={handleExportToCSV}
                disabled={filteredAndSortedTranscripts.length === 0}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export to CSV</span>
              </button>
              
              <button
                onClick={handleBulkDownload}
                disabled={selectedTranscripts.size === 0 || downloading}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-[#040941] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Downloading...' : 'Bulk Download'}</span>
                {selectedTranscripts.size > 0 && (
                  <span className="ml-1 px-2 py-1 bg-blue-500 text-xs rounded-full">
                    {selectedTranscripts.size}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 3: Bulk Update Actions */}
          {selectedTranscripts.size > 0 && (
            <div className="flex flex-col gap-4 items-center">
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700">
                  Bulk Status Update for {selectedTranscripts.size} selected:
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Tooltip content="Mark all selected transcripts as being actively reviewed">
                  <button
                    onClick={() => handleBulkStatusUpdateWithConfirm('UNDER_REVIEW')}
                    disabled={updatingReview}
                    className="px-4 py-2 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Under Review
                  </button>
                </Tooltip>
                <Tooltip content="Approve all selected transcripts for TA eligibility">
                  <button
                    onClick={() => handleBulkStatusUpdateWithConfirm('APPROVED')}
                    disabled={updatingReview}
                    className="px-4 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Approve
                  </button>
                </Tooltip>
                <Tooltip content="Reject all selected transcripts for TA eligibility">
                  <button
                    onClick={() => handleBulkStatusUpdateWithConfirm('REJECTED')}
                    disabled={updatingReview}
                    className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Reject
                  </button>
                </Tooltip>
                <Tooltip content="Mark all selected transcripts as needing additional information">
                  <button
                    onClick={() => handleBulkStatusUpdateWithConfirm('NEEDS_CLARIFICATION')}
                    disabled={updatingReview}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 border border-yellow-300 rounded-lg hover:bg-yellow-200 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Needs Clarification
                  </button>
                </Tooltip>
              </div>
            </div>
          )}
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
                                <Tooltip content={`Current review status: ${getStatusLabel(transcript.reviewStatus || 'PENDING')}. Click 'Review' to modify.`}>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(transcript.reviewStatus || 'PENDING')}`}>
                                    {getStatusIcon(transcript.reviewStatus || 'PENDING')}
                                    <span className="ml-1">{getStatusLabel(transcript.reviewStatus || 'PENDING')}</span>
                                  </span>
                                </Tooltip>
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
                                <Tooltip content="Start reviewing this transcript and add comments">
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
                                </Tooltip>
                              ) : (
                                /* Editing controls */
                                <div className="flex items-center space-x-1">
                                  <Tooltip content="Save the review status and comments">
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
                                  </Tooltip>
                                  <Tooltip content="Cancel review editing without saving changes">
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
                                  </Tooltip>
                                </div>
                              )}
                              
                              {/* Preview Button */}
                              <Tooltip content="Preview transcript content in the tab below">
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
                              </Tooltip>
                              
                              {/* Download Button */}
                              <Tooltip content="Download the original transcript file">
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
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expandable comment row when editing */}
                        {editingReview === transcript.id && (
                          <tr className="bg-gray-50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Review Comments
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      {/* Template Dropdown Button */}
                                      <div className="relative template-dropdown">
                                        <button
                                          type="button"
                                          onClick={() => setShowTemplateDropdown(
                                            showTemplateDropdown === transcript.id ? null : (transcript.id || null)
                                          )}
                                          className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                                        >
                                          <MessageSquare className="w-3 h-3 mr-1" />
                                          Templates
                                          {showTemplateDropdown === transcript.id ? (
                                            <ChevronUp className="w-3 h-3 ml-1" />
                                          ) : (
                                            <ChevronDown className="w-3 h-3 ml-1" />
                                          )}
                                        </button>
                                        
{/* Template Section - Inline Expandable */}
                                        {showTemplateDropdown === transcript.id && (
                                          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 ease-in-out">
                                            {/* Header */}
                                            <div className="bg-white px-4 py-3 border-b border-gray-200">
                                              <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                                                  <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                                                  Comment Templates
                                                </h4>
                                                <button
                                                  onClick={() => setShowTemplateDropdown(null)}
                                                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                                >
                                                  <ChevronUp className="w-4 h-4 text-gray-500" />
                                                </button>
                                              </div>
                                              
                                              {/* Search Bar */}
                                              <div className="relative mb-3">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                <input
                                                  type="text"
                                                  placeholder="Search templates..."
                                                  value={templateSearch}
                                                  onChange={(e) => setTemplateSearch(e.target.value)}
                                                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                />
                                              </div>
                                              
                                              {/* Category Filter */}
                                              <div className="flex flex-wrap gap-2">
                                                <button
                                                  onClick={() => setSelectedTemplateCategory('all')}
                                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                    selectedTemplateCategory === 'all'
                                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                  }`}
                                                >
                                                  All
                                                </button>
                                                <button
                                                  onClick={() => setSelectedTemplateCategory('approval')}
                                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                    selectedTemplateCategory === 'approval'
                                                      ? 'bg-green-100 text-green-800 border border-green-200'
                                                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                  }`}
                                                >
                                                  Approval
                                                </button>
                                                <button
                                                  onClick={() => setSelectedTemplateCategory('rejection')}
                                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                    selectedTemplateCategory === 'rejection'
                                                      ? 'bg-red-100 text-red-800 border border-red-200'
                                                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                  }`}
                                                >
                                                  Rejection
                                                </button>
                                                <button
                                                  onClick={() => setSelectedTemplateCategory('clarification')}
                                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                    selectedTemplateCategory === 'clarification'
                                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                  }`}
                                                >
                                                  Clarification
                                                </button>
                                                <button
                                                  onClick={() => setSelectedTemplateCategory('general')}
                                                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                                    selectedTemplateCategory === 'general'
                                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                  }`}
                                                >
                                                  General
                                                </button>
                                              </div>
                                            </div>
                                            
                                            {/* Templates List */}
                                            <div className="p-3 bg-gray-50 max-h-80 overflow-y-auto">
                                              {getFilteredTemplates().length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                                  <p className="text-sm">No templates found</p>
                                                  {templateSearch && (
                                                    <p className="text-xs mt-1">Try adjusting your search</p>
                                                  )}
                                                </div>
                                              ) : (
                                                <div className="grid gap-2">
                                                  {getFilteredTemplates().map(template => {
                                                    const categoryClasses = getCategoryClasses(template.category);
                                                    return (
                                                      <button
                                                        key={template.id}
                                                        onClick={() => handleTemplateSelect(template)}
                                                        className={`w-full text-left p-3 rounded-lg border-l-4 ${categoryClasses.border} bg-white hover:shadow-md transition-all duration-200 group border border-gray-200`}
                                                      >
                                                        <div className="flex items-start justify-between">
                                                          <div className="flex-1">
                                                            <div className="flex items-center mb-2">
                                                              {getCategoryIcon(template.category)}
                                                              <span className="font-medium text-sm text-gray-900 ml-2">
                                                                {template.name}
                                                              </span>
                                                              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${categoryClasses.badge}`}>
                                                                {template.category}
                                                              </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 leading-relaxed">
                                                              {template.comment.length > 100
                                                                ? `${template.comment.substring(0, 100)}...`
                                                                : template.comment
                                                              }
                                                            </p>
                                                          </div>
                                                          <Plus className="w-4 h-4 text-gray-400 ml-2 group-hover:text-blue-600 transition-colors" />
                                                        </div>
                                                      </button>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                            
                                            {/* Footer */}
                                            <div className="px-4 py-2 bg-white border-t border-gray-200">
                                              <p className="text-xs text-gray-500 text-center">
                                                💡 Click any template to insert it into your comment
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <span className={`text-xs ${reviewComments.length > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                                        {reviewComments.length}/500
                                      </span>
                                    </div>
                                  </div>
                                  <textarea
                                    value={reviewComments}
                                    onChange={(e) => setReviewComments(e.target.value)}
                                    placeholder="Add your review comments here..."
                                    rows={3}
                                    maxLength={500}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                  />
                                  {reviewComments.length > 450 && (
                                    <div className="text-xs text-amber-600 mt-1">
                                      ⚠️ Comment is approaching the 500 character limit
                                    </div>
                                  )}
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
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm max-h-32 overflow-y-auto">
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
                  <Tooltip content="Return to the transcripts list view">
                    <button
                      onClick={() => setActiveView('table')}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded border border-gray-300 transition-colors flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>Back to List</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="Open transcript in fullscreen mode for detailed examination">
                    <button
                      onClick={() => openFullscreen(previewUrl)}
                      className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded border border-blue-300 transition-colors flex items-center space-x-1"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Fullscreen</span>
                    </button>
                  </Tooltip>
                  <Tooltip content="Download this transcript file for offline review">
                    <button
                      onClick={() => handleDownload(selectedTranscript.id, selectedTranscript.fileName)}
                      disabled={downloadingIds.has(selectedTranscript.id)}
                      className="px-3 py-2 text-sm text-green-600 hover:text-green-800 hover:bg-green-100 rounded border border-green-300 transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {downloadingIds.has(selectedTranscript.id) ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>
                        {downloadingIds.has(selectedTranscript.id) ? 'Downloading...' : 'Download'}
                      </span>
                    </button>
                  </Tooltip>
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

        {/* Review Status Overview */}
        {filteredAndSortedTranscripts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedTranscripts.filter(t => t.reviewStatus === 'APPROVED').length}
              </div>
              <div className="text-sm text-gray-500">Approved</div>
              <div className="text-xs text-gray-400 mt-1">
                {filteredAndSortedTranscripts.length > 0 ? 
                  Math.round((filteredAndSortedTranscripts.filter(t => t.reviewStatus === 'APPROVED').length / filteredAndSortedTranscripts.length) * 100) 
                  : 0}% of total
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAndSortedTranscripts.filter(t => t.reviewStatus === 'UNDER_REVIEW').length}
              </div>
              <div className="text-sm text-gray-500">Under Review</div>
              <div className="text-xs text-gray-400 mt-1">
                {filteredAndSortedTranscripts.length > 0 ? 
                  Math.round((filteredAndSortedTranscripts.filter(t => t.reviewStatus === 'UNDER_REVIEW').length / filteredAndSortedTranscripts.length) * 100) 
                  : 0}% of total
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-gray-600">
                {filteredAndSortedTranscripts.filter(t => !t.reviewStatus || t.reviewStatus === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-500">Pending Review</div>
              <div className="text-xs text-gray-400 mt-1">
                {filteredAndSortedTranscripts.length > 0 ? 
                  Math.round((filteredAndSortedTranscripts.filter(t => !t.reviewStatus || t.reviewStatus === 'PENDING').length / filteredAndSortedTranscripts.length) * 100) 
                  : 0}% of total
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">
                {filteredAndSortedTranscripts.filter(t => t.reviewStatus === 'REJECTED' || t.reviewStatus === 'NEEDS_CLARIFICATION').length}
              </div>
              <div className="text-sm text-gray-500">Needs Attention</div>
              <div className="text-xs text-gray-400 mt-1">
                Rejected + Clarification needed
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Review Guidelines */}

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 mr-2 text-green-700" />
            <span className="font-semibold text-green-900 text-sm">Transcript Review Criteria</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-800">
            <div className="flex items-center gap-1"><span className="text-green-600"></span> <span>GPA: 3.0+ (UG), 3.5+ (Grad)</span></div>
            <div className="flex items-center gap-1"><span className="text-green-600"></span> <span>Prerequisite courses completed</span></div>
            <div className="flex items-center gap-1"><span className="text-green-600"></span> <span>B+ or higher in relevant subjects</span></div>
            <div className="flex items-center gap-1"><span className="text-green-600"></span> <span>Official format & seals</span></div>
            <div className="flex items-center gap-1"><span className="text-green-600"></span> <span>All required courses shown</span></div>
            <div className="flex items-center gap-1"><span className="text-green-600"></span> <span>Privacy & policy compliance</span></div>
          </div>
          <div className="mt-2 pt-2 border-t border-green-200">
            <span className="text-xs text-green-700 italic">
              <strong>Process:</strong> Under Review → Evaluate → Approve / Reject / Clarify (with comments)
            </span>
          </div>
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
                          <div className="text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 shadow-sm max-w-md">
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

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  {confirmDialog.isDangerous && (
                    <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                  )}
                  <h3 className="text-lg font-medium text-gray-900">{confirmDialog.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-6">{confirmDialog.message}</p>
                <div className="flex space-x-3 justify-end">
                  <button
                    onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {confirmDialog.cancelText}
                  </button>
                  <button
                    onClick={() => {
                      confirmDialog.onConfirm();
                      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    }}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                      confirmDialog.isDangerous 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {confirmDialog.confirmText}
                  </button>
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
