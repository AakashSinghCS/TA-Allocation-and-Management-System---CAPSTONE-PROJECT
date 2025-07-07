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
  <form onSubmit={onSubmit} className="space-y-4">
    <table className="min-w-full table-auto border-collapse border border-gray-300 overflow-hidden">
      <thead className="bg-slate-100 text-left text-sm">
        <tr>
          <th className="w-12 border border-gray-300 px-2 py-2 text-center 2xl:text-medium">✓</th>
          <th className="border border-gray-300 px-4 py-2 2xl:text-medium">Qualification</th>
          <th className="w-28 border border-gray-300 px-3 py-2 text-right 2xl:text-medium">Course</th>
        </tr>
      </thead>

      <tbody className="text-sm 2xl:text-base">
        {sorted.map(({ qualification, course }, idx) => {
          const id = qualification.id!;
          return (
            <tr
              key={id}
              className={`
                border-t
                ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
              `}
            >
              <td className="border border-gray-300 px-2 py-2 text-center">
                <input
                  type="checkbox"
                  checked={studentChecked.includes(id)}
                  onChange={() => handleCheckboxChange(id)}
                  className="h-4 w-4 accent-blue-600"
                />
              </td>

              <td className="border border-gray-300 px-4 py-2">
                {qualification.description}
              </td>

              <td className="border border-gray-300 px-3 py-2 text-right font-medium">
                {course.deptCode} {course.courseNum}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    {isStudent && <button
      type="submit"
      className="w-full bg-[#00c89c] text-white py-2 rounded hover:bg-[#c7fcec] transition-colors"
    >
      Save
    </button>
}
  </form>
);
}
