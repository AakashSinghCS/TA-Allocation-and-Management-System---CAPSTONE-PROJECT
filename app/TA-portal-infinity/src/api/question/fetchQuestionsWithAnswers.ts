import type { ProfileQuestion } from "../../interfaces/question/ProfileQuestion";
import { fetchAllProfileQuestions } from "./fetchAllProfileQuestions";
import { fetchProfileAnswers } from "./fetchProfileAnswers";

export async function fetchQuestionsWithAnswers(userId: number): Promise<ProfileQuestion[] | null> {
  try {
    // fetch both questions and existing answers
    const [questions, existingAnswers] = await Promise.all([
      fetchAllProfileQuestions(),
      fetchProfileAnswers(userId)
    ]);

    if (!questions) {
      return null;
    }

    // If no existing answers, return questions as-is
    if (!existingAnswers) {
      return questions;
    }

    //  a map of existing answers by question ID
    const answersMap = new Map();
    existingAnswers.forEach(answer => {
      if (answer.id) {
        answersMap.set(answer.id, answer.answers);
      }
    });

    // Merge questions with existing answers
    return questions.map(question => ({
      ...question,
      answers: question.answers
    }));

  } catch (error) {
    console.error("Error fetching questions with answers:", error);
    return null;
  }
}
