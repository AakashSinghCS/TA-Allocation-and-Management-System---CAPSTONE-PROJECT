import { useState, type JSX } from 'react';
import { fetchAllStudentSectionsHasCompleted } from '../../../../api/student/fetchAllStudentSectionsHasCompleted';
import rightArrow from '../../../../assets/icons/right_arrow_black_border_transparent.png';
import SectionCard from '../../../../components/features/section/sectioncard/SectionCard';
import SectionsColumn from '../../../../components/features/section/sectionscolumn/SectionsColumn';
import type { Course } from '../../../../interfaces/course/Course';
import type Section from '../../../../interfaces/section/Section';
import { mockSectionCOSC111 } from '../../../../mocked-objects/section/mockSectionCOSC111';
import { mockSectionCOSC121 } from '../../../../mocked-objects/section/mockSectionCOSC121';
import { GenericAPIContainer } from '../../../../utility/genericapicontainer/GenericAPIContainer';

interface ComparerProps {
    studentId: number;
    className?: string;
}
//commented out the dropdown, because I don't uncertain whether the coordinator will ever need the other options.
//TODO: Need to make sure the searchbar is efficient. Add filtering. Need to make sure that it's more convenient to use the Comparer and scroll through and search manually.
//auto-fill the checkbox for the "current term" filter
//click on a checkbox to search the sections of a certain instructor instead. (you search the name of the instructor)
export default function Comparer({ studentId, className }: ComparerProps) {
    const [selectedOption, setSelectedOption] = useState("coursesTaken");
    const [query, setQuery] = useState("");
    const [filtered, setFiltered] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState<Section>();
    const [highlightCourseIds, setHighlightCourseIds] = useState<number[]>([]);
    const [exactMatchId, setExactMatchId] = useState<number | null>(null);
    const [neededCourses, setNeededCourses] = useState<Course[]>([]);

    const optionComponents: Record<string, () => JSX.Element> = {
        allocationHistory: () => <GenericAPIContainer<Section[]>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(studentId, true)}
            render={(data) => (
                <SectionsColumn
                    sections={data ? data : []}
                    className=""
                    highlightCourseIds={highlightCourseIds} exactMatchId={exactMatchId}
                />
            )}
        />,
        sectionsTaking: () => <GenericAPIContainer<Section[]>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(studentId, false)}
            render={(data) => (
                <SectionsColumn
                    sections={data ? data : []}
                    className=""
                    highlightCourseIds={highlightCourseIds} exactMatchId={exactMatchId} neededCourses={neededCourses}
                />
            )}
        />,
        coursesTaken: () => <GenericAPIContainer<Section[]>
            fetchFunction={() => fetchAllStudentSectionsHasCompleted(studentId, true)}
            render={(data) => (
                <SectionsColumn
                    sections={data ? data : []}
                    className=""
                    highlightCourseIds={highlightCourseIds} exactMatchId={exactMatchId} neededCourses={neededCourses}
                />
            )}
        />,
    }

    // const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    //     setSelectedOption(event.target.value);
    //     setHighlightCourseIds([]);
    //     setExactMatchId(null);
    //     setNeededCourses([]);
    // };

    const handleSearch = () => {
        setFiltered([mockSectionCOSC111, mockSectionCOSC121]);
    };

    const handleClickSection = (section: Section) => {
        setSelectedSection(section);
        setHighlightCourseIds([]);
        setExactMatchId(null);
        setNeededCourses([]);
    }

    const handleCompareClick = () => {
        if (!selectedSection) return;
        setExactMatchId(null);
        const needs = selectedSection?.need?.prerequisites ?? [];
        const courseIds = needs.flatMap((c) => c.id ? [c.id] : [])
        setHighlightCourseIds(courseIds);
        setNeededCourses(needs);
    };

    const handleExactMatch = () => {
        if (!selectedSection) return;
        setExactMatchId(selectedSection.sectionDetails?.id ?? null);
        setHighlightCourseIds([]);
        setNeededCourses([]);
    };


    return (
        <div className={className}>
            <div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search for a section, click on a section, and click compare"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-[#040941] text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>
                <div className="mt-1 mb-1 flex">
                    <div className="relative group">
                        <button onClick={handleCompareClick} disabled={!selectedSection}
                            className="bg-green-600 text-white text-sm px-2 py-1 rounded hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Compare Needs</button>
                        <span className="absolute ml-10 left-full top-1/2 -translate-y-1/2 ml-2 z-10  scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-normal break-words min-w-[20vw] max-w-[40vw]">
                            Each section should have course prerequisites set by the Instructor. Click to see if the student fulfills the prerequisites. You'll should see something change in the right column. 
                            If the selected section has no course prerequisites set, there will be no changes in the right column.
                        </span>
                    </div>
                    &nbsp;
                    <div className="relative group">
                        <button onClick={handleExactMatch} disabled={!selectedSection}
                            className="bg-blue-600 text-white text-sm px-2 py-1 rounded hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Find Exact Match </button>
                        <span className="absolute ml-10 left-full top-1/2 -translate-y-1/2 ml-2 z-10 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-normal break-words min-w-[20vw] max-w-[40vw]">
                            Click to see if there exists in the list of courses in the right column matching your selected section.
                        </span>
                    </div>
                </div>
                {filtered.length ? (
                    <div className="grid gap-1">
                        {filtered.map((sec) => {
                            const isSelected = selectedSection && sec.sectionDetails?.id === selectedSection.sectionDetails?.id;
                            const cardClass = `cursor-pointer ${isSelected ? "outline-1 outline-offset-[-1px] outline-yellow-400" : ""}`;
                            return <span key={sec.sectionDetails?.id} onClick={() => handleClickSection(sec)}><SectionCard section={sec} className={cardClass} /></span>
                        })}
                    </div>
                ) : (
                    <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
                        No courses to display
                    </div>
                )}
            </div>
            <div className="grid  place-items-center">
                <img src={rightArrow} alt="Right Arrow" className="w-12 h-12" />
            </div>
            <div className="flex flex-col">
                {/* <select id="columnSelect" value={selectedOption} onChange={handleDropdownChange} className="border rounded px-2 py-1">
                    <option value="allocationHistory">Allocation History</option>
                    <option value="coursesTaken">Courses Taken</option>
                </select> */}
                <h2 className="font-bold text-lg text-slate-400 ">Courses Taken</h2>
                <p className="text-xs text-slate-500 text-grey">A green or blue outline means it is matched</p>
                {optionComponents[selectedOption]()}
            </div>
        </div>
    );
}
