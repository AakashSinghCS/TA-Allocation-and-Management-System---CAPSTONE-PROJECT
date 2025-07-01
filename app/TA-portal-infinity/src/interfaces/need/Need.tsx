import type {Course} from '../course/Course';

export interface Need {
    description?: string;
    numHoursCurrentlyAllocated? : number;
    requiredGradingHours? : number;
    courseNeeds?: Course[];
    year? :number;
    semester? : number;
    courseId? : number;
    id? : number;
}