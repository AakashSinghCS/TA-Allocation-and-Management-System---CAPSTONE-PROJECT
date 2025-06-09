import type { ReactNode } from 'react';
import type User from '../../../interfaces/user/User';
import formatDateForDisplay from "../../../utility/formatdatefordisplay/formatDateForDisplay";

export interface ProfileField {
  label: string;
  value: ReactNode;
}

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

  const profileDetails = createProfileDetails<T>(user, profileFields,fieldLabels);

  return (
    <section className={className}>
      <h1 className="text-3xl font-bold mb-4 text-center md:text-right">
        {user.firstName} {user.lastName}
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
