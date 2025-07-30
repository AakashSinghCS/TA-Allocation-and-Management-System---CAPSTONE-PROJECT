import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";

export function SingleChoice({ question, selectedId, onSelect }: {question: ProfileQuestion, selectedId: number | null, onSelect: (id: number)=>void}) {
  return (
    <div className="space-y-0 md:space-y-0">
      {question.answers && question.answers.map(a => (
        <label key={a.id} className="flex items-start gap-2 md:gap-3 cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors">
          <input
            type="radio"
            checked={a.id === selectedId}
            onChange={() => {
              if(a.id) return onSelect(a.id)
            }}
            className="mt-1 flex-shrink-0"
          />
          <span className="text-sm md:text-base text-gray-700 break-words">{a.description}</span>
        </label>
      ))}
    </div>
  );
}
