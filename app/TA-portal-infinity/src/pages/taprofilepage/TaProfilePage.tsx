import type Student from '../../interfaces/Student';
import type Section from '../../interfaces/Section';
import formatDateForDisplay from '../../utility/formatdatefordisplay/formatDateForDisplay';
import ProfileSection from '../../components/features/profile/ProfileSection';
import SectionCard from '../../components/features/section/SectionCard';

interface Props {
  student: Student;
  section?: Section[];
}

export default function TaProfilePage({ student, section }: Props) {
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
        sections={section ? section : []}
        className="space-y-4 order-2 md:order-1 md:w-2/3 mt-6 md:mt-0"
      />
    </div>
  );
}
interface SectionProps {
  sections?: Section[];      
  className?: string;
}

function SectionSection({ sections = [], className = "" }: SectionProps) {
  return (
    <section className={className}>
      <h2 className="text-xl font-semibold mb-2">Courses</h2>

      {sections.length ? (
        <div className="grid gap-3">
          {sections.map(sec => (
            <SectionCard key={sectionKey(sec)} section={sec} />
          ))}
        </div>
      ) : (
        <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
          No courses to display
        </div>
      )}
    </section>
  );
}

const sectionKey = (s: Section) => `${s.deptCode}-${s.courseNum}-${s.section}`;