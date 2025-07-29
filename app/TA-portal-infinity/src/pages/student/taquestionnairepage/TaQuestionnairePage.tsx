import { useEffect, useState } from "react";
import { fetchAllProfileQuestions } from "../../../api/question/fetchAllProfileQuestions";
import { fetchProfileAnswers } from "../../../api/question/fetchProfileAnswers";
import { fetchSubmitQuestions, type RequestSubmitQuestions } from "../../../api/question/fetchSubmitQuestions";
import type { StudentResponseDto } from "../../../components/features/questionanswer/questionitem/QuestionItem";
import QuestionItem from "../../../components/features/questionanswer/questionitem/QuestionItem";
import { useAuth } from "../../../context/AuthContext";
import type { ProfileQuestion } from "../../../interfaces/question/ProfileQuestion";
import { GenericAPIContainer } from "../../../utility/genericapicontainer/GenericAPIContainer";
import { CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { toast } from "react-toastify";

//ResponseState is an object whose keys are numbers (question IDs), and each value is a StudentResponseDto.
type ResponseState = {
  [questionId: number]: StudentResponseDto;
}

type ValidationError = {
  questionId: number;
  message: string;
}

function TaQuestionnaire({ questions }: { questions: ProfileQuestion[] | null }) {
  const studentId = useAuth().userId;
  const [responses, setResponses] = useState<ResponseState>({});
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initializeResponses = async () => {
      if (!questions || !studentId) return;
      
      // fetch existing answers
      const existingAnswers = await fetchProfileAnswers(Number(studentId));
      
      const initial: ResponseState = {};
      
      questions.forEach((q) => {
        if (q.id != null) {
          // existing answer for this question
          const existingAnswer = existingAnswers?.find((answer: ProfileQuestion) => answer.id === q.id);
          
          if (existingAnswer && existingAnswer.answers && existingAnswer.answers.length > 0) {
            // with existing answers
            if (q.type === "FREE_TEXT") {
              initial[q.id] = {
                questionId: q.id,
                answerIds: [],
                answerText: existingAnswer.answers[0].description || "",
              };
            } else {
              // For SINGLE and MULTI choice questions
              initial[q.id] = {
                questionId: q.id,
                answerIds: existingAnswer.answers.map((ans: any) => ans.id).filter((id: any) => id !== undefined) as number[],
                answerText: "",
              };
            }
          } else {
            // empty state
            initial[q.id] = {
              questionId: q.id,
              answerIds: [],
              answerText: "",
            };
          }
        }
      });
      
      setResponses(initial);
    };

    initializeResponses();
  }, [questions, studentId]);

  const update = (r: StudentResponseDto) => {
    if (typeof r.questionId === 'number') {
      const qid = r.questionId;
      setResponses(prev => ({ ...prev, [qid]: r }));
      setValidationErrors(prev => prev.filter(err => err.questionId !== qid));
    }
  }

  const validateResponses = (): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (!questions) return errors;

    questions.forEach(question => {
      if (question.id != null) {
        const response = responses[question.id];
        const isEmpty = !response || 
          ((!response.answerIds || response.answerIds.length === 0) && 
           (!response.answerText || response.answerText.trim() === ""));
        if (isEmpty) {
          errors.push({
            questionId: question.id,
            message: `Question ${questions.findIndex(q => q.id === question.id) + 1} is required`
          });
        }
        // text length for free text questions
        if (question.type === "FREE_TEXT" && response?.answerText) {
          const textLength = response.answerText.trim().length;
          if (textLength > 1000) { 
            errors.push({
              questionId: question.id,
              message: `Answer for question ${questions.findIndex(q => q.id === question.id) + 1} is too long (max 1000 characters)`
            });
          }
        }
      }
    });
    return errors;
  }

  const handleSubmit = async () => {
    if (!studentId) return;
    
    // Client-side validation
    const validationErrors = validateResponses();
    setValidationErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      toast.error(`Please fix ${validationErrors.length} validation error${validationErrors.length > 1 ? 's' : ''} before submitting.`);
      return;
    }
    setIsSubmitting(true);
    
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

    try {
      const result = await fetchSubmitQuestions(Number(studentId), request);
      
      if (result.success) {
        toast.success('All answers submitted successfully.');
        setValidationErrors([]); 
      } else {
        // Handle server-side errors
        if (result.errors && result.errors.length > 0) {
          const errorMessages = result.errors.map(err => {
            const questionIndex = questions?.findIndex(q => q.id === err.questionId) ?? -1;
            const questionNumber = questionIndex >= 0 ? questionIndex + 1 : err.questionId;
            return `Question ${questionNumber}: ${err.message}`;
          }).join('\n');
          
          toast.error(`Submission failed:\n${errorMessages}`);
          
          // Set validation errors from server
          const serverErrors: ValidationError[] = result.errors.map(err => ({
            questionId: err.questionId,
            message: err.message
          }));
          setValidationErrors(serverErrors);
        } else {
          toast.error(result.message || 'Some answers failed to save. Please try again.');
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-[#040941]">Profile Questionnaire</h1>
              <p className="text-gray-600 mt-2 text-sm md:text-base">Complete these questions to help coordinators understand your background and preferences</p>
            </div>
            <div className="text-right lg:text-center">
              <div className="text-xl md:text-2xl font-bold text-[#040941]">{questions?.length || 0}</div>
              <div className="text-xs md:text-sm text-gray-500">Total Questions</div>
            </div>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3 md:p-4 flex items-start md:items-center mb-2">
            <div className="flex-shrink-0 mr-3 md:mr-4">
              <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap justify-between items-start md:items-center w-full">
                <div>
                  <span className="font-semibold text-blue-900 text-base md:text-lg">Complete Your Profile</span>
                  <div className="text-blue-900 text-xs md:text-sm mt-1">Your responses help coordinators make informed decisions about TA assignments. Please provide accurate information.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Form */}
        <form onSubmit={e => {
          e.preventDefault();
          handleSubmit();
        }}>
          {/* Validation Summary */}
          {validationErrors.length > 0 && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-r-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-2">
                    Please fix the following {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}:
                  </h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{error.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">Questions</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {validationErrors.length > 0 && (
                  <div className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''} found
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 md:px-6 py-2 rounded-lg font-medium transition-colors shadow-lg flex items-center justify-center gap-2 text-sm md:text-base bg-[#040941] text-white hover:bg-blue-700 ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}`}
                >
                  <Save className="w-4 h-4 md:w-5 md:h-5" />
                  {isSubmitting ? 'Saving...' : 'Save Answers'}
                </button>
              </div>
            </div>
            
            <div className="grid gap-4 md:gap-6">
              {questions && questions.map((q, index) => {
                const hasError = validationErrors.some(err => err.questionId === q.id);
                const errorMessage = validationErrors.find(err => err.questionId === q.id)?.message;
                
                return (
                  typeof q.id === 'number' ? (
                    <div key={q.id} className={`bg-white rounded-xl shadow-sm border ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200'} p-4 md:p-6 hover:shadow-md transition-shadow`}>
                      {hasError && (
                        <div className="mb-3 flex items-center gap-2 text-red-600 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>{errorMessage}</span>
                        </div>
                      )}
                      <QuestionItem
                        initialQuestion={q}
                        questionNumber={index + 1}
                        responseValue={responses[q.id]}
                        onChange={update}
                        hideQuestionText={false}
                      />
                    </div>
                  ) : null
                );
              })}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TaQuestionnairePage() {

  return (
    <GenericAPIContainer<ProfileQuestion[] | null>
      fetchFunction={() => fetchAllProfileQuestions()}
      render={qs => <TaQuestionnaire questions={qs} />}
    />
  );
}