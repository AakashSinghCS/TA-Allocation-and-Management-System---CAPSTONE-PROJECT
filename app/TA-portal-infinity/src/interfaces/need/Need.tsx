import type {Course} from './Course';

export interface Need {
    sectionId?: number;
    description?: string;
    numOfHoursCurrentlyAllocated? : number;
    requiredGradingHours? : number;
    courseNeeds?: Course[];
}