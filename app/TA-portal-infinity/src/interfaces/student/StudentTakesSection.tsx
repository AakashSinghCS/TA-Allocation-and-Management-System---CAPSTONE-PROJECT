interface HasCompleted {
    sectionId : number;
    hasCompleted : boolean;
}

export default interface StudentTakesSection {
    studentId : number;
    sections : HasCompleted[];
}