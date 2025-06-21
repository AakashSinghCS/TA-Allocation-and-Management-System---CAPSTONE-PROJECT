import type { ReactNode } from 'react';
import type User from '../../../../interfaces/user/User';
import formatDateForDisplay from "../../../../utility/formatdatefordisplay/formatDateForDisplay";
import { Link } from 'react-router-dom';

export interface ProfileSectionProps<T extends User> {
  user: T;
  profileFields: (keyof T)[];
  fieldLabels: Record<keyof T, string>;
  className?: string;
  big?: boolean;
}

type ProfileDetail = { label: string; value: string };

export default function ProfileSection<T extends User>({
  user,
  profileFields,
  fieldLabels,
  className = '',
  big = true,
}: ProfileSectionProps<T>) {
  if (!user) return null;
  const profileDetails = createProfileDetails<T>(user, profileFields, fieldLabels);

  // Header: large title or link based on 'big'
  const header = big ? (
    <h1 className="text-xl font-bold mb-4 break-words">
      {user.firstName} {user.lastName}
    </h1>
  ) : (
    <div className="text-md font-semibold  break-words">
      <Link
        to="/"
        className="hover:text-blue-600"
        title="Go to student's profile page"
      >
        {user.firstName} {user.lastName}
      </Link>
    </div>
  );

  const gridChange = big ? "" : "grid";
  const flexChange = big ? "" : "flex-row";
     const containerClass = big
    ? "flex flex-col space-y-2"
   : "grid grid-cols-2 gap-2";

  return (
    <section
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4 ${className} ${gridChange}`}
    >
      {header}
      
      <div className={containerClass}>
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
  big
}: {
  label: string;
  value: ReactNode;
  big: boolean;
}) {
  const textSize = big ? "text-md" : "text-xs";

 
    // <div>
    //   {big ? <div data-testid={`profile-row-${label}`} className={textSize + " flex items-center rounded-lg bg-slate-50 px-3 py-1 text-slate-900"}>
    //     <span className="font-medium text-slate-700 whitespace-nowrap">
    //       {label}:
    //     </span>
    //     <span className="ml-2">{value}</span>
    //   </div> :
    //     <div data-testid={`profile-row-${label}`} className={textSize + " flex items-center rounded-lg bg-slate-50 px-3 py-1 text-slate-900"}>
    //       <span className="font-medium text-slate-700 whitespace-nowrap">
    //         {label}:
    //       </span>
    //       <span className="ml-2">{value}</span>
    //     </div>
    //   }
    // </div>
    return(
    <div data-testid={`profile-row-${label}`} className={textSize + " flex items-center rounded-lg bg-slate-50 px-3 py-1 text-slate-900"}>
          <span className="font-medium text-slate-700 break-words">
            {label}:
          </span>
          <span className="ml-2">{value}</span>
        </div>
  );
}

export function createProfileDetails<T extends User>(
  user: T,
  fields: (keyof T)[],
  labels: Record<keyof T, string>
): ProfileDetail[] {
  return fields.reduce<ProfileDetail[]>((acc, key) => {
    const val = user[key];
    if (val == null) return acc;
    const formatted =
      val instanceof Date ? formatDateForDisplay(val) : String(val);
    acc.push({ label: labels[key], value: formatted });
    return acc;
  }, []);
}
