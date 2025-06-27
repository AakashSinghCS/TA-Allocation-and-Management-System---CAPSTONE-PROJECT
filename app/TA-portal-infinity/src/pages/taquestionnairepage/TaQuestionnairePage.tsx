import { useEffect, useState } from "react";
import type { ProfileQuestion } from "../../interfaces/question/ProfileQuestion";
import type { StudentResponseDto } from "../../components/features/questionanswer/questionitem/QuestionItem";
import { useParams } from "react-router-dom";
import QuestionItem from "../../components/features/questionanswer/questionitem/QuestionItem";
import { GenericAPIContainer } from "../../utility/genericapicontainer/GenericAPIContainer";
import { fetchAllProfileQuestions } from "../../api/question/fetchAllProfileQuestions";
import { fetchSubmitQuestions, type RequestSubmitQuestions } from "../../api/question/fetchSubmitQuestions";
import { useAuth } from "../../context/AuthContext";
//ResponseState is an object whose keys are numbers (question IDs), and each value is a StudentResponseDto.
type ResponseState = {
  [questionId: number]: StudentResponseDto;
}

function TaQuestionnaire({ questions }: { questions: ProfileQuestion[] | null }) {
  const  studentId  = useAuth().userId; 
  const [responses, setResponses] = useState<ResponseState>({});

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
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSubmit();
      }}
      className="space-y-6"
    >
      {questions && questions.map(q => (
        typeof q.id === 'number' ?
          (<QuestionItem
            key={q.id}
            initialQuestion={q}
            responseValue={responses[q.id]}
            onChange={update}
          />
          ) : null))}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
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