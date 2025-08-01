import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, CheckCircle, AlertTriangle, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

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
    };
  }, [uploadState.previewUrl, existingPreviewUrl]);

  const fetchExistingTranscript = async () => {
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
          setUploadState(prev => ({
            ...prev,
            uploading: false,
            success: true,
            progress: 100
          }));
          toast.success(wasReplacement ? 'Transcript replaced successfully!' : 'Transcript uploaded successfully!');
          // Refresh existing transcript info
          fetchExistingTranscript();
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
    if (!token || !existingTranscript) return;
    
    if (!confirm('Are you sure you want to delete your existing transcript?')) {
      return;
    }
    
    try {
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
        toast.success('Transcript deleted successfully!');
      } else {
        toast.error('Failed to delete transcript. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting transcript:', error);
      toast.error('An error occurred while deleting the transcript.');
    }
  };

  const handlePreviewExisting = async () => {
    if (!token || !existingTranscript) return;
    
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
      toast.success('Preview loaded successfully');
    } catch (error) {
      console.error('Error loading preview:', error);
      toast.error('Failed to load preview. Please try again.');
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Transcript
          </h1>
                    <p className="text-gray-600 text-lg">
            Upload your official transcript (PDF only, max 5MB).
          </p>
        </div>

        {/* Existing Transcript Section */}
        {!loadingExisting && existingTranscript && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Transcript</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <File className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-lg font-medium text-gray-900">{existingTranscript.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(existingTranscript.fileSize)} • Uploaded {formatDate(existingTranscript.uploadDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviewExisting}
                  className="flex items-center space-x-1 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                  <span>{showExistingPreview ? 'Hide Preview' : 'Preview'}</span>
                </button>
                <button
                  onClick={deleteExistingTranscript}
                  className="flex items-center space-x-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Uploading a new transcript will replace this existing file.
              </p>
            </div>
          </div>
        )}

        {/* Existing Transcript Preview Section */}
        {existingTranscript && showExistingPreview && existingPreviewUrl && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Current Transcript Preview</h3>
                <p className="text-sm text-gray-500">Uploaded {formatDate(existingTranscript.uploadDate)}</p>
              </div>
              <button
                onClick={() => {
                  setShowExistingPreview(false);
                  if (existingPreviewUrl) {
                    URL.revokeObjectURL(existingPreviewUrl);
                    setExistingPreviewUrl(null);
                  }
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                type="button"
              >
                Close
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <iframe
                src={`${existingPreviewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-[32rem]"
                title="Current Transcript Preview"
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Current file: {existingTranscript.fileName}</span>
              <span>{formatFileSize(existingTranscript.fileSize)}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
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
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <File className="w-8 h-8 text-green-600" />
                  <span className="text-lg font-medium text-gray-900">
                    {uploadState.file.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="text-red-500 hover:text-red-700"
                    disabled={uploadState.uploading}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {uploadState.previewUrl && (
                  <p className="text-sm text-green-600 font-medium">
                    ✓ Preview loaded - check the file preview below before uploading
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop your PDF here' : 'Choose a PDF file or drag it here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload your official academic transcript (PDF only, max 5MB)
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

          {/* PDF Preview Section */}
          {uploadState.file && uploadState.previewUrl && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">File Preview</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  src={`${uploadState.previewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  className="w-full h-[32rem]"
                  title="PDF Preview"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <span>Preview: {uploadState.file.name}</span>
                <span>{(uploadState.file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Please verify:</strong> This is the correct transcript file you want to upload. 
                  Check that all information is clearly visible and the document is complete.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {uploadState.error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700">{uploadState.error}</p>
            </div>
          )}

          {/* Success Message */}
          {uploadState.success && (
            <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-700">
                Transcript uploaded successfully! The coordinator can now access your file.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={uploadState.uploading}
            >
              Back
            </button>
            
            <button
              type="submit"
              disabled={!uploadState.file || uploadState.uploading || uploadState.success}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
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

          {/* Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Upload Requirements:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>File Format:</strong> Only PDF files are accepted</li>
              <li>• <strong>File Size:</strong> Maximum 5MB</li>
              <li>• <strong>File Name:</strong> Avoid special characters like {'<'} {'>'} : " | ? * and keep under 100 characters</li>
              <li>• <strong>Content:</strong> Must be an official academic transcript from your institution</li>
              <li>• <strong>Preview:</strong> Review your file using the preview feature before uploading</li>
              {existingTranscript && (
                <li>• <strong>Replacement:</strong> Uploading a new file will replace your existing transcript</li>
              )}
              {!existingTranscript && (
                <li>• <strong>Updates:</strong> You can replace your transcript anytime by uploading a new file</li>
              )}
            </ul>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <h4 className="font-medium text-blue-900 mb-1">After Upload:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your transcript will be reviewed by the TA coordinator</li>
                <li>• Ensure your transcript is clear, complete, and readable</li>
                <li>• Include all relevant courses and grades for TA position requirements</li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TranscriptUploadPage;
