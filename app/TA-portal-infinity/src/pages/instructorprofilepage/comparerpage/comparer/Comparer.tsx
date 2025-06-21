import { useState } from 'react';
import type Section from '../../../../interfaces/section/Section';
import SectionsColumn from '../../../../components/features/section/sectionscolumn/SectionsColumn';
import type { Student } from '../../../../interfaces/user/Student';
import { mockStudentEmmaDoe, mockStudentJohnDoe } from '../../../../mocked-objects/user/mockStudents';
import { mockCourseCOSC111 } from '../../../../mocked-objects/course/mockCourseCOSC111';
import { mockCourseMATH125 } from '../../../../mocked-objects/course/mockCourseMATH125';
import { fetchAllCoursesStudentHasCompleted } from '../../../../api/student/fetchAllCoursesStudentHasCompleted';
import StudentCard from '../../../../components/features/user/usercard/StudentCard';
import rightArrow from '../../../../assets/icons/right_arrow_black_border_transparent.png'
interface ComparerProps {
    sections?: Section[];
    className?: string;
}
//when clicking on a checkbox, enable searching by studentnumber.
export default function Comparer({ sections, className }: ComparerProps) {
    const [query, setQuery] = useState("");
    const [filtered,          setFiltered]          = useState<Student[]>([]);
    const [highlightCourseIds, setHighlightCourseIds] = useState<number[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student>();

    const handleSearch = () => {
        setFiltered([mockStudentJohnDoe, mockStudentEmmaDoe]);
    };

    const handleClickSection = (student: Student) => {
        setSelectedStudent(student);
        setHighlightCourseIds([]);
    }

    const handleCompareClick = async () => {
        if (!selectedStudent?.id) return;
        if( !sections) return;
        //call the backend for a list of courses that the STudent took. it should return Course[].
        const coursesReturnedFromBackend = [mockCourseCOSC111, mockCourseMATH125];
        const completed = await fetchAllCoursesStudentHasCompleted(selectedStudent.id);
        const completedIds = completed.map((c) => c.id);

        const completedSet = new Set(completedIds);
        const matches = sections.filter(sec => {
            const needs = sec.need?.courseNeeds ?? [];
            return needs.length > 0
                && needs.every(c => completedSet.has(c.id));
        }).map((sec) => sec.sectionDetails?.id)
        .filter((id): id is number => id !== undefined);
       
        setHighlightCourseIds(matches);
    };


    return (
        <div className={className}>
            <div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search for a TA, click on a TA, and click Compare"
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
                    <div className='relative group'>
                    <button onClick={handleCompareClick} disabled={!selectedStudent} 
                    className="bg-green-600 text-white text-sm px-2 py-1 rounded hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Compare Needs</button>
                    <span className="absolute ml-10 left-full top-1/2 -translate-y-1/2 ml-2 z-10  scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-normal break-words min-w-[20vw] max-w-[40vw]">
                            Each student should have a list of courses taken. Click to see which section on the right the student fulfills prerequisites.
                    </span>
                    </div>
                </div>
                {filtered.length ? (
                    <div className="grid gap-1">
                        {filtered.map((user) => {
                            const isSelected = selectedStudent?.id === user.id;
                            const cardClass = `cursor-pointer ${isSelected ? "outline-1 outline-offset-[-1px] outline-yellow-400" : ""}`;
                            return <span key={user.id} onClick={() => handleClickSection(user)}><StudentCard user={user} className={cardClass}/></span>
                        })}
                    </div>
                ) : (
                    <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
                        No students to display
                    </div>
                )}
            </div>
            <div className="grid place-items-center">
                <img src={rightArrow} alt="Right Arrow" className="w-12 h-12" />
            </div>
            <div className="flex flex-col">
                <h2 className='font-bold text-lg text-slate-400'>Sections Teaching</h2>
                <p className="text-xs text-slate-500 text-grey">A green or blue outline means the student can be allocated to that course</p>
                <SectionsColumn
                    sections={sections ? sections : []}
                    className=""
                    highlightCourseIds={highlightCourseIds}/>
            </div>
        </div>
    );
}
