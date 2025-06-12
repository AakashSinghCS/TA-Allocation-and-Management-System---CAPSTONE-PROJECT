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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Upload Courses via CSV</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleUpload} className="bg-blue-500 text-white p-2 rounded-md">Upload</button>
    </div>
  );
}