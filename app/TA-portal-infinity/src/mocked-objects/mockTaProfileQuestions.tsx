import { type ProfileQuestion } from "../interfaces/question/ProfileQuestion";
import { type ProfileAnswer } from "../interfaces/question/ProfileAnswer";


const mockTaProfileAnswer1 :ProfileAnswer= {
    id: 1,
    description: "Java"
}

const mockTaProfileAnswer2 :ProfileAnswer= {
    id: 2,
    description: "Python"
}

export const mockTaProfileQuestions : ProfileQuestion = {
    id: 1,
    description: "What programming languages do you know?",
    answers: [mockTaProfileAnswer1,mockTaProfileAnswer2],
    type: "MULTI"
}
