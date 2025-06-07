import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaProfilePage from "./TaProfilePage";
import formatDateForDisplay from "../../utility/formatdatefordisplay/formatDateForDisplay";
import { mockTaProfilePageData } from "../../mocked-objects/mockTaProfilePageData";


describe("TaProfilePage", () => {
    it("shows the TA's personal details", () => {
        render(<TaProfilePage data = {mockTaProfilePageData} />);
        const student = mockTaProfilePageData.student;

        const fullNameRegex = new RegExp(`^${student.firstName}\\s+${student.lastName}$`, "i");

        expect(screen.getByText(new RegExp(`^${student.email}$`))).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`^${student.studentNumber}$`))).toBeInTheDocument();
        expect(within(screen.getByText(/^Program:/i).closest('p')!).getByText(student.program)).toBeInTheDocument();
        expect(within(screen.getByText(/^Enrollment Year:/i).closest('p')!).getByText(String(student.enrollmentYear))).toBeInTheDocument(); // Enrollment year
        expect(within(screen.getByText(/^School Year:/i).closest('p')!).getByText(String(student.schoolYear))).toBeInTheDocument();


        const readableDate = formatDateForDisplay(student.createdAt);
        expect(screen.getByText(new RegExp(`^${readableDate}$`))).toBeInTheDocument();
    })
    it("shows the list of courses the TA is taking", () => {
        render(<TaProfilePage data = {mockTaProfilePageData} />);
        const section = mockTaProfilePageData.section;
        const fullTermCourseNameRegex = new RegExp(`^${section?.sectionDetails.deptCode}\\s+${section?.sectionDetails.courseNum}\\s+${section?.sectionDetails.section}$`, "i");

        const courseRow = screen.getByText(fullTermCourseNameRegex).closest('div')!;
        expect(within(courseRow).getByText(new RegExp(`^${section?.sectionDetails.name}$`))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(fullTermCourseNameRegex))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(`^${section?.sectionDetails.term}$`))).toBeInTheDocument();
    })
})