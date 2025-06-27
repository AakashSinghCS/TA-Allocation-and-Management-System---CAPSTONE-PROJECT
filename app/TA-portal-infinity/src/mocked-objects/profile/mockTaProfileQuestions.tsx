import { type ProfileQuestion } from "../../interfaces/question/ProfileQuestion";
import { type ProfileAnswer } from "../../interfaces/question/ProfileAnswer";


const mockAnswer1For1 :ProfileAnswer= {
    id: 1,
    description: "Yes"
}

const mockAnswer2For1 :ProfileAnswer= {
    id: 2,
    description: "No"
}

export const mockTaProfileQuestion1 : ProfileQuestion = {
    id: 1,
    description: "Are you a Canadian Citizen?",
    answers: [mockAnswer1For1,mockAnswer2For1],
    type: "SINGLE"
}


const mockAnswer1For2 :ProfileAnswer= {
    id: 1,
    description: "Java"
}

const mockAnswer2For2 :ProfileAnswer= {
    id: 2,
    description: "Python"
}

export const mockTaProfileQuestion2 : ProfileQuestion = {
    id: 2,
    description: "What programming languages do you know?",
    answers: [mockAnswer1For2,mockAnswer2For2],
    type: "MULTI"
}

export const mockTaProfileQuestion3 : ProfileQuestion = {
    id: 3,
    description: "Tell me about yourself",
    type: "FREE_TEXT"
}