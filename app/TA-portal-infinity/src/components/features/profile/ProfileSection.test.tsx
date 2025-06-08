import { mockStudentJohnDoe } from "../../../mocked-objects/mockStudents";
import { render, screen, within } from "@testing-library/react";
import ProfileSection from "./ProfileSection";
import formatDateForDisplay from "../../../utility/formatdatefordisplay/formatDateForDisplay";

describe("SectionCard", () => {
     it("shows section details", () => {
        const student =  mockStudentJohnDoe;

         render(<ProfileSection student = {student}/>);
        
        const fullNameRegex = new RegExp(`^${student.firstName}\\s+${student.lastName}$`, "i");

        expect(screen.getByText(new RegExp(`^${student.email}$`))).toBeInTheDocument();
        expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
        expect(screen.getByText(new RegExp(`^${student.studentNumber}$`))).toBeInTheDocument();
        expect(within(screen.getByText(/^Program:/i).closest('p')!).getByText(student.program)).toBeInTheDocument();
        expect(within(screen.getByText(/^Enrollment Year:/i).closest('p')!).getByText(String(student.enrollmentYear))).toBeInTheDocument(); // Enrollment year
        expect(within(screen.getByText(/^School Year:/i).closest('p')!).getByText(String(student.schoolYear))).toBeInTheDocument();


        const readableDate = formatDateForDisplay(student.createdAt);
        expect(screen.getByText(new RegExp(`^${readableDate}$`))).toBeInTheDocument();
     });
});