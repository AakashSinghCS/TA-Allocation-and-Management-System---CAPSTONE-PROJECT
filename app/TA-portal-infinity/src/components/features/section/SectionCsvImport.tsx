import React, { useState } from "react";
import Papa from "papaparse";

export default function SectionCsvImport() {
  // const [file, setFile] = useState<File | null>(null); // temporary commented out the unused state
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [csvPreview, setCsvPreview] = useState<Array<Record<string, string>> | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [parsedData, setParsedData] = useState<Array<Record<string, string>> | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Reset all UI state for new upload
    setError("");
    setResult("");
    setCsvPreview(null);
    setCsvHeaders([]);
    setParsedData(null);
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as Record<string, string>[];
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
    setError("");
    setResult("");
    if (!parsedData || parsedData.length === 0) {
      setError("Please select a valid CSV file and make sure it is not empty.");
      setLoading(false);
      return;
    }
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
      } else {
        text = await res.text();
      }
      if (!res.ok) {
        errorDetail = text ? `Import failed: ${text}` : `Import failed (status ${res.status})`;
        setError(errorDetail);
      } else {
        setResult(text);
      }
    } catch (err: any) {
      setError(err?.message ? `Import failed: ${err.message}` : "Import failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl min-w-[600px] mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-2">Import Sections from CSV</h2>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />
          <button
            type="submit"
            disabled={loading || !parsedData || parsedData.length === 0}
            className={`px-4 py-2 rounded font-semibold transition-colors ${loading || !parsedData || parsedData.length === 0 ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            {loading ? "Importing..." : "Import Sections from CSV"}
          </button>
        </div>
      </form>
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
      {error && <div className="mt-2 text-red-600">{error}</div>}
      {result && (
        <div
          className={`mt-2 whitespace-pre-line ${
            result.includes('Failed: 0') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {result}
        </div>
      )}
    </div>
  );
}
