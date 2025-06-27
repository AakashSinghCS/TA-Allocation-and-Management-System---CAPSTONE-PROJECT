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

export default function DaySelector() {
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);

  return (
    <div>
      <label htmlFor="day" className="block text-sm font-medium">Day</label>
      <select
        id="day"
        value={selectedDay ?? ""}
        onChange={(e) => setSelectedDay(e.target.value || null)}
        className="mt-1 block w-full border border-gray-400 rounded px-3 py-2"
      >
        <option value="">Select a day</option>
        {daysOfWeek.map((day) => (
          <option key={day} value={day}>{day}</option>
        ))}
      </select>
    </div>
  );
}
