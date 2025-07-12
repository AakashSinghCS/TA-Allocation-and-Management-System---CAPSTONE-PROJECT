import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllProfileQuestions } from "../../../api/question/fetchAllProfileQuestions";
import { fetchSubmitQuestions, type RequestSubmitQuestions } from "../../../api/question/fetchSubmitQuestions";
import type { StudentResponseDto } from "../../../components/features/questionanswer/questionitem/QuestionItem";
import QuestionItem from "../../../components/features/questionanswer/questionitem/QuestionItem";
import { useAuth } from "../../../context/AuthContext";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
//ResponseState is an object whose keys are numbers (question IDs), and each value is a StudentResponseDto.
type ResponseState = {
  [questionId: number]: StudentResponseDto;
}

export default function TaQuestionnaire({ questions }: { questions: ProfileQuestion[] | null }) {
  const studentId = useAuth().userId;
  const [responses, setResponses] = useState<ResponseState>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!questions) return;
    const initial: ResponseState = {};
    questions.forEach((q) => {
      if (q.id != null) {
        initial[q.id] = {
          questionId: q.id,
          answerIds: [],
          answerText: "",
        };
      }
    });
    setResponses(initial);
  }, [questions]);

  const update = (r: StudentResponseDto) => {
    if (typeof r.questionId === 'number') {
      const qid = r.questionId;
      setResponses(prev => ({ ...prev, [qid]: r }));
    }
  }
  const handleSubmit = async () => {
    if (!studentId) return;
    const answerIdsRequest: number[] = [];
    const answerTextsRequest: { questionId: number; answerText: string; }[] = [];

    Object.values(responses).forEach(resp => {
      if (resp.answerIds && resp.answerIds.length) {
        resp.answerIds.forEach((aId) => {
          answerIdsRequest.push(aId);
        })
      }
      else if (resp.answerText) {
        resp.questionId && answerTextsRequest.push({ questionId: resp.questionId, answerText: resp.answerText });
      }
    });

    const request: RequestSubmitQuestions = {
      answerIds: answerIdsRequest,
      freeTextRequests: answerTextsRequest
    }


    const res = await fetchSubmitQuestions(Number(studentId), request);
    alert(res
      ? 'All answers submitted successfully.'
      : 'Some answers failed to save. Please try again.');
    navigate(`/user/taprofile/${studentId}`);
  }

  return (
    <form onSubmit={e => {
      e.preventDefault();
      handleSubmit();
    }}
      className="space-y-6 max-w-5xl mx-auto grid grid-cols-1 gap-3"
    >
      <div>
        <h2 className="text-xl font-semibold mb-1">Questions about you</h2>
        <p className="text-xs text-slate-600 mb-1">Respond to these questions so the Coordinator understands more about you.</p>
      </div>
      {questions && questions.map(q => (
        typeof q.id === 'number' ?
          (<div className="border-b-solid border-b-2 border-gray-200 py-2">
            <QuestionItem
              key={q.id}
              initialQuestion={q}
              responseValue={responses[q.id]}
              onChange={update}
            />
          </div>
          ) : null))}
      <button
        type="submit"
        className="bg-[#00c89c] text-white px-4 py-1 rounded hover:bg-[#c7fcec] transition-colors"
      >
        Save answers
      </button>
    </form>
  );
}

export function TaQuestionnairePage() {

  return (
    <GenericAPIContainer<ProfileQuestion[] | null>
      fetchFunction={() => fetchAllProfileQuestions()}
      render={qs => <TaQuestionnaire questions={qs} />}
    />
  );
}