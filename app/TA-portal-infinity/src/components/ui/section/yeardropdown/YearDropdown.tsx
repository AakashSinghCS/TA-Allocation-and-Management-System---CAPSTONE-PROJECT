
interface Props {
  years: number[] | null;
  value: string | null;
  onChange: (val: string | null) => void;
  disabled? : boolean;
  mode? :string;
}

export default function YearDropdown({ years, value, onChange, disabled, mode}: Props) {

  const disabledStyle = 'disabled:bg-gray-100 disabled:border-gray-300 disabled:cursor-not-allowed';
  const smallStyle = "mt-1 block w-full rounded border border-gray-400 px-2 py-1"
  const bigStyle ="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
  const smallOrBig = `${mode ==='small'?smallStyle:bigStyle}`

  return (

      <select
        id="year"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className={disabled?`${disabledStyle} ${smallOrBig}`:`${smallOrBig}`}
        disabled={disabled}
      >
        <option value="">Year</option>
        {years && years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
  );
}
