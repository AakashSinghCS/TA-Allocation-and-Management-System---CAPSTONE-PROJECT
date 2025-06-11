import type {Course} from './Course';

export interface Need {
    id: number;
    sectionId: number;
    description: string;
    courseNeeds: Course[];
}