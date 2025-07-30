import React, { useRef, useState } from "react";
import Papa from "papaparse";

// SectionCsvImportInline for always-visible inline use
export default function SectionCsvImportInline() {
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

  const sampleHeaders = [
    "Dept Code", "Course Number", "Course Name", "Year", "Semester", "Section", "Type", "Day", "Start Time", "End Time"
  ];

  const handleDownloadSampleCsv = () => {
    const link = document.createElement("a");
    link.href = "/section-sample-template.csv";
    link.setAttribute("download", "section-sample-template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult("");
    setCsvPreview(null);
    setCsvHeaders([]);
    setParsedData(null);
    setImported(false);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setSelectedFileName(selectedFile.name);
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, string>[];
          if (!data || data.length === 0) {
            setError("CSV file is empty or invalid. Please check the file contents.");
            setParsedData(null);
            return;
          }
          setCsvPreview(data.slice(0, 10));
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
    setError("");
    setResult("");
    if (!parsedData || parsedData.length === 0) {
      setError("Please select a valid CSV file");
      setLoading(false);
      return;
    }
    try {
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
      let text = "";
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const json = await res.json();
        text = json.message || JSON.stringify(json);
      } else {
        text = await res.text();
      }
      if (!res.ok) {
        setError(`Import failed: ${text}`);
        return;
      } else {
        setResult(text);
        setImported(true);
      }
    } catch (err: any) {
      setError(
        err?.message
          ? `Import failed: ${err.message}`
          : `Import failed.\n${JSON.stringify(err)}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl min-w-[800px] bg-white rounded shadow p-6 mx-auto">
      <div className="text-lg font-bold text-gray-800 mb-1">Import Sections from CSV</div>
      <div className="text-gray-600 mb-1 text-sm">
        You can import multiple sections at once by uploading a CSV file (only .csv files are supported).
      </div>
      <div className="text-gray-500 mb-4 text-sm">
        To avoid formatting issues, please download and use the provided sample template.
      </div>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-base font-bold text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#334155">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 10l5 5 5-5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12" />
          </svg>
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 font-semibold ml-2"
          >
            Download Sample CSV
          </button>
        </div>
        <div className="flex items-center gap-2 text-base font-semibold text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#334155">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 10l-4-4-4 4" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12" />
          </svg>
          <span>Upload your CSV file</span>
        </div>
      </div>
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
          data-testid="csv-file-input"
          type="file"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      {error && (
        <div role="alert" className="mt-2 text-red-600">
          {error}
        </div>
      )}
      {csvPreview && csvPreview.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold mb-2">CSV Preview (first 10 rows):</div>
          <div className="overflow-auto max-h-96 border rounded">
            <table className="min-w-[600px] w-full text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 border-b border-r bg-gray-100 text-left">#</th>
                  {csvHeaders.map((header) => (
                    <th key={header} className="px-2 py-1 border-b bg-gray-100 text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1 border-b border-r text-gray-400 font-mono">{idx + 1}</td>
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
      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || imported}
          className={`px-4 py-2 rounded font-semibold transition-colors ${loading || imported ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-[#040941] text-white hover:bg-[#232a5c]'} `}
          // style={{ minWidth: 100 }}  // edit to change button width
        >
          {loading ? "Importing..." : "Import"}
        </button>
      </div>
    </div>
  );
}
