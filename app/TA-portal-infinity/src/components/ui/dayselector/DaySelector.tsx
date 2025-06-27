import React from "react";

const daysOfWeek: string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

export default function DaySelector({mode}:{mode:string}) {
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);
  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle ="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode ==='small'?smallStyle:bigStyle}`

  return (

      <select
        id="day"
        value={selectedDay ?? ""}
        onChange={(e) => setSelectedDay(e.target.value || null)}
        className={smallOrBig}
      >
        <option value="">Day</option>
        {daysOfWeek.map((day) => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>

  );
}
