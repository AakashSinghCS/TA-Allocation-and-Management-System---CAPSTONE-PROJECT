import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SectionProfile } from '../../../../interfaces/section/Section';

export interface ProfileSectionProps {
  section: SectionProfile | null;
  profileFields: (keyof SectionProfile)[];
  fieldLabels: Record<keyof SectionProfile, string>;
  className?: string;
  big?: boolean;
  isCourse?: boolean;
}

type ProfileDetail = { label: string; value: ReactNode };

export default function SectionProfileSection({
  section,
  profileFields,
  fieldLabels,
  className = '',
  big = true,
  isCourse = false,
}: ProfileSectionProps) {
  if (!section) return null;

  const profileDetails = createProfileDetails(section, profileFields, fieldLabels);

  const header = big ? (
    <h1 className="text-xl font-bold mb-4 break-words">
      {section.deptCode} {section.courseNum}{' '}
      {isCourse ? '' : section.section}{' '}
      — {section.name}
    </h1>
  ) : (
    <div className="text-md font-semibold break-words">
      <Link to="/" className="hover:text-blue-600" title="Go to course page">
        {section.deptCode} {section.courseNum}{' '}
        {isCourse ? '' : section.section}
      </Link>
    </div>
  );

  const layoutClass = big ? 'flex flex-col space-y-2' : 'grid grid-cols-2 gap-2';

  return (
    <section className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4 ${className}`}>
      {header}
      <div className={layoutClass}>
        {profileDetails.map(({ label, value }) => (
          <ProfileRow key={label} label={label} value={value} big={big} />
        ))}
      </div>
    </section>
  );
}

export function ProfileRow({
  label,
  value,
  big,
}: {
  label: string;
  value: ReactNode;
  big: boolean;
}) {
  const textSize = big ? 'text-md' : 'text-xs';
  return (
    <div
      data-testid={`profile-row-${label}`}
      className={`${textSize} flex items-center rounded-lg bg-slate-50 px-3 py-1 text-slate-900`}
    >
      <span className="font-medium text-slate-700 break-words">{label}:</span>
      <span className="ml-2 break-words">{value}</span>
    </div>
  );
}

export function createProfileDetails(
  section: SectionProfile,
  fields: (keyof SectionProfile)[],
  labels: Record<keyof SectionProfile, string>
): ProfileDetail[] {
  return fields.reduce<ProfileDetail[]>((acc, key) => {
    const val = section[key];
    if (val === undefined || val === null) return acc;
    acc.push({ label: labels[key], value: String(val) });
    return acc;
  }, []);
}
