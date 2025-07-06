import { ProfileQuestionAnswer } from "../../../../components/features/questionanswer/profilequestionanswer/ProfileQuestionAnswer";
import type { ProfileQuestion } from "../../../../interfaces/question/ProfileQuestion";

interface ProfileQuestionsProps {
  profileQuestions?: ProfileQuestion[] | null;
  className?: string;
}

export default function ProfileQuestionsSection({
  profileQuestions = [],
  className = "",
}: ProfileQuestionsProps) {
  return (
    <section
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col h-full min-h-0 ${className}`}
    >
      <h2 className="text-lg font-bold mb-4">Answers to Profile Questions</h2>

      {profileQuestions && profileQuestions.length ? (
        <div className="flex-1 overflow-y-auto space-y-2">
          {profileQuestions.map((que) => (
            <ProfileQuestionAnswer key={que.id} profileQuestion={que} />
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
