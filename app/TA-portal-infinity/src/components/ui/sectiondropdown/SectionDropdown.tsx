interface Props {
  sections: string[] | null;
  value: string | null;
  onChange: (val: string | null) => void;
}

export default function SectionDropdown({ sections, value, onChange }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium" htmlFor="section">
        Section
      </label>
      <select
        id="section"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="mt-1 block w-full rounded border border-gray-400 px-3 py-2"
      >
        <option value="">Select a section</option>
        {sections && sections.map((sec) => (
          <option key={sec} value={sec}>
            {sec}
          </option>
        ))}
      </select>
    </div>
  );
}
