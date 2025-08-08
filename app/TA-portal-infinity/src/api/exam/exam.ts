import type { Course } from "../../interfaces/course/Course";
import type ExamAssignmentDto from "../../interfaces/exam/ExamAssignment";
import type Section from "../../interfaces/section/Section";


export async function fetchAllExams(token: string) {
  const res = await fetch("http://localhost:8080/exams", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch exams");
  return await res.json();
}

export interface CreateExamRequest {
  courseId: number;
  sectionId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface ExamAssignmentRequest {
  examId: number;
  studentId: number;
  task: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface StudentDto {
  id: number;
  firstName: string;
  lastName: string;
  studentNum: number;
  dept: string;
  year: number;
}

export async function createExam(payload: CreateExamRequest, token: string) {
  const res = await fetch("http://localhost:8080/exams", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create exam: ${res.status} ${errText}`);
  }

  return await res.json();
}

export async function assignStudentToExam(examId: number, payload: ExamAssignmentRequest, token: string) {
  const res = await fetch(`http://localhost:8080/exams/${examId}/assignments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error assigning: ${res.status} - ${err}`);
  }

  return await res.json();
}

export async function fetchAssignmentsByExamId(examId: number, token: string): Promise<ExamAssignmentDto[]> {
  const res = await fetch(`http://localhost:8080/exams/assignments/byexam/${examId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch assignments");
  return await res.json();
}

export async function fetchStudentById(studentId: number, token: string): Promise<StudentDto> {
  const res = await fetch(`http://localhost:8080/users/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to fetch student with ID ${studentId}`);
  return await res.json();
}

export async function deleteExamAssignment(assignmentId: number, token: string): Promise<void> {
  const res = await fetch(`http://localhost:8080/exams/assignments/${assignmentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to unassign: ${res.status} - ${err}`);
  }
}

export async function updateExamAssignment(updated: ExamAssignmentDto, token: string): Promise<void> {
  const res = await fetch(
    `http://localhost:8080/exams/assignments/${updated.examId}/student/${updated.studentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updated),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update assignment: ${res.status} - ${errText}`);
  }
}

export async function deleteExamById(examId: number, token: string): Promise<void> {
  const res = await fetch(`http://localhost:8080/exams/${examId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Delete failed: ${res.status} - ${errText}`);
  }
}

export async function fetchSectionById(sectionId: number, token: string): Promise<Section> {
  const res = await fetch(`http://localhost:8080/sections/get/${sectionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch section ${sectionId}`);
  return await res.json();
}

export async function fetchCourseById(courseId: number, token: string): Promise<Course> {
  const res = await fetch(`http://localhost:8080/courses/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch course ${courseId}`);
  return await res.json();
}