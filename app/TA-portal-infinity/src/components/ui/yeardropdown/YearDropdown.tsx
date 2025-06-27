import React from "react";

interface Props {
  years: number[] | null;
  value: string | null;
  onChange: (val: string | null) => void;
}

export default function YearDropdown({ years, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor="year">
        Year
      </label>
      <select
        id="year"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
      >
        <option value="">Select a year</option>
        {years && years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
