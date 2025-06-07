import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import TaProfilePage from "./TaProfilePage";
import formatDateForDisplay from "../../utility/formatdatefordisplay/formatDateForDisplay";
import { mockStudentJohnDoe } from "../../mocked-objects/mockStudentJohnDoe";
import { mockSectionCOSC111 } from "../../mocked-objects/mockSectionCOSC111";


describe("TaProfilePage", () => {
    it("shows the TA's personal details", () => {
        render(<TaProfilePage student={mockStudentJohnDoe} section={mockSectionCOSC111} />);

        const fullNameRegex = new RegExp(`^${mockStudentJohnDoe.firstName}\\s+${mockStudentJohnDoe.lastName}$`, "i");

        expect(screen.getByText(new RegExp(`^${mockStudentJohnDoe.email}$`))).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`^${mockStudentJohnDoe.studentNumber}$`))).toBeInTheDocument();
        expect(within(screen.getByText(/^Program:/i).closest('p')!).getByText(mockStudentJohnDoe.program)).toBeInTheDocument();
        expect(within(screen.getByText(/^Enrollment Year:/i).closest('p')!).getByText(String(mockStudentJohnDoe.enrollmentYear))).toBeInTheDocument(); // Enrollment year
        expect(within(screen.getByText(/^School Year:/i).closest('p')!).getByText(String(mockStudentJohnDoe.schoolYear))).toBeInTheDocument();


        const readableDate = formatDateForDisplay(mockStudentJohnDoe.createdAt);
        expect(screen.getByText(new RegExp(`^${readableDate}$`))).toBeInTheDocument();
    })
    it("shows the list of courses the TA is taking", () => {
        render(<TaProfilePage student={mockStudentJohnDoe} section={mockSectionCOSC111} />);
        const fullTermCourseNameRegex = new RegExp(`^${mockSectionCOSC111.deptCode}\\s+${mockSectionCOSC111.courseNum}\\s+${mockSectionCOSC111.section}$`, "i");

        const courseRow = screen.getByText(fullTermCourseNameRegex).closest('div')!;
        expect(within(courseRow).getByText(new RegExp(`^${mockSectionCOSC111.name}$`))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(fullTermCourseNameRegex))).toBeInTheDocument();
        expect(within(courseRow).getByText(new RegExp(`^${mockSectionCOSC111.term}$`))).toBeInTheDocument();
    })
})