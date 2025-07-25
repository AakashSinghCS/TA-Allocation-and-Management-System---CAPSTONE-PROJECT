import React, { useRef, useState } from "react";

// For debug logging in tests
declare global {
  interface Window {
    __DEBUG_PARSED_DATA__?: any;
  }
}
import Papa from "papaparse";

interface SectionCsvImportProps {
  onClose?: () => void;
}

export default function SectionCsvImport({ onClose }: SectionCsvImportProps) {
  // const [file, setFile] = useState<File | null>(null); // temporary commented out the unused state
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<Array<Record<string, string>> | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Array<Record<string, string>> | null>(null);
  const [imported, setImported] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample CSV headers
  const sampleHeaders = [
    "Dept Code",
    "Course Number",
    "Course Name",
    "Year",
    "Semester",
    "Section",
    "Type",
    "Day",
    "Start Time",
    "End Time"
  ];

  // Download sample CSV template
  // Download sample CSV file directly from public directory
  const handleDownloadSampleCsv = () => {
    const link = document.createElement("a");
    link.href = "/section-sample-template.csv";
    link.setAttribute("download", "section-sample-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Debug: log file change event
    console.log('File change event:', e.target.files);
    // Reset all UI state for new upload
    setError("");
    setResult("");
    setCsvPreview(null);
    setCsvHeaders([]);
    setParsedData(null);
    setImported(false); // Reset imported flag
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setSelectedFileName(selectedFile.name);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, string>[];
          // Debug: log parsed data
          console.log('Parsed CSV data:', data);
          window.__DEBUG_PARSED_DATA__ = data; // For test debug
          // Only error if no rows at all
          if (!data || data.length === 0) {
            setError("CSV file is empty or invalid. Please check the file contents.");
            setParsedData(null);
            return;
          }
          // Do not set error for partial/invalid rows, let backend handle it
          setCsvPreview(data.slice(0, 10)); // Show only the first 10 rows
          setCsvHeaders(results.meta.fields || []);
          setParsedData(data);
        },
        error: (err) => {
          setError("CSV parse error: " + err.message);
          setCsvPreview(null);
          setParsedData(null);
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear error before backend call
    setResult("");
    if (!parsedData || parsedData.length === 0) {
      setError("Please select a valid CSV file and make sure it is not empty.");
      setLoading(false);
      return;
    }
    // Debug: log parsedData before backend call
    console.log('Submitting parsedData to backend:', parsedData);
    try {
      // Map CSV headers to SectionCsvData fields
      const mapCsvRowToSection = (row: Record<string, string>) => ({
        deptCode: row["Dept Code"] || "",
        courseNum: row["Course Number"] || "",
        name: row["Course Name"] || "",
        year: row["Year"] ? parseInt(row["Year"]) : null,
        semester: row["Semester"] || "",
        section: row["Section"] || "",
        type: row["Type"] || "",
        day: row["Day"] || "",
        startTime: row["Start Time"] || "",
        endTime: row["End Time"] || ""
      });
      const mappedData = parsedData.map(mapCsvRowToSection);
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:8080/sections/import-csv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(mappedData),
      });
      let errorDetail = "";
      let text = "";
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        text = json.message || JSON.stringify(json);
        // Show more details if available
        if (json.error || json.errors) {
          errorDetail = `Import failed: ${text}\nDetails: ${JSON.stringify(json.error || json.errors)}`;
        }
      } else {
        text = await res.text();
      }
      if (!res.ok) {
        // Always show backend error message if present
        if (text) {
          console.log('Setting backend error:', `Import failed: ${text}`);
          setError(`Import failed: ${text}`);
        } else if (errorDetail) {
          console.log('Setting backend error:', errorDetail);
          setError(errorDetail);
        } else {
          console.log('Setting backend error:', `Import failed (status ${res.status})`);
          setError(`Import failed (status ${res.status})`);
        }
        return; // Ensure only backend error is shown after backend call
      } else {
        setResult(text);
        setImported(true); // Mark as imported
      }
    } catch (err: any) {
      setError(err?.message ? `Import failed: ${err.message}` : `Import failed.\n${JSON.stringify(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl min-w-[600px] mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-3xl font-bold mb-8">Import Sections from CSV</h2>
      <div className="mb-4 mt-2">
        <div className="flex items-center gap-2 mb-2 text-base font-bold text-gray-700">
          {/* Download icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#334155">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12" />
          </svg>
          Download the sample CSV
        </div>
        <button
          type="button"
          onClick={handleDownloadSampleCsv}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold"
        >
          Download Sample CSV
        </button>
      </div>

      {/* ...existing code... (removed explanation and horizontal rules) */}

      {/* Drag-and-drop upload area */}
      <div
        className={`mb-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'}`}
        style={{ minHeight: 120 }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setIsDragActive(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setIsDragActive(false);
        }}
        onDrop={e => {
          e.preventDefault();
          setIsDragActive(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFileName(e.dataTransfer.files[0].name);
            handleFileChange({
              target: { files: e.dataTransfer.files },
            } as React.ChangeEvent<HTMLInputElement>);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload CSV file by drag and drop or click"
      >
        <div className="flex flex-col items-center justify-center py-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#64748b" className="mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-8m0 0l-4 4m4-4l4 4" />
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#64748b" strokeWidth={2} fill="none" />
          </svg>
          <span className="text-gray-500">
            {selectedFileName ? selectedFileName : "Drag a file here or click to choose"}
          </span>
        </div>
        <input
          ref={fileInputRef}
          accept=".csv"
          id="csv-file"
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          {/* ...existing code... (remove old file input, drag-and-drop now handles file selection) */}
          <button
            type="submit"
            disabled={loading || imported}
            className={`px-4 py-2 rounded font-semibold transition-colors ${loading || imported ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {loading ? "Importing..." : "Import Sections from CSV"}
          </button>
        </div>
      </form>
      {/* Error message always immediately after form for visibility */}
      {error && (
        <div role="alert" className="mt-2 text-red-600">
          {error}
        </div>
      )}
      {/* CSV preview display */}
      {csvPreview && csvPreview.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold mb-2">CSV Preview (first 10 rows):</div>
          <div className="overflow-auto max-h-64 border rounded">
            <table className="min-w-[600px] w-full text-xs">
              <thead>
                <tr>
                  {csvHeaders.map((header) => (
                    <th key={header} className="px-2 py-1 border-b bg-gray-100 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview && csvPreview.length > 0 && csvPreview.map((row, idx) => (
                  <tr key={idx}>
                    {csvHeaders.map((header) => (
                      <td key={header} className="px-2 py-1 border-b">{row[header]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {result && (
        <div
          role="alert"
          className={`mt-2 whitespace-pre-line ${
            result.includes('Failed: 0') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {result}
        </div>
      )}
      {result && result.includes('Failed: 0') && (
        <>
        {/* Can change "Close" button position to "left", "center", or "right" by uncommenting the corresponding */}
        {/* left-aligned button */}
          {/* <div className="flex justify-start">
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
              onClick={onClose}
            >
              Close 
            </button>
          </div> */}

          {/* center-aligned button */}
          <div className="flex justify-center">
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
              onClick={onClose}
            >
              Close 
            </button>
          </div>

          {/* right-aligned button */}
          {/* <div className="flex justify-end">
            <button
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
              onClick={onClose}
            >
              Close
            </button>
          </div> */}
          
          
        </>
      )}
    </div>
  );
}
