import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaProfilePage from "./TaProfilePage";
import type Student from "../../interfaces/Student";
import type TermCourse from "../../interfaces/TermCourse";
import formatDateForDisplay from "../../utility/formatdatefordisplay/formatDateForDisplay";

const mockStudent : Student = {
    firstName : "John",
    lastName : "Doe",
    email : "johndoe@test.com",
    studentNumber : 12345678,
    program : "Computer Science",
    enrollmentYear : 2021,
    schoolYear: 3,
    createdAt : new Date("2021-01-01T00:00:00.000Z"),
}

const mockTermCourse : TermCourse = {
    name: "Introduction to Computer Science",
    deptCode : "COSC",
    courseNum : "111",
    section: "001",
    term : "Winter 2023",
}

describe("TaProfilePage", ()=>{
    render(<TaProfilePage student={mockStudent} termCourse = {mockTermCourse}/>);
    it("shows the TA's personal details",()=>{
        // render(<TaProfilePage student={mockStudent} termCourse = {mockTermCourse}/>);

        const fullNameRegex = new RegExp( `^${mockStudent.firstName}\\s+${mockStudent.lastName}$`, "i" );

        expect(screen.getByText(new RegExp(`^${mockStudent.email}$`))).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`^${mockStudent.studentNumber}$`))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(mockStudent.program,'i'))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`^${mockStudent.enrollmentYear}$`))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`^${mockStudent.schoolYear}$`))).toBeInTheDocument();

        const readableDate = formatDateForDisplay(mockStudent.createdAt);
        expect(screen.getByText(new RegExp(`^${readableDate}$`))).toBeInTheDocument();
    })
    // it("shows the list of courses the TA is taking",()=>{
    //     // render(<TaProfilePage student={mockStudent} termCourse = {mockTermCourse}/>);
    //     const fullTermCourseNameRegex = new RegExp( `^${mockTermCourse.deptCode}\\s+${mockTermCourse.courseNum}\\s+${mockTermCourse.section}$`, "i" );
    //     expect(screen.getByText(new RegExp(`^${mockTermCourse.name}$`))).toBeInTheDocument();
    //     expect(screen.getByText(new RegExp(fullTermCourseNameRegex))).toBeInTheDocument();
    //     expect(screen.getByText(new RegExp(`^${mockTermCourse.term}$`))).toBeInTheDocument();
    // })
})