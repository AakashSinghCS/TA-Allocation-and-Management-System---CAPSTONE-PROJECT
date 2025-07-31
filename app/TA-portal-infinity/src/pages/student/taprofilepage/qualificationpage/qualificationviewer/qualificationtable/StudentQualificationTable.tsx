import { useEffect, useState } from "react";
import { fetchAllStudentQualifications } from "../../../../../../api/student/qualification/fetchAllStudentQualifications";
import { fetchSubmitStudentQualifications } from "../../../../../../api/student/qualification/fetchSubmitStudentQualifications";
import { useAuth } from "../../../../../../context/AuthContext";
import type { DeptCodeQualificationResponse } from "../../../../../../api/qualification/fetchAllDeptCodeQualifications";

interface StudentQualificationTableProps {
    qualificationList: DeptCodeQualificationResponse[];
    studentId: number;
}

export default function StudentQualificationTable({
    qualificationList,
    studentId,
}: StudentQualificationTableProps) {
    const [studentChecked, setStudentChecked] = useState<number[] | null>(null);
    const isStudent = useAuth().userRoles.includes('STUDENT')
    useEffect(() => {
        fetchAllStudentQualifications(studentId).then((qIds) => {
            setStudentChecked(qIds ?? []);
        });
    }, [studentId]);

    if (studentChecked === null) {
        return <div>Loading your qualifications…</div>;
    }

    const handleCheckboxChange = (id: number) => {
      if(!isStudent) return;
        setStudentChecked((prev) => {
            if (!prev) return [];
            return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        }
        );
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!isStudent) return;
        // we know studentChecked is number[] here
        const ok = await fetchSubmitStudentQualifications(studentId, studentChecked);
        if(!ok) alert("Failed to submit!")
        if(ok) alert("Submitted!");
    };

    // sort + filter out any items without a defined id
    const sorted = [...qualificationList]
        .filter((q) => q.qualification.id !== undefined)
        .sort((a, b) => {
            const aDept = a.course?.deptCode ?? "";
            const bDept = b.course?.deptCode ?? "";
            const deptCompare = aDept.localeCompare(bDept);
            if (deptCompare !== 0) return deptCompare;

            const aNum = Number(a.course?.courseNum ?? 0);
            const bNum = Number(b.course?.courseNum ?? 0);
            return aNum - bNum;
        });

    return (
  <form onSubmit={onSubmit} className="space-y-6">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-[#040941] mb-2">Available Qualifications</h3>
      <p className="text-sm text-gray-600">Check the boxes for courses where you have teaching qualifications.</p>
    </div>
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-12 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sorted.map(({ qualification, course }) => {
            const id = qualification.id!;
            const isChecked = studentChecked.includes(id);
            return (
              <tr key={id} className={`hover:bg-gray-50 transition-colors ${isChecked ? "bg-blue-50" : ""}`}>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCheckboxChange(id)}
                    className="h-4 w-4 text-[#040941] focus:ring-[#040941] border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{qualification.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#040941] text-white">
                    {course.deptCode} {course.courseNum}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {isStudent && (
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-6 py-2 bg-[#040941] text-white font-medium rounded-md hover:bg-[#1a1a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#040941] transition-colors"
        >
          Save Qualifications
        </button>
      </div>
    )}
  </form>
);
}
