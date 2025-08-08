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
      <section className={`w-full ${className} px-4 pt-4 pb-8`}>
          <h1 className="text-2xl font-bold mb-8 -mt-6 text-[#040941] break-words">
            {dto.deptCode} {dto.courseNum}{' '}
            — {dto.name}
          </h1>
        <div className={layoutClass}>
          {profileDetails.map(({ label, value }) => (
            <div
              key={label}
              data-testid={`profile-row-${label}`}
              className="flex items-start py-3 px-4 bg-slate-50 rounded-lg mb-3"
            >
              <span className="font-semibold text-slate-700 break-words min-w-32 mr-4">{label}:</span>
              <span className="break-words flex-1">{value}</span>
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
