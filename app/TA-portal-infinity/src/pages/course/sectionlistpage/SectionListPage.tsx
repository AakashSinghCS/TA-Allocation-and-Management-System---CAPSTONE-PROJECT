import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SectionList from '../../../components/features/course/sectionlist/SectionList';
import SectionFilter from '../../../components/features/course/coursefilter/SectionFilter';
import type Section from '../../../interfaces/section/Section';
import { convertFilterSectionsToSections } from '../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { fetchDeleteSection } from '../../../api/section/fetchDeleteSection';
import { fetchDeleteCourse } from '../../../api/course/fetchDeleteCourse';
import { fetchFilteredSections, type FilterSectionsProps } from '../../../api/course/sectionfilter/fetchFilteredSections';


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
  const handleDeleted = async(id : number, isCourse : boolean) => {

    if(isCourse){
      await fetchDeleteCourse(id);
    }else{
      await fetchDeleteSection(id);
    }
    if (lastFilters) {
      void handleFilterChange(lastFilters);
    }
  };

  return (
    <div className="container mx-auto p-4 z-10">
      <div className="flex justify-between items-stretch mb-4">
          <h1 className="text-xl font-semibold">Search for a Section or Course</h1>
          <Link
            to="/user/coordinator/sections/add"
            className="bg-[#00c89c] text-white px-4 py-1 rounded hover:bg-[#c7fcec] transition-colors text-white"
          >
            Add New Section or Course
          </Link>
        </div>
      <div className="shadow-lg p-4 rounded-2xl  mb-4 ">
        <SectionFilter onFilterChange={handleFilterChange} mode="large" />
      </div>

      {loading
        ? <p>Loading courses…</p>
        : <SectionList
            sections={filteredSections}
            onDeleted={handleDeleted}
            // mode = 'coordinator'
          />
      }
    </div>
  );
}