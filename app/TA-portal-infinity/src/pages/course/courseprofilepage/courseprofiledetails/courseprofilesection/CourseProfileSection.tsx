import { type ReactNode } from 'react';
import type { Course, CourseProfile } from '../../../../../interfaces/course/Course';

export interface ProfileSectionProps {
  course: Course | null;
  profileFields: (keyof CourseProfile)[];
  fieldLabels: Record<keyof CourseProfile, string>;
  className?: string;
  isCoordinator: boolean;
}

type ProfileDetail = { label: string; value: ReactNode };

export default function CourseProfileSection({
  course,
  profileFields,
  fieldLabels,
  className = '',
  isCoordinator,
}: ProfileSectionProps) {
  if (!course) return null;

  const dto = course || {};
  const profileDetails: ProfileDetail[] = createProfileDetails(course, profileFields, fieldLabels);

  const layoutClass = 'flex flex-col space-y-2';

  return (
    <>
      <section className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4 ${className}`}>
          <h1 className="text-xl font-bold mb-4 break-words">
            {dto.deptCode} {dto.courseNum}{' '}
            — {dto.name}
          </h1>
        <div className={layoutClass}>
          {profileDetails.map(({ label, value }) => (
            <div
              key={label}
              data-testid={`profile-row-${label}`}
              className={`test-md flex items-center rounded-lg bg-slate-50 px-3 py-1 text-slate-900`}
            >
              <span className="font-medium text-slate-700 break-words">{label}:</span>
              <span className="ml-2 break-words">{value}</span>
            </div>
          ))}
        </div>
      </section>
      
    </>
  );
}

export function createProfileDetails(
  course: Course,
  fields: (keyof CourseProfile)[],
  labels: Record<keyof CourseProfile, string>
): ProfileDetail[] {
  const dto = course || {};
  return fields.reduce<ProfileDetail[]>((acc, key) => {
    const val = dto[key];
    if (val == null) return acc;
    acc.push({ label: labels[key], value: String(val) });
    return acc;
  }, []);
}
