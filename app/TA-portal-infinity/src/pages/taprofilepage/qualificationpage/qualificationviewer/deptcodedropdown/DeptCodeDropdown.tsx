
interface DeptCodeDropdownProps {
    deptCodeList: string[];
    selected: string;
    onChange: (deptCode: string) => void;
}
export function DeptCodeDropdown({onChange, deptCodeList = [], selected}: DeptCodeDropdownProps) {

    return (
        <div>
            <label className="mr-2 font-medium text-sm" htmlFor="dept-select">
                Department:
            </label>
            <select
                id="dept-select"
                className="p-2 border rounded"
                value={selected}
                onChange={(e) => onChange(e.target.value)}>
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