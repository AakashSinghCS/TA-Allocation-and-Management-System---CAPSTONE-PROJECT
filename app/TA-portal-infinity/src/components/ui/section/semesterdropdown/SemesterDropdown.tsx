interface Props {
  semesters: string[] | null;
  value: string | null;
  onChange: (val: string | null) => void;
  disabled?: boolean;
  mode?: string;
}

export default function SemesterDropdown({ semesters, value, onChange, disabled,mode }: Props) {
  const disabledStyle = 'disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed';
  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle ="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode ==='small'?smallStyle:bigStyle}`
  
  return (
      <select
        id="semester"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
         className={disabled?`${disabledStyle} ${smallOrBig}`:`${smallOrBig}`}
        disabled={disabled}
      >
        <option value="">Semester</option>
        {semesters && semesters.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
  );
}
