import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";

export function QuestionAnswer({profileQuestion , className=""}:{profileQuestion:ProfileQuestion, className?:string}) {
  //Need to integrate answerText field later.
  const answerText = profileQuestion.answers
    ?.map((ans) => ans.description)
    .join(", ");

  return (
    <div className={`flex items-start gap-2 text-sm px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 ${className}`} >
      <span className="font-medium">{profileQuestion.description}</span>
      <span className="text-slate-700 whitespace-nowrap"> {answerText || "—"} </span>
    </div>
  );
}