import { mockStudentJohnDoe } from "../../../../mocked-objects/user/mockStudents";
import { render, screen, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import ProfileSection from "./ProfileSection";
import formatDateForDisplay from "../../../../utility/formatdatefordisplay/formatDateForDisplay";
import { studentProfileFields, studentFieldLabels } from "../../../../interfaces/user/Student";

// Wrapper component for router context
function TestWrapper({ children }: { children: JSX.Element }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe("Profile Section", () => {
   it("shows section details", () => {
      const student = mockStudentJohnDoe;

      const filteredFields = studentProfileFields.filter(
         (key) => key !== "id" && key !== "firstName" && key !== "lastName"
      );
      render(
        <TestWrapper>
          <ProfileSection user={student} profileFields={filteredFields} fieldLabels={studentFieldLabels} />
        </TestWrapper>
      );

      const fullNameRegex = new RegExp(`^${student.firstName}\\s+${student.lastName}$`, "i");

      expect(screen.getByText(new RegExp(`^${student.email}$`))).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 1, name: fullNameRegex })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`^${student.studentNum}$`))).toBeInTheDocument();
      const row = screen.getByTestId('profile-row-Program');
      expect(within(row).getByText(student.program!)).toBeInTheDocument();

      if(student.createdAt){
         const readableDate = formatDateForDisplay(student.createdAt instanceof Date ? student.createdAt : new Date());
         expect(screen.getByText(new RegExp(`^${readableDate}$`))).toBeInTheDocument();
      }
   });

   it("shows user initials in circular avatar", () => {
      const student = mockStudentJohnDoe;

      const filteredFields = studentProfileFields.filter(
         (key) => key !== "id" && key !== "firstName" && key !== "lastName"
      );
      render(
        <TestWrapper>
          <ProfileSection user={student} profileFields={filteredFields} fieldLabels={studentFieldLabels} />
        </TestWrapper>
      );

      // Check for initials in avatar
      const expectedInitials = `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`.toUpperCase();
      expect(screen.getByText(expectedInitials)).toBeInTheDocument();
   });

   it("shows profile completion percentage", () => {
      const student = mockStudentJohnDoe;

      const filteredFields = studentProfileFields.filter(
         (key) => key !== "id" && key !== "firstName" && key !== "lastName"
      );
      render(
        <TestWrapper>
          <ProfileSection user={student} profileFields={filteredFields} fieldLabels={studentFieldLabels} />
        </TestWrapper>
      );

      // Should show completion percentage
      expect(screen.getByText(/100/)).toBeInTheDocument();
      expect(screen.getByText(/%/)).toBeInTheDocument();
   });
});