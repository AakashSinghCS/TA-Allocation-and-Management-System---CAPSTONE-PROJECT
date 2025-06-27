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
        className="p-2 border rounded bg-white shadow-sm max-w-[10rem]"
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
