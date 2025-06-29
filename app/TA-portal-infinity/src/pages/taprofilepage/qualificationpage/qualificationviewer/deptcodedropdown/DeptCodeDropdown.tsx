// DeptCodeDropdown.tsx
interface DeptCodeDropdownProps {
  deptCodeList: string[];
  selected: string;
  onChange: (deptCode: string) => void;
}
export default function DeptCodeDropdown({
  onChange,
  deptCodeList = [],
  selected,
}: DeptCodeDropdownProps) {
  return (
    <div className="flex items-center gap-2 self-start">
      <label
        className="font-medium text-sm whitespace-nowrap"
        htmlFor="dept-select"
      >
        Department:
      </label>

      <select
        id="dept-select"
        className="w-full border border-gray-400 rounded px-3 py-2"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— Select Dept —</option>
        {deptCodeList.map((code) => (
          <option key={code} value={code}>
            {code}
          </option>
        ))}
      </select>
    </div>
  );
}
