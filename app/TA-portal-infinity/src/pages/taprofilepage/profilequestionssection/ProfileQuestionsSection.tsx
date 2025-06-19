import { QuestionAnswer } from "../../../components/features/questionanswer/QuestionAnswer";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";

interface ProfileQuestionsProps {
  profileQuestions?: ProfileQuestion[];
  className: string;
}

export default function ProfileQuestionsSection({ profileQuestions = [], className = "" }: ProfileQuestionsProps) {
  return (
    <section className={className}>
      {profileQuestions.length ? (
        <div className="grid max-h-[50vh] overflow-y-auto gap-1">
          {profileQuestions.map(que => (
            <QuestionAnswer key={que.id} profileQuestion={que} className="" />
          ))}
        </div>
      ) : (
        <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
          No questions to display
        </div>
      )}
    </section>
  );
}
