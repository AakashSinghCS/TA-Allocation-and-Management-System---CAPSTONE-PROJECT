import { useState } from "react";
import SectionFilter from "../../../../components/features/course/coursefilter/SectionFilter";
import SectionList from "../../../../components/features/course/sectionlist/SectionList";
import { useNavigate } from "react-router-dom";
import type Section from "../../../../interfaces/section/Section";
import { fetchFilteredSections, type FilterSectionsProps } from "../../../../api/sectionfilter/fetchFilteredSections";
import { convertFilterSectionsToSections } from "../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections";
import { fetchAssignInstructor } from "../../../../api/section/instructor/fetchAssignInstructor";
import { useAuth } from "../../../../context/AuthContext";

export default function InstructorAddSectionPage() {
    const instructorId = useAuth().userId;
    const navigate = useNavigate();
    const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);
    const [loading, setLoading] = useState(false);

    const handleFilterChange = async (filters: FilterSectionsProps) => {
        setLoading(true);
        // setLastFilters(filters);
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
     const onSelect = async(section : Section) => {
        //alert user here. confirm.
        const ok = await fetchAssignInstructor(instructorId, section.sectionDetails?.sectionId ?? -1)
        if(ok) alert("Section added!")
        if(!ok) alert("Failed to add section.")
        navigate(`/user/instructorprofile/${instructorId}/need`)
      };
    return (
        <div className="container mx-auto p-4">
            <div className="justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">Search for a Section</h1>
                <p className="text-sm text-gray-400">Search for a section and click on Select in the far right column.</p>
            </div>
            <div className="border p-4 rounded-md shadow-sm mb-4">
                <SectionFilter onFilterChange={handleFilterChange} mode="large" />
            </div>

            {loading
                ? <p>Loading courses…</p>
                : <SectionList
                    sections={filteredSections}
                    onSelect={onSelect }
                    mode='instructor'
                />
            }
        </div>
    )
}