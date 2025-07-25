import React, { useEffect, useState } from "react";
import type ExamAssignmentDto from "../../../interfaces/exam/ExamAssignment";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {BookCheck} from "lucide-react";
import {Clock} from "lucide-react";

interface AssignedStudentsListProps {
  examId: number;
}

interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  studentNum: number;
  dept: string;
  year: number;
}

const AssignedStudentsList: React.FC<AssignedStudentsListProps> = ({ examId }) => {
  const [assignments, setAssignments] = useState<ExamAssignmentDto[]>([]);
  const [studentMap, setStudentMap] = useState<Record<number, StudentDto>>({});
  const { token } = useAuth();

  useEffect(() => {
    fetchAssignments();
  }, [examId]);

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`http://localhost:8080/exams/assignments/byexam/${examId}`, {
        headers:{
          Authorization: `Bearer ${token}`,
        }
      });
      const data = await res.json();
      setAssignments(data);

      // Fetch unique student info
      const studentIds = [...new Set(data.map((a: ExamAssignmentDto) => a.studentId))] as number[];
      const studentInfo: Record<number, StudentDto> = {};

      await Promise.all(
        studentIds.map(async (id: number) => {
          const res = await fetch(`http://localhost:8080/users/${id}`, {
            headers:{
              Authorization: `Bearer ${token}`,
            }
          });
          if (res.ok) {
            const student = await res.json();
            studentInfo[id] = student;
          }
        })
      );

      setStudentMap(studentInfo);
    } catch (err) {
      toast.error("Failed to load assignments");
    }
  };

  const handleUnassign = async (assignmentId: number) => {
    try {
      await fetch(`http://localhost:8080/exams/assignments/${assignmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      toast.success("Student unassigned successfully");
      fetchAssignments();
    } catch {
      toast.error("Failed to unassign");
    }
  };

  const handleUpdate = (assignment: ExamAssignmentDto) => {
    // TODO: Open a modal or inline form to update assignment info
    console.log("Update clicked for:", assignment);
  };

  return (
    <div className="mt-1">
      <h4 className="font-bold mb-3">Assigned Students:</h4>
      {assignments.length === 0 ? (
        <p className="text-md text-gray-700">No students assigned yet.</p>
      ) : (
        <ul className="space-y-2">
          {assignments.map((a) => {
            const student = studentMap[a.studentId];
            return (
              <li key={a.id} className="flex items-center justify-between bg-white-100 p-2 rounded">
                <div>
                  <div className="font-medium">
                    {student
                      ? `${student.firstName} ${student.lastName} (${student.studentNum})`
                      : `Student ID: ${a.studentId}`}
                  </div>
                  <div className="flex items-center gap-2 text-lg text-gray-700">
                    <BookCheck size={20}/> Task: {a.task} | <Clock size={20} /> {a.startTime} - {a.endTime}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-[#040941] hover:bg-blue-700 text-white px-4 py-1 rounded w-[100px] h-[40px]"
                    onClick={() => handleUpdate(a)}
                  >
                    Update
                  </button>

                  <button
                    className="bg-red-800 hover:bg-red-700 text-white px-4 py-1 rounded w-[100px] h-[40px]"
                    onClick={() => handleUnassign(a.id)}
                  >
                    Delete
                  </button>

                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AssignedStudentsList;
