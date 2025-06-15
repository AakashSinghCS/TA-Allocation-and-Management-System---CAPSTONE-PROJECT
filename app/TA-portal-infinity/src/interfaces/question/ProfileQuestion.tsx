import { type ProfileAnswer } from "./ProfileAnswer";

export type QuestionType =
    | "SINGLE"
    | "MULTI"
    | "TEXT"

export interface ProfileQuestion{
    id: number;
    description: string;
    answers: ProfileAnswer[];
    type: QuestionType;
}
