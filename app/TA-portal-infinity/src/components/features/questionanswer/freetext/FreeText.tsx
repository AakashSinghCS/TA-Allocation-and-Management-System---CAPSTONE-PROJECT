import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";

export function FreeText({ question, text, onChange }: {question: ProfileQuestion, text: string, onChange: (text: string)=>void}) {
  return (
    <fieldset className="mb-4">
      <legend>{question.description}</legend>
        <label className="flex items-center gap-2">
          <textarea
            value={text}
            placeholder="Type your answer here..."
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm min-h-[10vh] align-top"
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
    </fieldset>
  );
}
