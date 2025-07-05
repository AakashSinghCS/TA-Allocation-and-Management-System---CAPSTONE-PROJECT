// src/pages/userBrowsing/Comparer.tsx
import { useState } from 'react';
import { useUserSearch, type SearchCriteria } from '../../../../components/ui/searchuserbar/SearchUserBar';
import StudentCard from '../../../../components/features/user/usercard/StudentCard';
import SectionsColumn from '../../../../components/features/section/sectionscolumn/SectionsColumn';
import { fetchAllCoursesStudentHasCompleted } from '../../../../api/student/fetchAllCoursesStudentHasCompleted';
import rightArrow from '../../../../assets/icons/right_arrow_black_border_transparent.png';
import type Section from '../../../../interfaces/section/Section';
import type { Student } from '../../../../interfaces/user/Student';
import SearchUserBar from '../../../../components/ui/searchuserbar/SearchUserBar';

interface ComparerProps {
    sections?: Section[];
    className?: string;
}

export default function Comparer({ sections = [], className }: ComparerProps) {
    // hook now holds searchedUsers, loading, error, search(), deleteUser()
    const { searchedUsers = [], loading, error, search, lastCriteria, deleteUser } = useUserSearch<Student>();
    const [selectedStudent, setSelectedStudent] = useState<Student>();

    const handleSearch = (criteria: SearchCriteria) => {
        return search(criteria);
    };

    const handleCompareClick = async () => {
        if (!selectedStudent?.id) return;
        const completed = await fetchAllCoursesStudentHasCompleted(selectedStudent.id);
        const completedIds = new Set(completed.map(c => c.id));
        const matches = sections
            .filter(sec =>
                sec.need?.prerequisites?.every(c => completedIds.has(c.id))
            )
            .map(sec => sec.course?.id)
            .filter((id): id is number => !!id);

        setHighlightCourseIds(matches);
    };

    const [highlightCourseIds, setHighlightCourseIds] = useState<number[]>([]);


    return (
        <div className={className}>
            <div className="mb-4">
                <SearchUserBar onSearch={handleSearch} loading={loading} allowedRoles={['Student']} />
                {error && <p className="text-red-500 mt-1">{error}</p>}
                <div className="mt-1 mb-1 flex">
                    <div className='relative group'>
                        <button onClick={handleCompareClick} disabled={!selectedStudent}
                            className="bg-green-600 text-white text-sm px-2 py-1 rounded hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed">Compare Needs</button>
                        <span className="absolute ml-10 left-full top-1/2 -translate-y-1/2 ml-2 z-10  scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-normal break-words min-w-[20vw] max-w-[40vw]">
                            Each student should have a list of courses taken. Click to see which section on the right the student fulfills course prerequisites.
                        </span>
                    </div>
                </div>
                <div className="space-y-2">
                    {searchedUsers && searchedUsers.length ? (
                        <div className="grid gap-1">
                            {searchedUsers.map(user => {
                                const isSelected = selectedStudent?.id === user.id;
                                const outline = isSelected
                                    ? 'outline outline-yellow-400'
                                    : '';
                                return (
                                    <div
                                        key={user.id}
                                        className={`cursor-pointer ${outline}`}
                                        onClick={() => {
                                            setSelectedStudent(user as Student);
                                            setHighlightCourseIds([]);
                                        }}
                                    >
                                        <StudentCard user={user as Student} />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-4 italic text-slate-400 border border-dashed rounded">
                            No students to display
                        </div>
                    )}
                </div>
            </div>
            <div className="my-4 flex items-center">

                <img src={rightArrow} alt="→" className="w-8 h-8 mx-2" />
            </div>

            <div>
                <h2 className="font-bold text-lg text-slate-600">Sections Teaching</h2>
                <p className="text-xs text-slate-500 mb-2">
                    Green/blue outlines show sections the student qualifies for.
                </p>
                <SectionsColumn
                    sections={sections}
                    highlightCourseIds={highlightCourseIds}
                />
            </div>
        </div>
    );
}
