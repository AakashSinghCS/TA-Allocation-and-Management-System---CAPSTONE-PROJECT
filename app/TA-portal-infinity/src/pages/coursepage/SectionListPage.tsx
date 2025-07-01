import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SectionList from '../../components/features/course/sectionlist/SectionList';
import SectionFilter from '../../components/features/course/coursefilter/SectionFilter';
import { fetchFilteredSections, type FilterSectionsProps } from '../../api/sectionfilter/fetchFilteredSections';
import type Section from '../../interfaces/section/Section';
import { convertFilterSectionsToSections } from '../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';


export default function SectionListPage() {
  const navigate = useNavigate();
  const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);
  const [lastFilters, setLastFilters]         = useState<FilterSectionsProps | null>(null);
  const [loading, setLoading]                 = useState(false);

  const handleFilterChange = async (filters: FilterSectionsProps) => {
    setLoading(true);
    setLastFilters(filters);
    try {
      const raw = await fetchFilteredSections(filters);
      const sections = convertFilterSectionsToSections(raw || []);
      setFilteredSections(sections);
    } catch (e) {
      navigate('/error', { replace: true, state: { message: (e as Error).message } });
    } finally {
      setLoading(false);
    }
  };

  // this will be passed down to <SectionList> and called after delete
  const handleDeleted = () => {
    if (lastFilters) {
      void handleFilterChange(lastFilters);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Search for a Section or Course</h1>
          <Link
            to="/user/coordinator/sections/add"
            className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            Add New Section or Course
          </Link>
        </div>
      <div className="border p-4 rounded-md shadow-sm mb-4">
        <SectionFilter onFilterChange={handleFilterChange} mode="large" />
      </div>

      {loading
        ? <p>Loading courses…</p>
        : <SectionList
            sections={filteredSections}
            onDeleted={handleDeleted}
          />
      }
    </div>
  );
}