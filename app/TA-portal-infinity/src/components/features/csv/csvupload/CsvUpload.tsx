import { useState } from 'react';

interface CsvUploadProps {
  onFileUpload: (file: File) => void;
}

export default function CsvUpload({ onFileUpload }: CsvUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
      />
      <button
        onClick={handleUpload}
        disabled={!file}
        className={`px-4 py-2 rounded font-semibold transition-colors ${file ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
      >
        Import Sections from CSV
      </button>
    </div>
  );
}