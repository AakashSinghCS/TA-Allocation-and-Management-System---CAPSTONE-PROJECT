import { useState } from 'react';

interface CourseFilterProps {
  onFilterChange: (filters: { term: string; searchQuery: string }) => void;
}

export default function CourseFilter({ onFilterChange }: CourseFilterProps) {
  const [term, setTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilter = () => {
    onFilterChange({ term, searchQuery });
  };

  return (
    <div className="flex gap-4 mb-4">
      <input
        type="text"
        placeholder="Search courses..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="border p-2 rounded-md"
      />
      <select
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        className="border p-2 rounded-md"
      >
        <option value="">All Terms</option>
        <option value="Winter 2025">Winter 2025</option>
        <option value="Fall 2024">Fall 2024</option>
      </select>
      <button onClick={handleFilter} className="bg-blue-500 text-white p-2 rounded-md">
        Filter
      </button>
    </div>
  );
}