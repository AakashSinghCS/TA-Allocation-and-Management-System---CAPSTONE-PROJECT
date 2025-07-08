import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchImportSectionsFromCSV, 
  parseCSVContent, 
  downloadCSVTemplate,
  type ImportSectionsBatchResponse,
  type ImportSectionRequest 
} from '../../../api/csv/fetchImportSections';

export default function ImportFromCSVPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportSectionsBatchResponse | null>(null);
  const [previewData, setPreviewData] = useState<ImportSectionRequest[] | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setImportResult(null);
      setPreviewData(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsedData = parseCSVContent(text);
      setPreviewData(parsedData);
    } catch (err) {
      console.error('Preview failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    if (!previewData) {
      setError('Please preview the data first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchImportSectionsFromCSV(previewData);
      
      if (result) {
        setImportResult(result);
        if (result.success) {
          // Clear form after successful import
          setFile(null);
          setPreviewData(null);
          // Reset file input
          const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
        }
      } else {
        setError('Import failed. Please try again.');
      }
    } catch (err) {
      console.error('Import failed:', err);
      setError('Import failed. Please check your data and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setImportResult(null);
    setPreviewData(null);
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Import Sections from CSV</h1>
        <p className="text-gray-600">Upload a CSV file to bulk import sections and courses.</p>
      </div>

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">CSV Template</h2>
        <p className="text-blue-700 text-sm mb-3">
          Download the template to see the required format for your CSV file.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Download CSV Template
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select CSV File</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="csvFileInput" className="block text-sm font-medium text-gray-700 mb-2">
              Choose CSV File
            </label>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 
                file:mr-4 file:py-2 file:px-4 
                file:rounded file:border-0 
                file:text-sm file:font-medium 
                file:bg-blue-50 file:text-blue-700 
                hover:file:bg-blue-100"
            />
          </div>
          
          {file && (
            <div className="text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handlePreview}
              disabled={!file || isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm"
            >
              {isLoading ? 'Loading...' : 'Preview Data'}
            </button>
            
            <button
              onClick={handleImport}
              disabled={!previewData || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              {isLoading ? 'Importing...' : 'Import Sections'}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:bg-gray-400 text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Preview Data */}
      {previewData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Data Preview ({previewData.length} rows)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-1 text-left">Dept Code</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Course Num</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Name</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Year</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Semester</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Section</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Type</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Day</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Start Time</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">End Time</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-2 py-1">{row.deptCode}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.courseNum}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.name}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.year}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.semester}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.section}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.type}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.day || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.startTime || '-'}</td>
                    <td className="border border-gray-300 px-2 py-1">{row.endTime || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <p className="text-gray-500 text-sm mt-2">
                Showing first 10 rows. Total: {previewData.length} rows.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className={`rounded-lg p-6 ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h2 className={`text-lg font-semibold mb-4 ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
            Import Results
          </h2>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{importResult.totalProcessed}</div>
              <div className="text-sm text-gray-600">Total Processed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{importResult.totalCreated}</div>
              <div className="text-sm text-gray-600">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{importResult.totalUpdated}</div>
              <div className="text-sm text-gray-600">Updated</div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-red-800 mb-2">Errors:</h3>
              <ul className="list-disc list-inside space-y-1">
                {importResult.errors.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {importResult.success && (
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => navigate('/user/coordinator/sections')}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                View Sections
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm"
              >
                Import More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
