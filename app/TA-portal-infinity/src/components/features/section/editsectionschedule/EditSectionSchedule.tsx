import { useState } from "react";
import type SectionSchedule from "../../../../interfaces/section/SectionSchedule";

interface EditSectionScheduleProps {
  initial?: SectionSchedule;
  onSave: (sched: SectionSchedule) => Promise<boolean>;
  onCancel: () => void;
}

export default function EditSectionSchedule({ initial, onSave, onCancel }: EditSectionScheduleProps) {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const times = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i/2).toString().padStart(2,'0');
    const min = i % 2 === 0 ? '00' : '30';
    return `${hour}:${min}`;
  });

  const [day, setDay] = useState(initial?.day || days[0]);
  const [startTime, setStartTime] = useState(initial?.startTime || times[0]);
  const [endTime, setEndTime] = useState(initial?.endTime || times[1]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 mt-4">
      <h3 className="font-semibold mb-3">{initial ? 'Update Schedule' : 'Add Schedule'}</h3>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block mb-1 text-sm">Day</label>
          <select value={day} onChange={e => setDay(e.target.value)} className="w-full border rounded px-2 py-1">
            {days.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm">Start</label>
          <select value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border rounded px-2 py-1">
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm">End</label>
          <select value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border rounded px-2 py-1">
            {times.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <button onClick={() => onSave({ ...(initial ?? {}),day, startTime, endTime })} className="px-4 py-1 bg-[#040941] text-white rounded hover:bg-[#040491]">Save</button>
        <button onClick={onCancel} className="px-4 py-1 border rounded">Cancel</button>
      </div>
    </div>
  );
}