import { useState } from 'react';

interface CourseFilterProps {
  onFilterChange: (filters: {
    term: string;
    searchQuery: string;
    deptCode: string;
    type: string;
  }) => void;
}

export default function CourseFilter({ onFilterChange }: CourseFilterProps) {
  const [term, setTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [type, setType] = useState('');

  const handleFilter = () => {
    onFilterChange({ term, searchQuery, deptCode, type });
  };

  const courseTypes = ["Lecture", "Tutorial", "Laboratory", "Discussion", "Seminar", "Workshop", "Experential", "Independent Study"];


  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search by course name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
        <select
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">All Terms</option>
          {/* Add other terms later OR Fetch from database */}
          <option value="Winter 2025">Winter 2025</option>
          <option value="Fall 2024">Fall 2024</option>
        </select>
        
        <select
          value={deptCode}
          onChange={(e) => setDeptCode(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">All Departments</option>
          <option value="COSC">COSC</option>
          <option value="MATH">MATH</option>
          <option value="PHYS">PHYS</option>
          {/* Add other department codes later OR Fetch from database */}
        </select>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded-md w-full"
        >
          <option value="">All Types</option>
          {courseTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <button onClick={handleFilter} className="bg-blue-500 text-white p-2 rounded-md w-full">
        Filter
      </button>
    </div>
  );
}