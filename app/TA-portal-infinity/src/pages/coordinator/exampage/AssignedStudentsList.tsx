import React, { useEffect, useState } from "react";
import type ExamAssignmentDto from "../../../interfaces/exam/ExamAssignment";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {BookCheck} from "lucide-react";
import {Clock} from "lucide-react";
import UpdateAssignmentModal from "./UpdateAssignmentModal";
import { fetchAssignmentsByExamId, fetchStudentById, deleteExamAssignment, updateExamAssignment} from "../../../api/exam/exam";
import type { StudentOrInstructorOrCoordinator } from "../../../interfaces/user/User";


interface AssignedStudentsListProps {
  examId: number;
  onRef?: (fn: () => void) => void;
}

interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  studentNum: number;
  dept: string;
  year: number;
}

const AssignedStudentsList: React.FC<AssignedStudentsListProps> = ({ examId, onRef }) => {
  const [assignments, setAssignments] = useState<ExamAssignmentDto[]>([]);
  const [studentMap, setStudentMap] = useState<Record<number, StudentDto>>({});
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ExamAssignmentDto | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, [examId]);

  useEffect(() => {
    if (onRef){
      onRef(fetchAssignments);
    }
  }, [onRef, examId]);

  const fetchAssignments = async () => {
    try {
      const data = await fetchAssignmentsByExamId(examId, token!);
      setAssignments(data);

      const studentIds = [...new Set(data.map((a) => a.studentId))];
      const studentInfo: Record<number, StudentDto> = {};

      await Promise.all(
        studentIds.map(async (id) => {
          try {
            const student = await fetchStudentById(id, token!);
            studentInfo[id] = student;
          } catch (e) {
            console.error(`Failed to fetch student ${id}:`, e);
          }
        })
      );

      setStudentMap(studentInfo);
    } catch (err) {
      console.error("Assignment fetch error:", err);
      toast.error("Failed to load assignments");
    }
  };

  const handleUnassign = async (assignmentId: number) => {
    try {
      await deleteExamAssignment(assignmentId, token!);
      toast.success("Student unassigned successfully");
      fetchAssignments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to unassign");
    }
  };

  const handleUpdate = (assignment: ExamAssignmentDto) => {
    setSelectedAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAssignment(null);
  };

  const handleAssignmentUpdate = async (updated: ExamAssignmentDto) => {
    try {
      await updateExamAssignment(updated, token!);
      toast.success("Assignment updated successfully");
      fetchAssignments();
      handleModalClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update assignment");
    }
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
      {selectedAssignment && (
        <UpdateAssignmentModal
        isOpen={isModalOpen}
        assignment={selectedAssignment}
        onUpdate={handleAssignmentUpdate}
        onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default AssignedStudentsList;
