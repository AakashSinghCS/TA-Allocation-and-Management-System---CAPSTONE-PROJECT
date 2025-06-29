interface Props {
  courseNums: number[] | null;
  value: number | null;
  onChange: (val: number | null) => void;
  disabled?: boolean;
  mode?:string;
}

export default function CourseNumDropdown({ courseNums, value, onChange, disabled,mode }: Props) {
  const disabledStyle = 'disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed';
  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle ="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode ==='small'?smallStyle:bigStyle}`
  
  return (

      <select
        id="courseNum"
        value={value ?? ""}
        onChange={(e) => onChange(Number(e.target.value) || null)}
        className={disabled?`${disabledStyle} ${smallOrBig}`:`${smallOrBig}`}
        disabled={disabled}
      >
        <option value="">Course Number</option>
        {courseNums && courseNums.map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
  );
}
