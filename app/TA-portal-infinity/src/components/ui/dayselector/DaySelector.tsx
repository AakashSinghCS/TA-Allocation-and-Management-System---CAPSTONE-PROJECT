import { useEffect, useState } from "react";

const daysOfWeek: string[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun"
];

interface DaySelectorProps {
  mode : string;
  onChange : (day:string |null) => void;
}

export default function DaySelector({mode, onChange}:DaySelectorProps) {
  const [selectedDay, setSelectedDay] = useState<string|null>(null);
  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle ="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode ==='small'?smallStyle:bigStyle}`

  useEffect(()=>{
    onChange(selectedDay);
  },[selectedDay])

  return (

      <select
        id="day"
        value={selectedDay ?? ""}
        onChange={(e) => setSelectedDay(e.target.value)}
        className={smallOrBig}
      >
        <option value="">Day</option>
        {daysOfWeek.map((day) => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>

  );
}
