import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';
import SectionFilter from '../../../../components/features/course/coursefilter/SectionFilter';
import { type FilterSectionsProps } from '../../../../api/sectionfilter/fetchFilteredSections';
import SectionList from '../../../../components/features/course/sectionlist/SectionList';
import type Section from '../../../../interfaces/section/Section';
import type { Course } from '../../../../interfaces/course/Course';
import type { EnrollmentStatus } from '../../../../interfaces/course/CourseEnrollment';
import type { CourseEnrollmentOverview } from '../../../../interfaces/course/CourseEnrollment';
import { fetchDeleteEnrollment } from '../../../../api/student/enrollment/fetchDeleteEnrollment';
import { fetchEnrollStudent } from '../../../../api/student/enrollment/fetchEnrollStudent';
import { convertFilterSectionsToSections } from '../../../../utility/convertfiltersectionstosections/ConvertFilterSectionsToSections';
import { fetchFilteredSections } from '../../../../api/sectionfilter/fetchFilteredSections';
import { fetchAllStudentEnrollmentOverview } from '../../../../api/student/fetchAllStudentCompletedCourses';

// an enrollment can be tied to either a specific section or a whole course
type EnrollmentItem = {
    section?: Section;
    course?: Course;
    status: EnrollmentStatus;
    grade?: number;
    classAvg?: number;
    enrollmentIdForDelete?: number;  // existing enrollment ID for delete
};

export default function AddEnrollmentPage() {
    const { userId: studentId } = useAuth();
    const navigate = useNavigate();

    const [filteredSections, setFilteredSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(false);

    const [initialEnrollments, setInitialEnrollments] = useState<EnrollmentItem[]>([]);
    const [selectedEnrollments, setSelectedEnrollments] = useState<EnrollmentItem[]>([]);

    // load active + completed enrollments
    useEffect(() => {
        const loadOverview = async () => {
            const overview: CourseEnrollmentOverview | null = await fetchAllStudentEnrollmentOverview(studentId);
            if (!overview) return;

            // active (ENROLLED)
            const active: EnrollmentItem[] = (overview.currentCourses || []).map(a => ({
                section: { sectionDetails: a.section } as Section,
                status: 'ENROLLED',
                classAvg: a.classAverage,
                enrollmentIdForDelete: a.course.id
            }));

            // completed (COMPLETED)
            const completed: EnrollmentItem[] = (overview.completedCourses || []).map(c => ({
                // if no section on completed, use course-level
                course: c.course,
                status: 'COMPLETED',
                grade: c.grade,
                classAvg: c.classAverage,
                enrollmentIdForDelete: c.course.id
            }));

            const all = [...active, ...completed];
            setInitialEnrollments(all);
            setSelectedEnrollments(all);
        };
        loadOverview();
    }, [studentId]);

    // select a specific section
    const onSelect = useCallback((sec: Section) => {
        const sid = sec.sectionDetails?.sectionId;
        if (sid == null) return;
        setSelectedEnrollments(prev =>
            prev.some(e => e.section?.sectionDetails?.sectionId === sid) ? prev : [...prev, { section: sec, status: 'ENROLLED' }]
        );
    }, []);

    // select a whole course (no section details)
    const onSelectCourse = (cId: number, deptCode: string, courseNum: string, name: string) => {
        const course = { id: cId, deptCode: deptCode, courseNum: courseNum, name: name };
        setSelectedEnrollments(prev =>
            prev.some(e => e.course?.id === course.id) ? prev : [...prev, { course, status: 'ENROLLED' }]
        );
    };

    // remove an enrollment
    const onRemove = (idx: number) => {
        setSelectedEnrollments(prev => prev.filter((_, i) => i !== idx));
    };

    // update ENROLLED/COMPLETED
    const updateStatus = (idx: number, status: EnrollmentStatus) => {
        setSelectedEnrollments(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], status };
            return copy;
        });
    };

    // update grade or classAvg
    const updateField = (idx: number, field: 'grade' | 'classAvg', value: number) => {
        setSelectedEnrollments(prev => {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], [field]: value };
            return copy;
        });
    };

    // filter sections
    const handleFilter = async (filters: FilterSectionsProps) => {
        setLoading(true);
        const raw = await fetchFilteredSections(filters);
        setFilteredSections(convertFilterSectionsToSections(raw || []));
        setLoading(false);
    };

    // submit changes: delete removed, then add new
    const handleSave = async () => {
        const toDelete = initialEnrollments.filter(orig =>
            !selectedEnrollments.some(s => s.enrollmentIdForDelete === orig.enrollmentIdForDelete)
        );
        const toAdd = selectedEnrollments.filter(s => !s.enrollmentIdForDelete);

        //The backend is inherently faulty atm for Deletion.
        const deletionResults = await Promise.all(toDelete.map(d => fetchDeleteEnrollment(d.enrollmentIdForDelete ?? -1)));
        const enrollmentResults = await Promise.all(
            toAdd.map(s =>
                fetchEnrollStudent({
                    studentId,
                    courseId: s.course?.id ?? s.section?.sectionDetails?.id ?? -1,
                    sectionId: s.section?.sectionDetails?.sectionId,
                    status: s.status,
                    grade: s.grade,
                    classAvg: s.classAvg
                })
            )
        );
        const firstError = enrollmentResults.find(r => !r.success);
        if (firstError) {
            alert(`Unable to enroll: ${firstError.message}`);
            const secondError = deletionResults.find(r => !r.success);
            if (secondError) {
                alert(`Unable to enroll: ${secondError.message}`);
            }
            return;          // keep user on the page
        }

        navigate(`/user/taprofile/${studentId}/coursesTaken`);
    };

    return (
        <div className="container mx-auto p-4 space-y-6 max-w-3xl">
            <h1 className="text-xl font-semibold">Add Enrollments</h1>

            {/* Selected enrollments */}
            <div>
                <h2 className="font-semibold mb-2">Selected</h2>
                <div className="space-y-2">
                    {selectedEnrollments.map((e, idx) => {
                        const label = e.section
                            ? `${e.section.sectionDetails?.deptCode} ${e.section.sectionDetails?.courseNum} ${e.section.sectionDetails?.section} – ${e.section.sectionDetails?.name}`
                            : `${e.course?.deptCode} ${e.course?.courseNum} – ${e.course?.name}`;
                        return (
                            <div key={idx} className="flex items-center space-x-4">
                                <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>

                                <select
                                    className="border rounded px-2 py-1"
                                    value={e.status}
                                    onChange={ev => updateStatus(idx, ev.target.value as EnrollmentStatus)}
                                >
                                    <option value="ENROLLED">Enrolled</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>

                                {e.status === 'COMPLETED' && (
                                    <>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="Grade"
                                            value={e.grade ?? ''}
                                            onChange={ev => updateField(idx, 'grade', +ev.target.value)}
                                            className="w-16 border rounded px-2 py-1"
                                        />
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            placeholder="Class Avg"
                                            value={e.classAvg ?? ''}
                                            onChange={ev => updateField(idx, 'classAvg', +ev.target.value)}
                                            className="w-16 border rounded px-2 py-1"
                                        />
                                    </>
                                )}

                                <button onClick={() => onRemove(idx)} className="text-red-600 hover:underline text-sm">
                                    Remove
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filter sections */}
            <div className="border p-4 rounded">
                <SectionFilter onFilterChange={handleFilter} mode="large" />
            </div>

            {/* Section & course select list */}
            {loading ? (
                <p>Loading…</p>
            ) : (
                <SectionList
                    sections={filteredSections}
                    mode="studentAddEnrollment"
                    onSelect={onSelect}
                    onSelectCourse={onSelectCourse}
                />
            )}

            {/* Submit button */}
            <div className="flex justify-end">
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Submit
                </button>
            </div>
        </div>
    );
}
