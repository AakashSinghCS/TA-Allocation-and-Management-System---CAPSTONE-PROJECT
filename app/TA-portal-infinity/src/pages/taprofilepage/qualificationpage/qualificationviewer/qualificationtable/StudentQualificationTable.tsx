import { useEffect, useState } from "react";
import { fetchAllStudentQualifications } from "../../../../../api/student/fetchAllStudentQualifications";
import { fetchSubmitStudentQualifications } from "../../../../../api/student/fetchSubmitStudentQualifications";
import type { DeptCodeQualificationResponse } from "../../../../../api/student/fetchAllDeptCodeQualifications";

interface StudentQualificationTableProps {
    qualificationList: DeptCodeQualificationResponse[];
    studentId: number;
}

export default function StudentQualificationTable({
    qualificationList,
    studentId,
}: StudentQualificationTableProps) {
    const [studentChecked, setStudentChecked] = useState<number[] | null>(null);

    useEffect(() => {
        fetchAllStudentQualifications(studentId).then((qIds) => {
            setStudentChecked(qIds ?? []);
        });
    }, [studentId]);

    if (studentChecked === null) {
        return <div>Loading your qualifications…</div>;
    }

    const handleCheckboxChange = (id: number) => {
        setStudentChecked((prev) => {
            if (!prev) return [];
            return prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        }
        );
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // we know studentChecked is number[] here
        fetchSubmitStudentQualifications(studentId, studentChecked);
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
    <table className="min-w-full table-auto border-collapse border rounded-lg overflow-hidden shadow-sm">
      <thead className="bg-slate-100 text-left text-sm">
        <tr>
          <th className="w-12 border px-2 py-2 text-center">✓</th>
          <th className="border px-4 py-2">Qualification</th>
          <th className="w-28 border px-3 py-2 text-right">Course</th>
        </tr>
      </thead>

      <tbody className="text-sm">
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
              <td className="border px-2 py-2 text-center">
                <input
                  type="checkbox"
                  checked={studentChecked.includes(id)}
                  onChange={() => handleCheckboxChange(id)}
                  className="h-4 w-4 accent-blue-600"
                />
              </td>

              <td className="border px-4 py-2">
                {qualification.description}
              </td>

              <td className="border px-3 py-2 text-right font-medium">
                {course.deptCode} {course.courseNum}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>

    <button
      type="submit"
      className="self-start px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
    >
      Save
    </button>
  </form>
);
}
