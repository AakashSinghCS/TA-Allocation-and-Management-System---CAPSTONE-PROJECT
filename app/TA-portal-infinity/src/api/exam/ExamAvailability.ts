import type { EventInput } from "@fullcalendar/core";

export interface ExamAvailabilityDto {
  id?: number;
  studentId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export async function fetchExamAvailability(studentId: number, token: string) {
  const response = await fetch(`http://localhost:8080/exams/${studentId}/availability`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to fetch availability");
  return await response.json();
}

export async function submitExamAvailability(
  studentId: number,
  events: EventInput[],
  token: string
): Promise<void> {
  const dtoList: ExamAvailabilityDto[] = events.map(event => {
    const start = new Date(event.start as string);
    const end = new Date(event.end as string);
    return {
      studentId,
      date: start.toISOString().split("T")[0],
      startTime: start.toTimeString().split(" ")[0],
      endTime: end.toTimeString().split(" ")[0],
    };
  });

  const response = await fetch(`http://localhost:8080/exams/${studentId}/availability`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dtoList),
  });

  if (!response.ok) throw new Error("Failed to submit availability");
}

export async function deleteExamAvailability(studentId: number, token: string) {
  const res = await fetch(`http://localhost:8080/exams/${studentId}/availability`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete exam availability");
  }
}
