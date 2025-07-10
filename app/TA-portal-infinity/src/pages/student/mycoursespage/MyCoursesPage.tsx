// src/pages/student/MyCoursesPage.tsx

import React, { useState } from "react";
import pdfToText from "react-pdftotext";

interface ParsedCourse {
  courseId: string;       // e.g. "COSC 111"
  status: "COMPLETED" | "ENROLLED";
  gradePct: number | null; // e.g. 91
  classAvg: number | null; // e.g. 73
}

export default function MyCoursesPage() {
  const [rawText, setRawText] = useState("");
  const [courses, setCourses] = useState<ParsedCourse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setRawText("");
    setCourses([]);

    const file = e.target.files?.[0];
    if (!file) return;

    pdfToText(file)
      .then((text: string) => {
        setRawText(text);
        const lines = text.split(/\r?\n/);
        const parsed: ParsedCourse[] = [];

        lines.forEach((line) => {
          // 1) Find course code
          const codeM = line.match(/([A-Z]{4})_O\s*(\d{3})/);
          if (!codeM) return;
          const courseId = `${codeM[1]} ${codeM[2]}`;

          // 2) Determine status
          const isCip = /\bCIP\b/.test(line);
          const status = isCip ? "ENROLLED" : "COMPLETED";

          // 3) % Grade (only for COMPLETED)
          let gradePct: number | null = null;
          if (!isCip) {
            const pctM = line.match(/(\d{1,3})(?=\s+[A-F][+\-]?)/);
            if (pctM) gradePct = parseInt(pctM[1], 10);
          }

          // 4) Class average is the last number on the line
          const avgM = line.match(/(\d{1,3})\s*$/);
          const classAvg = avgM ? parseInt(avgM[1], 10) : null;

          parsed.push({ courseId, status, gradePct, classAvg });
        });

        setCourses(parsed);
      })
      .catch((err: any) => {
        console.error(err);
        setError("Failed to extract text from PDF. Is it a valid transcript?");
      });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Courses</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleFile}
        className="mb-4"
      />

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <h2 className="font-semibold mb-2">Extracted Text (debug)</h2>
      <textarea
        readOnly
        value={rawText}
        className="w-full h-40 p-2 mb-6 border"
      />

      <h2 className="font-semibold mb-2">Parsed Courses</h2>
      {courses.length > 0 ? (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {["Course ID", "Status", "% Grade", "Class Avg"].map((h) => (
                <th key={h} className="border px-2 py-1">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr key={i} className={i % 2 ? "bg-gray-50" : ""}>
                <td className="border px-2 py-1">{c.courseId}</td>
                <td className="border px-2 py-1">{c.status}</td>
                <td className="border px-2 py-1">
                  {c.gradePct != null ? `${c.gradePct}%` : "—"}
                </td>
                <td className="border px-2 py-1">
                  {c.classAvg ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No courses parsed yet.</p>
      )}
    </div>
  );
}
