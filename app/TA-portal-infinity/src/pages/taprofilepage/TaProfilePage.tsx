import type Student from '../../interfaces/Student';
import type Section from '../../interfaces/Section';
import formatDateForDisplay from '../../utility/formatdatefordisplay/formatDateForDisplay';
import ProfileSection from '../../components/features/profile/ProfileSection';
import SectionSection from '../../components/features/section/SectionSection';

interface Props {
  student: Student;
  section?: Section;
}

// ✂ … container props
export default function TaProfilePage({ student, section }: Props) {
  /* transform student -> fields once, keeps JSX tidy */
  const profileDetails = [
    { label: "Email", value: student.email },
    { label: "Student #", value: student.studentNumber.toString() },
    { label: "Program", value: student.program },
    { label: "Enrollment Year", value: student.enrollmentYear.toString() },
    { label: "School Year", value: student.schoolYear.toString() },
    { label: "Joined", value: formatDateForDisplay(student.createdAt) },
  ];
  /*need to do the following:
    - show the times for each of the courses ex: Wed~Fridya 2:30 etc.
    - make the card smaller, or make it into more of a list so that the coordinator doesn't have to scroll.
    - divide Courses into the following: courses currently taking (which is most important), and courses with previous TA-experience
    - MAYBE have a list of all the courses taken, which will be long, can should not be in the form of cards.
    
    - Finally, add the profile questions and answers.
*/
  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 bg-white rounded-2xl flex flex-col md:flex-row md:gap-8">
      <ProfileSection
        name={`${student.firstName} ${student.lastName}`}
        profileDetails={profileDetails}
        className="max-w-xs space-y-4 order-1 md:order-2 md:w-1/3 md:ml-auto"
      />

      <SectionSection
        sections={section ? [section] : []}
        className="space-y-4 order-2 md:order-1 md:w-2/3 mt-6 md:mt-0"
      />
    </div>
  );
}

