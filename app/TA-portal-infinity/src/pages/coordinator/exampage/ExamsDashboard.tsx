import React, { useEffect, useState } from "react";
import type { ExamDto } from "../../../interfaces/exam/Exam";
import { useAuth } from '../../../context/AuthContext';
import { toast, ToastContainer } from "react-toastify";
import AssignedStudentsList from "../exampage/AssignedStudentsList";
import type { Course } from "../../../interfaces/course/Course";
import type Section from "../../../interfaces/section/Section";
import UpdateExamModal from "../exampage/UpdateExamModal";
import {Calendar, Clock } from "lucide-react";

const ExamsDashboard = ({ onRef, assignmentRefMap,}: {onRef?: (fn: () => void) => void; assignmentRefMap?: React.MutableRefObject<Record<number, () => void>>; }) => {

  const { token } = useAuth();
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [sectionMap, setSectionMap] = useState<Record<number, Section>>({});
  const [courseMap, setCourseMap] = useState<Record<number, Course>>({});
  const [selectedExam, setSelectedExam] = useState<ExamDto | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);


  const load = async () => {
    const fetchedExams = await fetchExams();
    await fetchExtraDetails(fetchedExams);
  };

  useEffect(() => {
    if (onRef) {
      onRef(load);
    }
  }, [onRef]);

  useEffect(() => {
    load();
  }, []);
  
  const fetchExams = async () => {
    try {
      const res = await fetch("http://localhost:8080/exams", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch exams");

      const data = await res.json();
      setExams(data);
      return data;
    } catch (err) {
      toast.error("Error loading exams");
      console.error(err);
    }
  };

  const handleDelete = async (examId: number) => {
    try {
      const res = await fetch(`http://localhost:8080/exams/${examId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Exam deleted");
      setExams(prev => prev.filter(e => e.id !== examId));
    } catch (err) {
      toast.error("Failed to delete exam");
      console.error(err);
    }
  };

  const fetchExtraDetails = async (exams: ExamDto[]| undefined) => {
    if (!exams || exams.length === 0) return;
    const sections: Record<number, Section> = {};
    const courses: Record<number, Course> = {};

    await Promise.all(exams.map(async (exam) => {
      if (!sections[exam.sectionId]) {
        const secRes = await fetch(`http://localhost:8080/sections/get/${exam.sectionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        if (secRes.ok) {
          const secData = await secRes.json();
          sections[exam.sectionId] = secData;

          if (!courses[secData.course.id]) {
            const courseRes = await fetch(`http://localhost:8080/courses/${secData.course.id}`, {
              headers:{
                Authorization: `Bearer ${token}`,
              }
            });
            if (courseRes.ok) {
              const courseData = await courseRes.json();
              courses[secData.course.id] = courseData;
            }
          }
        }
      }
    }));

    setSectionMap(sections);
    setCourseMap(courses);
  };


  return (
    <div className="mt-10 space-y-8">
      {exams.length === 0 ? (
        <p className="text-center">No exams available.</p>
      ) : (
        exams.map(exam => (
          <div
            key={exam.id}
            className="border border-gray-200 p-6 bg-white rounded shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:justify-between">
              <div>
                {(() => {
                  const section = sectionMap[exam.sectionId];
                  const courseId = section?.course?.id;
                  const course = courseId !== undefined ? courseMap[courseId] : undefined;
                  return section && course ? (
                    <p className="font-bold">
                      {course.deptCode} {course.courseNum} {section.section} {section.semester} {section.year}
                    </p>
                  ) : (
                    <p className="text-gray-400">Loading section info...</p>
                  );
                })()}

                <p className="flex items-center gap-2 text-lg text-gray-700">
                  <Calendar size={20} />
                  {exam.date} |
                  <Clock size={20} />
                  {exam.startTime} – {exam.endTime}
                </p>
              </div>
              <div className="flex gap-3 mt-2 md:mt-0">
                <button
                  onClick={() => {
                    setSelectedExam(exam);
                    setShowUpdateModal(true);
                  }}
                  className="bg-[#040941] hover:bg-blue-700 text-white px-4 py-1 rounded w-[100px] h-[40px]"
                >
                  Update
                </button>
                {showUpdateModal && selectedExam && (
                  <UpdateExamModal
                    exam={selectedExam}
                    closeModal={() => setShowUpdateModal(false)}
                    onUpdate={fetchExams}
                  />
                )}
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="bg-red-800 hover:bg-red-700 text-white px-4 py-1 rounded w-[100px] h-[40px]"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="pt-4">
              <AssignedStudentsList 
                examId={exam.id}
                onRef={(fn) => {
                  if (assignmentRefMap) {
                    assignmentRefMap.current[exam.id] = fn;
                  }
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ExamsDashboard;
