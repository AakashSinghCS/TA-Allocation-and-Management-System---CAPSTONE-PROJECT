interface Props {
  semesters: string[] | null;
  value: string | null;
  onChange: (val: string | null) => void;
}

export default function SemesterDropdown({ semesters, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor="semester">
        Semester
      </label>
      <select
        id="semester"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
      >
        <option value="">Select a semester</option>
        {semesters && semesters.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
