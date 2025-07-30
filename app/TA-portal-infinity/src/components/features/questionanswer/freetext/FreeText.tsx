import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";

export function FreeText({ text, onChange }: {question: ProfileQuestion, text: string, onChange: (text: string)=>void}) {
  return (
    <div className="w-3/4 md:w-3/4">
      <textarea
        value={text}
        placeholder="Type your answer here..."
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm md:text-base min-h-[8vh] md:min-h-[10vh] align-top resize-y focus:outline-none focus:ring-2 focus:ring-[#040941] focus:border-transparent"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
