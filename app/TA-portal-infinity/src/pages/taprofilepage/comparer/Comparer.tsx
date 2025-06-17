import SectionCard from '../../../components/features/section/sectioncard/SectionCard';
import { mockSectionCOSC111 } from '../../..//mocked-objects/mockSectionCOSC111';
import { mockSectionCOSC121 } from '../../../mocked-objects/mockSectionCOSC121';
import { useState, type JSX } from 'react';
import type Section from '../../../interfaces/section/Section';
import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import { fetchAllStudentSectionsHasCompleted } from '../../../api/student/fetchAllStudentSectionsHasCompleted';
import SectionsColumn from '../../../components/features/section/sectionscolumn/SectionsColumn';
import type { Course } from '../../../interfaces/need/Course';

interface ComparerProps {
    studentId: number;
    className?: string;
}
export default function Comparer({ studentId, className }: ComparerProps) {
    const [selectedOption, setSelectedOption] = useState("sectionsTaken");
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
        sectionsTaken: () => <GenericAPIContainer<Section[]>
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

    const handleDropdownChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOption(event.target.value);
        setHighlightCourseIds([]);
        setExactMatchId(null);
        setNeededCourses([]);
    };

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
        const needs = selectedSection?.need?.courseNeeds ?? [];
        setHighlightCourseIds(needs.flatMap((c) => c.id ? [c.id]:[]));
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
                <div className="flex gap-2 mb-4">
                    <input
                        type="text"
                        placeholder="Search for a section, click on a section, and click compare"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Search
                    </button>
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
            <div className="grid">
                <button onClick={handleCompareClick} disabled={!selectedSection} className="mt-3 text-blue-600 underline disabled:text-slate-400">Compare Needs</button>
                <button onClick={handleExactMatch} disabled={!selectedSection} className="mt-3 text-blue-600 underline disabled:text-slate-400">Exact Match </button>
            </div>
            <div className="flex flex-col">
                <select id="columnSelect" value={selectedOption} onChange={handleDropdownChange} className="border rounded px-2 py-1">
                    <option value="allocationHistory">Allocation History</option>
                    <option value="sectionsTaking">Courses Taking</option>
                    <option value="sectionsTaken">Courses Taken</option>
                </select>
                <p className="text-xs text-slate-500 text-grey">A green or blue outline means it is matched</p>
                {optionComponents[selectedOption]()}
            </div>
        </div>
    );
}
