

interface Props {
  deptCodes: string[];
  value: string | null;
  onChange: (val: string | null) => void;
}

export default function DeptCodeDropdown({ deptCodes, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor="dept">
        Department
      </label>
      <select
        id="dept"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
      >
        <option value="">Select a department</option>
        {deptCodes.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}
