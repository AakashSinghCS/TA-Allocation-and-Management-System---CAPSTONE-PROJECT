import type { ReactNode } from 'react';
import type User from '../../../interfaces/user/User';
import formatDateForDisplay from "../../../utility/formatdatefordisplay/formatDateForDisplay";

interface ProfileSectionProps<T extends User> {
  user: T;
  profileFields: (keyof T)[]
  fieldLabels: Record<keyof T, string>
  className?: string;
}

type ProfileDetail = { label: string; value: string };

export default function ProfileSection<T extends User>({
  user,
  profileFields,
  fieldLabels,
  className = '',
}: ProfileSectionProps<T>) {
  if (!user) return null;
  const profileDetails = createProfileDetails<T>(user, profileFields, fieldLabels);

  return (
    <section className={className}>
      <h1 className="w-full md:w-auto text-md md:text-xl font-bold md:text-left break-words">
        {user.firstName} {user.lastName}
      </h1>

      <div className="flex flex-row flex-wrap gap-1">
        {profileDetails.map(({ label, value }) => (
          <ProfileRow key={label} label={label} value={value} />
        ))}
      </div>
    </section>
  );
}

function ProfileRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <p className="flex items-center rounded-lg bg-slate-50 px-3 py-1 text-xs text-slate-900">
      <span className="font-medium text-slate-700 whitespace-nowrap ">{label}:</span>
      <span className="ml-1">{value}</span>
    </p>
  );
}

function createProfileDetails<T extends User>(
  user: T,
  fields: (keyof T)[],
  labels: Record<keyof T, string>
): ProfileDetail[] {
  if (!user) return [];

  return fields.reduce<ProfileDetail[]>((acc, key) => {
    const value = user[key];
    if (value == null) return acc;

    const formatted = value instanceof Date
      ? formatDateForDisplay(value)
      : String(value);

    acc.push({ label: labels[key], value: formatted });
    return acc;
  }, []);
}
