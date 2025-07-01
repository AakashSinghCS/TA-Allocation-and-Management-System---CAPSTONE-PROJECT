import { useNavigate, useParams } from "react-router-dom";
import SectionFilter from "../../../../components/features/course/coursefilter/SectionFilter";
import { useState } from "react";
import SectionList from "../../../../components/features/course/sectionlist/SectionList";
import type { Course } from "../../../../interfaces/course/Course";
import type Section from "../../../../interfaces/section/Section";
import { fetchFilteredSections, type FilterSectionsProps } from "../../../../api/sectionfilter/fetchFilteredSections";
import { convertFilterSectionsToSections } from "../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections";

export default function InstructorAddNeedPage() {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [prereqCourses, setPrereqCourses] = useState<Course[]>([]);
    const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);

    const handleFilterChange = async (filters: FilterSectionsProps) => {
        setLoading(true);
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

    const onSelectCourse = (cId: number, deptCode: string, courseNum: string, name: string) => {
        const selectedCourse: Course = { id: cId, deptCode: deptCode, courseNum: courseNum, name: name };
        setPrereqCourses({ ...prereqCourses, selectedCourse })
    }

    return (
        <div className="container mx-auto p-4 w-full max-w-3xl">
            {/* header containg section name(data is fetched using sectionId) */}
            {/* inputs for additional comments (description) and required hours  */}
            {prereqCourses?.map((c:Course)=> {
                
                return (<div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                <span>
                        {c.deptCode} {c.courseNum}-{c.name}
                    </span>
                    <button
                        type="button"
                        onClick={() => } //remove this course from the list
                        className="text-red-600 hover:underline text-sm"
                    >
                        Remove Course
                    </button>
                </div>
                )
            })}
            <div>
                <h3>Add a course to prerequisites</h3>
                <div className="border p-4 rounded-md shadow-sm mb-4">
                    <SectionFilter onFilterChange={handleFilterChange} mode="large" />
                </div>

                {loading
                    ? <p>Loading courses…</p>
                    : <SectionList
                        sections={filteredSections}
                        onSelectCourse={onSelectCourse}
                    />
                }
            </div>
        </div>
    )
}