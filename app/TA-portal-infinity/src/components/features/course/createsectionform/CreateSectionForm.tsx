import { useState, type FormEvent } from 'react';
import { sectionTypeOptions } from '../../../../interfaces/section/SectionDetails';
import { timeOptions } from '../../../ui/timeselector/TimeSelector';
import { useNavigate } from 'react-router-dom';
export interface CreateSectionData {
  name: string;
  deptCode: string;
  courseNum: string;
  section: string;
  year: number | null;
  semester: string;
  type: string;
  day: string;
  startTime: string;
  endTime: string;
  instructorId: number | null;
}

interface Props {
  onCreateSection: (data: CreateSectionData) => void;
}

export default function CreateSectionForm({ onCreateSection }: Props) {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const navigate = useNavigate();

  const [form, setForm] = useState<CreateSectionData>({
    name: '',
    deptCode: '',
    courseNum: '',
    section: '',
    year: null,
    semester: '',
    type: '',
    day: '',
    startTime: '',
    endTime: '',
    instructorId: null,
  });

  const handleChange = <K extends keyof CreateSectionData>(key: K, val: any) => {
    setForm(f => ({ ...f, [key]: val }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    onCreateSection(form);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">Section Name</label>
        <input
          id="name"
          type="text"
          placeholder="e.g. 'Introduction to Computer Science...'"
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label htmlFor="deptCode" className="block text-sm font-medium">Department Code</label>
        <input
          id="deptCode"
          type="text"
          placeholder="e.g. 'COSC', 'MATH'"
          value={form.deptCode}
          onChange={e => handleChange('deptCode', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label htmlFor="courseNum" className="block text-sm font-medium">Course Number</label>
        <input
          id="courseNum"
          type="text"
          placeholder="e.g. '111','121'"
          value={form.courseNum}
          onChange={e => handleChange('courseNum', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label htmlFor="section" className="block text-sm font-medium">Section Code</label>
        <input
          id="section"
          type="text"
          placeholder="e.g. '001', 'L01'"
          value={form.section}
          onChange={e => handleChange('section', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium">Year</label>
        <input
          id="year"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          placeholder="e.g. 2024"
          value={form.year ?? ''}
          onChange={e => handleChange('year', Number(e.target.value.replace(/\D/g, '')))}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label htmlFor="semester" className="block text-sm font-medium">Semester</label>
        <select
          id="semester"
          value={form.semester}
          onChange={e => handleChange('semester', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Semester</option>
          <option value="W1">W1 (Winter, first semester)</option>
          <option value="W2">W2 (Winter, second semester)</option>
          <option value="S1">S1 (Summer, first semester)</option>
          <option value="S2">S2 (Summer, second semester)</option>
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium">Section Type</label>
        <select
          id="type"
          value={form.type}
          onChange={e => handleChange('type', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Type</option>
          {sectionTypeOptions.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="day" className="block text-sm font-medium">Day of Week</label>
        <select
          id="day"
          value={form.day}
          onChange={e => handleChange('day', e.target.value)}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Day</option>
          {daysOfWeek.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium">Start Time</label>
          <select
            id="startTime"
            value={form.startTime}
            onChange={e => handleChange('startTime', e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Start Time</option>
            {timeOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium">End Time</label>
          <select
            id="endTime"
            value={form.endTime}
            onChange={e => handleChange('endTime', e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">End Time</option>
            {timeOptions.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="instructorId" className="block text-sm font-medium">Instructor ID</label>
        <input
          id="instructorId"
          type="number"
          placeholder="Instructor ID : WILL REPLACE WITH USERSEARCHBAR"
          value={form.instructorId ?? ''}
          onChange={e => handleChange('instructorId', e.target.valueAsNumber)}
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Create Section
        </button>
        <button type="button" onClick={() => navigate(-1)} className="bg-red-600 text-white px-4 py-2 rounded w-full">
          Cancel
        </button>
      </div>
    </form>
  );
}
