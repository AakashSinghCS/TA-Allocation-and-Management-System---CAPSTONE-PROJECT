import { GenericAPIContainer } from '../../../utility/genericapicontainer/GenericAPIContainer';
import type Section from '../../../interfaces/section/Section';
import { fetchAllStudentSectionsHasCompleted } from '../../../api/student/fetchAllStudentSectionsHasCompleted';
import { Link, useParams } from 'react-router-dom';
import StudentTabNav from '../../../components/layout/tabnav/studenttabnav/StudentTabNav';

export default function CoursesTakenPage() {
    const { studentId } = useParams();
    const sId = Number(studentId);
    return (
        <div className='mx-auto space-y-6 p-4'>
            <StudentTabNav />
            <h2 className="text-xl font-semibold mb-4">Courses Taken</h2>
            <GenericAPIContainer<Section[]>
                fetchFunction={() => fetchAllStudentSectionsHasCompleted(sId, true)}
                render={sections => (
                    <div className="overflow-x-auto">
                        <table className="min-w-full table-auto border-collapse">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="px-4 py-2 text-left">Course</th>
                                    <th className="px-4 py-2 text-left">Section</th>
                                    <th className="px-4 py-2 text-left">Term</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sections.map((sec, idx) => (
                                    <tr
                                        key={sec.sectionDetails?.id}
                                        className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                                    >
                                        <td className="px-4 py-2">
                                            <Link to="/"
                                            title="Go to course profile page"
                                            className="font-medium whitespace-nowrap hover:text-blue-600">
                                                {sec.sectionDetails?.deptCode} {sec.sectionDetails?.courseNum} – {sec.sectionDetails?.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-2">{sec.sectionDetails?.section}</td>
                                        <td className="px-4 py-2">{sec.sectionDetails?.term}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            />
        </div>
    );
}
