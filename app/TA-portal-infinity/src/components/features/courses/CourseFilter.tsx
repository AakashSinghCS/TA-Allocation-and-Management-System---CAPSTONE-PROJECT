import { useState } from 'react';

interface CourseFilterProps {
  onFilterChange: (filters: {
    term: string;
    searchQuery: string;
    deptCode: string;
    courseNum: string;
  }) => void;
}

export default function CourseFilter({ onFilterChange }: CourseFilterProps) {
  const [term, setTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [courseNum, setCourseNum] = useState('');

  const handleFilter = () => {
    onFilterChange({ term, searchQuery, deptCode, courseNum });
  };

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

        <input
          type="text"
          placeholder="Course Number (e.g., 101)"
          value={courseNum}
          onChange={(e) => setCourseNum(e.target.value)}
          className="border p-2 rounded-md w-full"
        />
      </div>
      <button onClick={handleFilter} className="bg-blue-500 text-white p-2 rounded-md w-full">
        Filter
      </button>
    </div>
  );
}