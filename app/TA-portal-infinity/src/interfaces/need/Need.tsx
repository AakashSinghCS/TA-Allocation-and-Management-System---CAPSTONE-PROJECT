import type {Course} from '../course/Course';

export interface Need {
    sectionId?: number;
    description?: string;
    numOfHoursCurrentlyAllocated? : number;
    requiredGradingHours? : number;
    courseNeeds?: Course[];
}