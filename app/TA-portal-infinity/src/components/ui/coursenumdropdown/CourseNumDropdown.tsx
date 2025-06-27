interface Props {
  courseNums: number[] | null;
  value: number | null;
  onChange: (val: number | null) => void;
}

export default function CourseNumDropdown({ courseNums, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor="courseNum">
        Course Number
      </label>
      <select
        id="courseNum"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value) || null)}
        className="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
      >
        <option value="">Select a course number</option>
        {courseNums && courseNums.map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
}
