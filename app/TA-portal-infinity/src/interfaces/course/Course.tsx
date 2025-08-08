export interface Course{
    id?: number;
    name?: string;
    deptCode?: string;
    courseNum?: string;
}

export interface CourseProfile{
    name?: string;
    deptCode?: string;
    courseNum?: string;
}

export const courseProfileFields: (keyof CourseProfile)[] = [
    "name",
    "deptCode",
    "courseNum"
];

export const courseFieldLabels: Record<keyof CourseProfile, string> = {
    name: "Name",
    deptCode: "Department Code",
    courseNum: "Course Number",
};