import type { ReactNode } from 'react';

export interface ProfileField {
  label: string;
  value: ReactNode;
}

interface ProfileSectionProps {
  name: string;
  profileDetails: ProfileField[];
  className?: string;
}

export default function ProfileSection({
  name,
  profileDetails,
  className = '',
}: ProfileSectionProps) {
  return (
    <section className={className}>
      <h1 className="text-3xl font-bold mb-4 text-center md:text-right">
        {name}
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
