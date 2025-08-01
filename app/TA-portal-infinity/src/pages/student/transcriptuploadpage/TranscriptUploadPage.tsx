import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, File, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

interface TranscriptUploadPageProps {}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
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
    success: false
  });
  
  const [isDragActive, setIsDragActive] = useState(false);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['application/pdf'];

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Please upload a PDF file only.';
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB.';
    }
    
    // Check file name pattern (basic)
    if (!/^[a-zA-Z0-9._-]+\.pdf$/i.test(file.name)) {
      return 'Invalid file name format. Use only letters, numbers, dots, hyphens, and underscores.';
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
        success: false
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      file,
      error: null,
      success: false
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
          setUploadState(prev => ({
            ...prev,
            uploading: false,
            success: true,
            progress: 100
          }));
          toast.success('Transcript uploaded successfully!');
        } else {
          let errorMessage = 'Upload failed. Please try again.';
          try {
            const response = JSON.parse(xhr.responseText);
            errorMessage = response.message || errorMessage;
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
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            Upload your official transcript (PDF only, max 5MB)
          </p>
        </div>

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
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto w-12 h-12 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop your PDF here' : 'Choose a PDF file or drag it here'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PDF files only, up to 5MB
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
              {uploadState.uploading ? 'Uploading...' : uploadState.success ? 'Uploaded' : 'Upload Transcript'}
            </button>
          </div>

          {/* Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Important Information:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Only PDF files are accepted</li>
              <li>• Maximum file size is 5MB</li>
              <li>• Uploading a new transcript will replace the existing one</li>
              <li>• Your transcript will be reviewed by the TA coordinator</li>
              <li>• Ensure your transcript is clear and readable</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TranscriptUploadPage;
