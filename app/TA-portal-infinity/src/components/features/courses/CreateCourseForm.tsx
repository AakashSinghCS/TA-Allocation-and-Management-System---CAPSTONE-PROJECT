import { useState } from 'react';
import type { Course } from '../../../interfaces/course/Course';

interface CreateCourseFormProps {
  onCreateCourse: (course: Omit<Course, 'id'>) => void;
}

export default function CreateCourseForm({ onCreateCourse }: CreateCourseFormProps) {
  const [name, setName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [courseNum, setCourseNum] = useState('');
  const [section, setSection] = useState('');
  const [term, setTerm] = useState('');
  const [type, setType] = useState('Lecture');
  const [instructorId, setInstructorId] = useState('');
  const [prerequisites, setPrerequisites] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCourse({
      name,
      deptCode,
      courseNum,
      section,
      term,
      type,
      instructorId: Number(instructorId),
      prerequisites: prerequisites.split(',').map(p => p.trim()),
    });
  };
  
  const courseTypes = ["Lecture", "Tutorial", "Laboratory", "Discussion", "Seminar", "Workshop", "Experential", "Independent Study"];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Add Course Manually</h3>
      <div>
        <label>Course Name</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div>
        <label>Department Code</label>
        <input type="text" value={deptCode} onChange={e => setDeptCode(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div>
        <label>Course Number</label>
        <input type="text" value={courseNum} onChange={e => setCourseNum(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div>
        <label>Section</label>
        <input type="text" value={section} onChange={e => setSection(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div>
        <label>Term</label>
        <input type="text" value={term} onChange={e => setTerm(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div>
        <label>Type</label>
        <select value={type} onChange={e => setType(e.target.value)} className="border p-2 rounded-md w-full">
            {courseTypes.map(t => (
                <option key={t} value={t}>{t}</option>
            ))}
        </select>
      </div>
      <div>
        <label>Instructor ID</label>
        <input type="text" value={instructorId} onChange={e => setInstructorId(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <div>
        <label>Prerequisites (comma-separated)</label>
        <input type="text" value={prerequisites} onChange={e => setPrerequisites(e.target.value)} className="border p-2 rounded-md w-full" />
      </div>
      <button type="submit" className="bg-green-500 text-white p-2 rounded-md">Add Course</button>
    </form>
  );
}