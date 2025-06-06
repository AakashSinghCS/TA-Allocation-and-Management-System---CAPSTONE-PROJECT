import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaProfilePage from "./TaProfilePage";
import formatDateForDisplay from "../../utility/formatdatefordisplay/formatDateForDisplay";
import { mockStudent } from "../../mocked-objects/mockUsers";
import { mockTermCourse } from "../../mocked-objects/mockCourses";


describe("TaProfilePage", () => {
    it("shows the TA's personal details", () => {
        render(<TaProfilePage student={mockStudent} termCourse={mockTermCourse} />);

        const fullNameRegex = new RegExp(`^${mockStudent.firstName}\\s+${mockStudent.lastName}$`, "i");

        expect(screen.getByText(new RegExp(`^${mockStudent.email}$`))).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`^${mockStudent.studentNumber}$`))).toBeInTheDocument();
        expect(within(screen.getByText(/^Program:/i).closest('p')!).getByText(mockStudent.program)).toBeInTheDocument();
        expect(within(screen.getByText(/^Enrollment Year:/i).closest('p')!).getByText(String(mockStudent.enrollmentYear))).toBeInTheDocument(); // Enrollment year
        expect(within(screen.getByText(/^School Year:/i).closest('p')!).getByText(String(mockStudent.schoolYear))).toBeInTheDocument();


        const readableDate = formatDateForDisplay(mockStudent.createdAt);
        expect(screen.getByText(new RegExp(`^${readableDate}$`))).toBeInTheDocument();
    })
    it("shows the list of courses the TA is taking", () => {
        render(<TaProfilePage student={mockStudent} termCourse={mockTermCourse} />);
        const fullTermCourseNameRegex = new RegExp(`^${mockTermCourse.deptCode}\\s+${mockTermCourse.courseNum}\\s+${mockTermCourse.section}$`, "i");

        const courseRow = screen.getByText(fullTermCourseNameRegex).closest('div')!;
        expect(within(courseRow).getByText(new RegExp(`^${mockTermCourse.name}$`))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(fullTermCourseNameRegex))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(`^${mockTermCourse.term}$`))).toBeInTheDocument();
    })
})