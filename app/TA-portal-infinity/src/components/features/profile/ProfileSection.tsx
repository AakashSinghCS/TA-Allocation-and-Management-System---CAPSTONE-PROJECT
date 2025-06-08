import type { ReactNode } from 'react';
import type Student from '../../../interfaces/student/Student';
import formatDateForDisplay from "../../../utility/formatdatefordisplay/formatDateForDisplay";

export interface ProfileField {
  label: string;
  value: ReactNode;
}

interface ProfileSectionProps {
  student?: Student
  className?: string;
}

export default function ProfileSection({
  student,
  className = '',
}: ProfileSectionProps) {
  const profileDetails =  student ? [
    { label: "Email", value: student?.email },
    { label: "Student #", value: student?.studentNumber.toString() },
    { label: "Program", value: student?.program },
    { label: "Enrollment Year", value: student?.enrollmentYear.toString() },
    { label: "School Year", value: student?.schoolYear.toString() },
    { label: "Joined", value: formatDateForDisplay(student?.createdAt) },
  ] :[];

  return (
    <section className={className}>
      <h1 className="text-3xl font-bold mb-4 text-center md:text-right">
        {student?.firstName} {student?.lastName}
      </h1>

      <div className="grid gap-2">
        {profileDetails.map(({ label, value }) => (
          <ProfileRow key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function ProfileRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <p className="flex justify-between rounded-lg bg-slate-50 px-3 py-1 text-sm">
      <span className="font-medium text-slate-700 mr-1">{label}:</span>
      <span className="text-slate-900">{value}</span>
    </p>
  );
}
