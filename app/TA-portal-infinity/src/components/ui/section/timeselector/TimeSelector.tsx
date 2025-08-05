import { useEffect, useState } from "react";
import { type SearchTimes } from "../../../features/course/coursefilter/SectionFilter";

export const timeOptions: string[] = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00"
];

interface TimeSelectorProps {
  mode :string;
  onChange : (val : SearchTimes)=> void;
}

export default function TimeSelector({ mode, onChange }: TimeSelectorProps) {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle = "mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode === 'small' ? smallStyle : bigStyle}`

  return (
    <>

      <select
        id="startTime"
        value={startTime ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          const nextStart = v === "" ? null : v;
          setStartTime(nextStart);
          onChange({ startTime: nextStart, endTime });
        }}
        className={smallOrBig}
      >
        <option value="">Start time</option>
        {timeOptions.map((time) => (
          <option key={time} value={time}>{time}</option>
        ))}
      </select>



      <select
        id="endTime"
        value={endTime ?? ""}
        onChange={(e) => {
          const v = e.target.value;
          const nextEnd = v === "" ? null : v;
          setEndTime(nextEnd);
          onChange({ startTime, endTime: nextEnd });
        }}
        className={smallOrBig}
      >
        <option value="">End time</option>
        {timeOptions.map((time) => (
          <option key={time} value={time}>{time}</option>
        ))}
      </select>

    </>
  );
}
