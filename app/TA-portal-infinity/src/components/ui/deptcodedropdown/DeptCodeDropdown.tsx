

interface Props {
  deptCodes: string[];
  value: string | null;
  onChange: (val: string | null) => void;
  mode?: string;
}

export default function DeptCodeDropdown({ deptCodes, value, onChange,mode }: Props) {

  return (
      <select
        id="dept"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={mode ==="small"?"mt-1 block w-full rounded border border-gray-400 px-2 py-1":
          "mt-1 block w-full rounded border border-gray-400 px-3 py-2"
        }
      >
        <option value="">Department</option>
        {deptCodes.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
  );
}
