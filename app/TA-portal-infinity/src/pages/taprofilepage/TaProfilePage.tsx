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
    { label: "Email",        value: student.email },
    { label: "Student #",    value: student.studentNumber.toString() },
    { label: "Program",      value: student.program },
    { label: "Enrollment Year",   value: student.enrollmentYear.toString() },
    { label: "School Year",  value: student.schoolYear.toString() },
    { label: "Joined",       value: formatDateForDisplay(student.createdAt) },
  ];

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


// function ProfileSection({ student, className = "" }: { student: Student; className?: string }) {
//     const {
//         firstName,
//         lastName,
//         email,
//         studentNumber,
//         program,
//         enrollmentYear,
//         schoolYear,
//         createdAt,
//     } = student;
//     return (
//         <section className={className}>
//             <h1 className="text-3xl font-bold mb-4 text-center md:text-right">
//                 {firstName} {lastName}
//             </h1>

//             <div className="grid gap-2">
//                 <ProfileRow label="Email" value={email} />
//                 <ProfileRow label="Student #" value={studentNumber.toString()} />
//                 <ProfileRow label="Program" value={program} />
//                 <ProfileRow label="Enrollment Year" value={enrollmentYear.toString()} />
//                 <ProfileRow label="School Year" value={schoolYear.toString()} />
//                 <ProfileRow label="Joined" value={formatDateForDisplay(createdAt)} />
//             </div>
//         </section>
//     );
// }

// function SectionSection({ section, className = "" }: { section?: Section; className?: string }) {
//     return (
//         <section className={className}>
//             <h2 className="text-xl font-semibold mb-2">Courses</h2>

//             {section ? (
//                 <div className="grid gap-3">
//                     {[section].map((course) => (
//                         <SectionCard key={sectionKey(course)} section={course} />
//                     ))}
//                 </div>
//             ) : (
//                 <div className="p-4 text-slate-400 italic border border-dashed border-slate-200 rounded-lg">
//                     No courses to display
//                 </div>
//             )}
//         </section>
//     );
// }

// function SectionCard({ section }: { section: Section }) {
//     return (
//         <div
//             className="rounded-lg border border-slate-200 p-4 space-y-1 bg-slate-50"
//         >
//             <h3 className="font-medium">{section.name}</h3>
//             <p>{`${section.deptCode} ${section.courseNum} ${section.section}`}</p>
//             <p className="text-slate-600">{section.term}</p>
//         </div>
//     );
// }

// function sectionKey(section: Section) {
//     return `${section.deptCode}-${section.courseNum}-${section.section}`;
// }

// function ProfileRow({ label, value }: { label: string; value: string }) {
//     return (
//         <p className="flex justify-between rounded-lg bg-slate-50 px-3 py-1 text-sm">
//             <span className="font-medium text-slate-700 mr-1">{label}:</span>
//             <span className="text-slate-900"> {value}</span>
//         </p>
//     );
// }
