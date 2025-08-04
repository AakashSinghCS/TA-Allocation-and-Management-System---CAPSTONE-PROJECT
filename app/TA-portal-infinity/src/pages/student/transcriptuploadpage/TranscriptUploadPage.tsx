import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, CheckCircle, AlertTriangle, Trash2, Eye, Loader2, Maximize2, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { showToastConfirmation, showToastSuccess, showToastError, showToastInfo } from '../../../utility/confirmation/toastConfirmation';

interface TranscriptUploadPageProps {}

interface ExistingTranscript {
  fileName: string;
  fileSize: number;
  uploadDate: string;
  contentType: string;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  previewUrl: string | null;
}

const TranscriptUploadPage: React.FC<TranscriptUploadPageProps> = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false,
    previewUrl: null
  });
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [existingTranscript, setExistingTranscript] = useState<ExistingTranscript | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [showExistingPreview, setShowExistingPreview] = useState(false);
  const [existingPreviewUrl, setExistingPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deletingTranscript, setDeletingTranscript] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [lastToastMessage, setLastToastMessage] = useState<string | null>(null);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf'];

  // Fetch existing transcript on component mount
  useEffect(() => {
    fetchExistingTranscript();
  }, [token]);

  // Cleanup preview URL on component unmount
  useEffect(() => {
    return () => {
      if (uploadState.previewUrl) {
        URL.revokeObjectURL(uploadState.previewUrl);
      }
      if (existingPreviewUrl) {
        URL.revokeObjectURL(existingPreviewUrl);
      }
      if (fullscreenUrl) {
        URL.revokeObjectURL(fullscreenUrl);
      }
    };
  }, [uploadState.previewUrl, existingPreviewUrl, fullscreenUrl]);

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showFullscreen) {
        closeFullscreen();
      }
    };

    if (showFullscreen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when fullscreen is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [showFullscreen]);

  // Helper function to show toast messages without duplicates
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (lastToastMessage !== message) {
      setLastToastMessage(message);
      if (type === 'success') {
        toast.success(message);
      } else {
        toast.error(message);
      }
      // Clear the last message after a delay to allow showing the same message again later
      setTimeout(() => setLastToastMessage(null), 3000);
    }
  };

  const fetchExistingTranscript = async (): Promise<void> => {
    if (!token) return;
    
    try {
      setLoadingExisting(true);
      const response = await fetch('http://localhost:8080/transcripts/status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Only set existing transcript if hasTranscript is true
        if (data.hasTranscript) {
          setExistingTranscript({
            fileName: data.fileName,
            fileSize: data.fileSize,
            uploadDate: data.uploadDate,
            contentType: data.contentType
          });
        } else {
          setExistingTranscript(null);
        }
      } else if (response.status !== 404) {
        // 404 means no transcript exists, which is fine
        console.error('Failed to fetch existing transcript');
      }
    } catch (error) {
      console.error('Error fetching existing transcript:', error);
    } finally {
      setLoadingExisting(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a PDF file only.';
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB.';
    }
    
    // Check file name pattern - allow more characters including spaces
    // Prevent dangerous characters that could cause security issues
    const fileName = file.name;
    
    // Check for dangerous characters
    if (/[<>:"|?*\x00-\x1f\x7f-\x9f]/.test(fileName)) {
      return 'File name contains invalid characters. Please rename your file and try again.';
    }
    
    // Check if it ends with .pdf (case insensitive)
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return 'File must have a .pdf extension.';
    }
    
    // Check for reasonable length (Windows max path is 260, but let's be more conservative)
    if (fileName.length > 100) {
      return 'File name is too long. Please use a shorter name (max 100 characters).';
    }
    
    // Check for empty file name or just extension
    const nameWithoutExtension = fileName.slice(0, -4);
    if (nameWithoutExtension.trim().length === 0) {
      return 'File name cannot be empty.';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setUploadState(prev => ({
        ...prev,
        error: validationError,
        file: null,
        success: false,
        previewUrl: null
      }));
      return;
    }

    // Clean up previous preview URL
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }

    // Create preview URL for PDF
    const previewUrl = URL.createObjectURL(file);

    setUploadState(prev => ({
      ...prev,
      file,
      error: null,
      success: false,
      previewUrl
    }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const uploadTranscript = async (): Promise<void> => {
    if (!uploadState.file || !token) return;

    setUploadState(prev => ({ ...prev, uploading: true, progress: 0, error: null }));

    try {
      const formData = new FormData();
      formData.append('file', uploadState.file);
      // studentId is not needed - the backend gets userId from JWT token

      const xhr = new XMLHttpRequest();

      // Progress tracking
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadState(prev => ({ ...prev, progress }));
        }
      });

      // Complete handler
      xhr.addEventListener('load', () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const wasReplacement = existingTranscript !== null;
          const shouldRefreshExistingPreview = wasReplacement && showExistingPreview;
          
          // Clean up upload state and preview URLs
          if (uploadState.previewUrl) {
            URL.revokeObjectURL(uploadState.previewUrl);
          }
          
          // If replacing existing transcript, close its preview and clean up
          if (wasReplacement && showExistingPreview) {
            setShowExistingPreview(false);
            if (existingPreviewUrl) {
              URL.revokeObjectURL(existingPreviewUrl);
              setExistingPreviewUrl(null);
            }
          }
          
          // Clear upload state completely
          setUploadState({
            file: null,
            uploading: false,
            progress: 0,
            error: null,
            success: true,
            previewUrl: null
          });
          
          // Clear file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          
          toast.success(wasReplacement ? 'Transcript replaced successfully!' : 'Transcript uploaded successfully!');
          
          // Refresh existing transcript info and auto-preview if needed
          fetchExistingTranscript().then(() => {
            // If we were showing existing preview before replacement, show the new file's preview
            if (shouldRefreshExistingPreview) {
              setTimeout(async () => {
                // Force show the new file preview in the existing transcript area
                try {
                  setLoadingPreview(true);
                  const downloadResponse = await fetch('http://localhost:8080/transcripts/download', {
                    method: 'GET',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  });

                  if (downloadResponse.ok) {
                    const blob = await downloadResponse.blob();
                    const previewUrl = URL.createObjectURL(blob);
                    
                    // Clean up previous preview URL
                    if (existingPreviewUrl) {
                      URL.revokeObjectURL(existingPreviewUrl);
                    }
                    
                    setExistingPreviewUrl(previewUrl);
                    setShowExistingPreview(true);
                  }
                } catch (error) {
                  console.error('Error auto-loading new file preview:', error);
                } finally {
                  setLoadingPreview(false);
                }
              }, 800); // Increased delay to ensure transcript info is fully updated
            }
          });
          
          // Success message will remain visible - no auto-reset
        } else {
          let errorMessage = 'Upload failed. Please try again.';
          try {
            // Try to parse the response as text first, then as JSON if possible
            const responseText = xhr.responseText;
            if (responseText) {
              try {
                const response = JSON.parse(responseText);
                errorMessage = response.message || response.error || errorMessage;
              } catch {
                // If it's not JSON, use the text response directly if it's reasonable
                if (responseText.length < 200) {
                  errorMessage = responseText;
                }
              }
            }
          } catch {
            // Use default error message
          }
          
          setUploadState(prev => ({
            ...prev,
            uploading: false,
            error: errorMessage,
            progress: 0
          }));
          toast.error(errorMessage);
        }
      });

      // Error handler
      xhr.addEventListener('error', () => {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          error: 'Network error occurred during upload.',
          progress: 0
        }));
        toast.error('Network error occurred during upload.');
      });

      xhr.open('POST', 'http://localhost:8080/transcripts/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: 'An unexpected error occurred.',
        progress: 0
      }));
      toast.error('An unexpected error occurred.');
    }
  };

  const removeFile = () => {
    // Clean up preview URL if it exists
    if (uploadState.previewUrl) {
      URL.revokeObjectURL(uploadState.previewUrl);
    }
    
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false,
      previewUrl: null
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const deleteExistingTranscript = async () => {
    if (!token || !existingTranscript || deletingTranscript) return;
    const confirmed = await showToastConfirmation({
      title: 'Delete Transcript',
      message: 'Are you sure you want to delete your existing transcript? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      setDeletingTranscript(true);
      const response = await fetch('http://localhost:8080/transcripts/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        setExistingTranscript(null);
        setShowExistingPreview(false);
        if (existingPreviewUrl) {
          URL.revokeObjectURL(existingPreviewUrl);
          setExistingPreviewUrl(null);
        }
        if (fullscreenUrl) {
          URL.revokeObjectURL(fullscreenUrl);
          setFullscreenUrl(null);
        }
        setShowFullscreen(false);
        showToastSuccess('Transcript deleted successfully!');
      } else {
        showToastError('Failed to delete transcript. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting transcript:', error);
      showToastError('An error occurred while deleting the transcript.');
    } finally {
      setDeletingTranscript(false);
    }
  };

  const handlePreviewExisting = async () => {
    if (!token || !existingTranscript || loadingPreview) return;
    
    // If preview is already shown, close it
    if (showExistingPreview) {
      setShowExistingPreview(false);
      if (existingPreviewUrl) {
        URL.revokeObjectURL(existingPreviewUrl);
        setExistingPreviewUrl(null);
      }
      return;
    }
    
    try {
      setLoadingPreview(true);
      // Download the student's own transcript using the new endpoint
      const downloadResponse = await fetch('http://localhost:8080/transcripts/download', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!downloadResponse.ok) {
        throw new Error('Failed to download transcript for preview');
      }

      const blob = await downloadResponse.blob();
      const previewUrl = URL.createObjectURL(blob);
      
      // Clean up previous preview URL
      if (existingPreviewUrl) {
        URL.revokeObjectURL(existingPreviewUrl);
      }
      
      setExistingPreviewUrl(previewUrl);
      setShowExistingPreview(true);
      showToast('Preview loaded successfully');
    } catch (error) {
      console.error('Error loading preview:', error);
      showToast('Failed to load preview. Please try again.', 'error');
    } finally {
      setLoadingPreview(false);
    }
  };

  const openFullscreen = (url: string) => {
    // Create a new blob URL for fullscreen to avoid "moved, edited, or deleted" errors
    // when the original preview URL gets revoked
    if (existingPreviewUrl && url === existingPreviewUrl) {
      // For existing transcript preview, we need to create a new blob URL
      fetch('http://localhost:8080/transcripts/download', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to download transcript for fullscreen');
        }
        return response.blob();
      })
      .then(blob => {
        const newUrl = URL.createObjectURL(blob);
        // Clean up previous fullscreen URL
        if (fullscreenUrl) {
          URL.revokeObjectURL(fullscreenUrl);
        }
        setFullscreenUrl(newUrl);
        setShowFullscreen(true);
      })
      .catch(error => {
        console.error('Error loading fullscreen:', error);
        showToast('Failed to load fullscreen preview. Please try again.', 'error');
      });
    } else if (uploadState.previewUrl && url === uploadState.previewUrl) {
      // For new file preview, create a new blob URL from the file
      if (uploadState.file) {
        const newUrl = URL.createObjectURL(uploadState.file);
        // Clean up previous fullscreen URL
        if (fullscreenUrl) {
          URL.revokeObjectURL(fullscreenUrl);
        }
        setFullscreenUrl(newUrl);
        setShowFullscreen(true);
      }
    }
  };

  const closeFullscreen = () => {
    setShowFullscreen(false);
    if (fullscreenUrl) {
      URL.revokeObjectURL(fullscreenUrl);
      setFullscreenUrl(null);
    }
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadState.file && !uploadState.uploading) {
      uploadTranscript();
    }
  };

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Upload Transcript
              </h1>
              <p className="text-gray-600">
                Upload your official transcript (PDF only, max 5MB).
              </p>
            </div>
          </div>
          {/* Requirements Warning Box */}
          <div className="mb-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-900">
            <div className="font-semibold mb-2">Requirements</div>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>PDF files only (max 5MB)</li>
              <li>Official academic transcript</li>
              <li>Clear and readable content</li>
              <li>Avoid special characters in filename</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Current Transcript */}
          {!loadingExisting && existingTranscript && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Current Transcript</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviewExisting}
                      disabled={loadingPreview}
                      className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-800 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      type="button"
                    >
                      {loadingPreview ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                      <span>
                        {loadingPreview 
                          ? 'Loading...' 
                          : showExistingPreview 
                            ? 'Hide Preview' 
                            : 'Preview'
                        }
                      </span>
                    </button>
                    <button
                      onClick={deleteExistingTranscript}
                      disabled={deletingTranscript || loadingPreview}
                      className="flex items-center space-x-1 px-2 py-1 text-sm text-red-800 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      type="button"
                    >
                      {deletingTranscript ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      <span>{deletingTranscript ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <File className="w-6 h-6 text-blue-800" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{existingTranscript.fileName}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(existingTranscript.fileSize)} • {formatDate(existingTranscript.uploadDate)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Note:</strong> This file will be replaced when you upload a new transcript.
                </div>
              </div>

              {/* Current Transcript Preview */}
              {showExistingPreview && existingPreviewUrl && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Current Transcript Preview</h3>
                    <button
                      onClick={() => openFullscreen(existingPreviewUrl)}
                      className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded border border-blue-300 transition-colors flex items-center space-x-1"
                      type="button"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Fullscreen</span>
                    </button>
                  </div>
                  <div className="border border-gray-300 rounded overflow-hidden">
                    <iframe
                      src={`${existingPreviewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                      className="w-full h-80"
                      title="Current Transcript Preview"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    {existingTranscript.fileName} ({formatFileSize(existingTranscript.fileSize)})
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column - New Upload */}
          <div className={`space-y-4 ${!existingTranscript ? 'xl:col-span-2' : ''}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload Zone */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {existingTranscript ? 'Replace Transcript' : 'Upload New Transcript'}
                </h2>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragActive
                      ? 'border-blue-400 bg-blue-50'
                      : uploadState.error
                      ? 'border-red-300 bg-red-50'
                      : uploadState.file
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => !uploadState.uploading && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={uploadState.uploading}
                  />

                  {uploadState.file ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center space-x-3">
                        <File className="w-6 h-6 text-green-800" />
                        <span className="font-medium text-gray-900 truncate max-w-xs">
                          {uploadState.file.name}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="text-red-700 hover:text-red-700"
                          disabled={uploadState.uploading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500">
                        {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {uploadState.previewUrl && (
                        <p className="text-sm text-green-800 font-medium">
                          ✓ File ready - preview below
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className="mx-auto w-10 h-10 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {isDragActive ? 'Drop your PDF here' : 'Choose a PDF file or drag it here'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Official academic transcript (PDF only, max 5MB)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {uploadState.uploading && (
                    <div className="mt-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadState.progress}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Uploading... {uploadState.progress}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Error/Success Messages */}
                {uploadState.error && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mt-4">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{uploadState.error}</p>
                  </div>
                )}

                {uploadState.success && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-4">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      Transcript uploaded successfully! The coordinator can now access your file.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end mt-4">
                  <button
                    type="submit"
                    disabled={!uploadState.file || uploadState.uploading || uploadState.success}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !uploadState.file || uploadState.uploading || uploadState.success
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-[#040941] text-white hover:bg-[#040941]/90'
                    }`}
                  >
                    {uploadState.uploading 
                      ? 'Uploading...' 
                      : uploadState.success 
                        ? 'Uploaded' 
                        : existingTranscript 
                          ? 'Replace Transcript' 
                          : 'Upload Transcript'
                    }
                  </button>
                </div>
              </div>
            </form>

            {/* New File Preview */}
            {uploadState.file && uploadState.previewUrl && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">New File Preview</h3>
                  <button
                    onClick={() => openFullscreen(uploadState.previewUrl!)}
                    className="px-2 py-1 text-xs text-blue-800 hover:text-blue-800 hover:bg-blue-100 rounded border border-blue-800 transition-colors flex items-center space-x-1"
                    type="button"
                  >
                    <Maximize2 className="w-3 h-3" />
                    <span>Fullscreen</span>
                  </button>
                </div>
                <div className="mb-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
                  <strong>Verify:</strong> Check that information is clearly visible and complete before uploading.
                </div>
                <div className="border border-gray-300 rounded overflow-hidden">
                  <iframe
                    src={`${uploadState.previewUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full h-80"
                    title="New File Preview"
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600 text-center">
                  {uploadState.file.name} ({(uploadState.file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>
            )}

            {/* Compact Information Section */}
          </div>
        </div>

        {/* Fullscreen Modal */}
        {showFullscreen && fullscreenUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full h-full max-w-7xl max-h-screen p-4">
              <div className="bg-white rounded-lg shadow-2xl h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Transcript Preview - Fullscreen</h3>
                  <button
                    onClick={closeFullscreen}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 p-4">
                  <div className="border border-gray-300 rounded-lg overflow-hidden h-full">
                    <iframe
                      src={`${fullscreenUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                      className="w-full h-full"
                      title="Transcript Fullscreen Preview"
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

export default TranscriptUploadPage;
