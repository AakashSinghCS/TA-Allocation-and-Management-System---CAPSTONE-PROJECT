import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SectionList from '../../components/features/course/sectionlist/SectionList';
import SectionFilter from '../../components/features/course/coursefilter/SectionFilter';
import type Section from '../../interfaces/section/Section';
import { fetchFilteredSections, type FilterSectionsProps } from '../../api/sectionfilter/fetchFilteredSections';


export default function SectionListPage() {
  const navigate = useNavigate();
  const [filteredSections, setFilteredSections] = useState<FilterSectionsProps[] | null>([]);
  const [loading, setLoading] = useState(false);

  const handleFilterChange = async (filters: FilterSectionsProps) => {
    setLoading(true);
    try {
      const data = await fetchFilteredSections(filters);
      console.log(data);
      setFilteredSections(data);
    } catch (e) {
      navigate('/error', { replace: true, state: { message: (e as Error).message } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // handleFilterChange({ term: '', searchQuery: '', deptCode: '', type: '' });
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        {/* <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-slate-600 hover:text-slate-800 flex items-center mb-2"
        >
          <span aria-hidden="true" className="text-lg mr-1">←</span>
          <span>Back to Home</span>
        </button> */}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Search for a Section</h1>
          <Link
            to="/user/coordinator/sections/add"
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            Add New Section
          </Link>
        </div>

        <div className="border p-4 rounded-md shadow-sm mb-4">
          <SectionFilter onFilterChange={handleFilterChange} mode="large" />
        </div>

        {loading ? <p>Loading courses…</p> : <SectionList sections={filteredSections} />}
      </div>
    </div>
  );
}
