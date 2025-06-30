import { useNavigate } from 'react-router-dom';
import CreateSectionForm, { type CreateSectionData } from '../../components/features/course/createsectionform/CreateSectionForm';
import CsvUpload from '../../components/features/course/CsvUpload'; // stub

export default function AddSectionPage() {
  const navigate = useNavigate();

  const handleCreateSection = async (data: CreateSectionData) => {
    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create section');
      navigate('/courses', { replace: true });
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleFileUpload = (file: File) => {
    // TODO: implement CSV upload
    console.log('CSV file:', file);
  };

  return (
    <div className="container mx-auto p-4 w-full max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Add Section</h1>
      <div className="space-y-8">
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Add Section Manually</h2>
          <CreateSectionForm onCreateSection={handleCreateSection} />
        </div>
        <div className="border p-4 rounded-md shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Upload Sections via CSV</h2>
          <CsvUpload onFileUpload={handleFileUpload} />
        </div>
      </div>
    </div>
  );
}
