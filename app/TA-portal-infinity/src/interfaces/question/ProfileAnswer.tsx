export type AnswerType =
    | "MC"
    | "TEXT"
    | "MC_TEXT"

export interface ProfileAnswer{
    id?: number;
    description?: string;
    answerText? : string;
    type? :AnswerType; //optional for now. change later.
}