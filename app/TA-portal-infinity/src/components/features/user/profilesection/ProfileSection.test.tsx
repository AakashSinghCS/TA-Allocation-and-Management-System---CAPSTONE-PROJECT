import { mockStudentJohnDoe } from "../../../../mocked-objects/user/mockStudents";
import { render, screen, within } from "@testing-library/react";
import ProfileSection from "./ProfileSection";
import formatDateForDisplay from "../../../../utility/formatdatefordisplay/formatDateForDisplay";
import { studentProfileFields, studentFieldLabels } from "../../../../interfaces/user/Student";
describe("Profile Section", () => {
   it("shows section details", () => {
      const student = mockStudentJohnDoe;

      const filteredFields = studentProfileFields.filter(
         (key) => key !== "id" && key !== "firstName" && key !== "lastName"
      );
      render(<ProfileSection user={student} profileFields={filteredFields} fieldLabels={studentFieldLabels} />);

      const fullNameRegex = new RegExp(`^${student.firstName}\\s+${student.lastName}$`, "i");

      expect(screen.getByText(new RegExp(`^${student.email}$`))).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`^${student.studentNumber}$`))).toBeInTheDocument();
      const row = screen.getByTestId('profile-row-Program');
      expect(within(row).getByText(student.program)).toBeInTheDocument();

      if(student.createdAt){
         const readableDate = formatDateForDisplay(student.createdAt);
         expect(screen.getByText(new RegExp(`^${readableDate}$`))).toBeInTheDocument();
      }
   });
});