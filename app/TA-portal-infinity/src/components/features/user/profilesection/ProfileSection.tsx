import type { ReactNode } from 'react';
import type User from '../../../../interfaces/user/User';
import formatDateForDisplay from "../../../../utility/formatdatefordisplay/formatDateForDisplay";
import { Link } from 'react-router-dom';

export interface ProfileSectionProps<T extends User | null> {
  user: T | null;
  profileFields: (keyof T)[];
  fieldLabels: Record<keyof T, string>;
  className?: string;
  big?: boolean;
}

type ProfileDetail = { label: string; value: string };

// Helper function to get initials from first and last name
function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last;
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion<T extends User>(user: T, profileFields: (keyof T)[]): number {
  // Count non-empty, meaningful fields from the provided profileFields
  const filledFields = profileFields.filter(field => {
    const value = user[field];
    // Consider field filled if it's not null, undefined, or empty string
    return value !== null && value !== undefined && value !== '' && value !== 0;
  });
  
  // Calculate percentage based on available fields
  const completion = profileFields.length > 0 
    ? Math.round((filledFields.length / profileFields.length) * 100)
    : 100; // If no fields to check, consider 100% complete
  
  return Math.min(completion, 100); // Cap at 100%
}

// Helper function to determine user status
function getUserStatus<T extends User>(user: T): { status: string; color: string; bgColor: string } {
  // Simple check: Use the active field
  if ('active' in user && user.active !== undefined) {
    if (user.active === true) {
      return { status: 'Active', color: 'text-green-800', bgColor: 'bg-green-100' };
    } else {
      return { status: 'Inactive', color: 'text-red-800', bgColor: 'bg-red-100' };
    }
  }
  
  // Fallback if active field doesn't exist (shouldn't happen in your system)
  return { status: 'Unknown', color: 'text-gray-800', bgColor: 'bg-gray-100' };
}

// Helper function to calculate years active
function getYearsActive<T extends User>(user: T): number {
  // Try to get creation date from user object
  let creationDate: Date | null = null;
  
  // Check for common date fields
  if ('createdAt' in user && user.createdAt) {
    if (user.createdAt instanceof Date) {
      creationDate = user.createdAt;
    } else if (typeof user.createdAt === 'string') {
      creationDate = new Date(user.createdAt);
    }
  } else if ('enrollmentYear' in user && user.enrollmentYear) {
    // For students, use enrollment year
    const enrollmentYear = Number(user.enrollmentYear);
    if (!isNaN(enrollmentYear)) {
      creationDate = new Date(enrollmentYear, 8, 1); // September 1st of enrollment year
    }
  }
  
  // If no date found, assume they've been active for 1 year as fallback
  if (!creationDate || isNaN(creationDate.getTime())) {
    return 1;
  }
  
  const now = new Date();
  const diffInMs = now.getTime() - creationDate.getTime();
  const diffInYears = diffInMs / (1000 * 60 * 60 * 24 * 365.25);
  
  // Return at least 1 year, rounded to nearest year
  return Math.max(1, Math.round(diffInYears));
}

// Helper function to get active roles count and description
function getActiveRolesInfo<T extends User>(user: T): { count: number; description: string } {
  const roleCount = user.roles?.length || 0;
  
  if (roleCount === 0) {
    return { count: 0, description: 'No Roles' };
  } else if (roleCount === 1) {
    return { count: 1, description: 'Active Role' };
  } else {
    return { count: roleCount, description: 'Active Roles' };
  }
}

export default function ProfileSection<T extends User>({
  user,
  profileFields,
  fieldLabels,
  className = '',
  big = true,
}: ProfileSectionProps<T>) {
  if (!user) return null;
  const profileDetails = createProfileDetails<T>(user, profileFields, fieldLabels);

  const initials = getInitials(user.firstName || '', user.lastName || '');
  const profileCompletion = calculateProfileCompletion(user, profileFields);
  const userStatus = getUserStatus(user);
  const yearsActive = getYearsActive(user);
  const activeRolesInfo = getActiveRolesInfo(user);

  const header = big ? (
    <div className="flex items-center space-x-3 mb-3">
      <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-black font-bold text-3xl shadow-md">
        {initials}
      </div>
      <div>
        <h1 className="text-lg font-bold text-[#040941] break-words">
          {user.firstName} {user.lastName}
        </h1>
        {user.roles && user.roles.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {user.roles.map((role, index) => (
              <span key={index} className="px-2 py-0.5 bg-blue-100 text-[#040941] rounded-full text-xs font-semibold uppercase tracking-wide">
                {role}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className="flex items-center space-x-2 mb-2">
      <div className="w-9 h-9 rounded-full bg-blue-200 flex items-center justify-center text-white font-semibold text-lg shadow-md">
        {initials}
      </div>
      <div className="text-sm font-semibold break-words">
        <Link
          to="/"
          className="hover:text-[#040941] transition-colors text-gray-700"
          title="Go to student's profile page"
        >
          {user.firstName} {user.lastName}
        </Link>
      </div>
    </div>
  );

  const containerClass = big
    ? "space-y-1.5"
    : "grid grid-cols-2 gap-1.5";

  return (
    <section
      className={`bg-white rounded-2xl shadow-md border-t-4 border-[#040941] p-6 pr-6 ${className} hover:shadow-lg transition-shadow duration-200 min-h-[400px]`}
    >
      {header}
      
      {/* separator */}
      <div className="border-t border-gray-500 my-4"></div>

      {/* Profile Details Section */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Profile Information
        </h3>
        <div className={containerClass}>
          {profileDetails.map(({ label, value }) => (
            <ProfileRow key={label} label={label} value={value} big={big} />
          ))}
        </div>
      </div>

      {/* Additional Info Section */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="grid grid-cols-1 gap-3">
          {/* Status Indicator */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                userStatus.status === 'Active' ? 'bg-green-500 animate-pulse' :
                'bg-red-500'
              }`}></div>
              <span className={`text-sm font-medium ${
                userStatus.status === 'Active' ? 'text-green-700' :
                'text-red-700'
              }`}>Status</span>
            </div>
            <span className={`text-sm font-semibold px-2 py-1 rounded-full ${userStatus.color} ${userStatus.bgColor}`}>
              {userStatus.status}
            </span>
          </div>
          
          {/* Profile Completion */}
          <div className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#040941]">Profile Completion</span>
              <span className="text-sm font-semibold text-[#040941]">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  profileCompletion >= 80 ? 'bg-green-600' : 
                  profileCompletion >= 60 ? 'bg-[#040941]' : 
                  profileCompletion >= 40 ? 'bg-amber-600' : 'bg-red-600'
                }`} 
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs text-gray-600">
              {profileCompletion >= 90 ? 'Excellent!' : 
               profileCompletion >= 70 ? 'Almost there!' : 
               profileCompletion >= 50 ? 'Keep going!' : 'Needs attention'}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 bg-gray-50 rounded-lg text-center border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="text-lg font-bold text-[#040941]">
                {yearsActive}
              </div>
              <div className="text-xs text-gray-600">
                {yearsActive === 1 ? 'Year Active' : 'Years Active'}
              </div>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg text-center border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="text-lg font-bold text-[#040941]">
                {activeRolesInfo.count}
              </div>
              <div className="text-xs text-gray-600">{activeRolesInfo.description}</div>
            </div>
          </div>
        </div>
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
  const textSize = big ? "text-sm" : "text-xs";

  // Add icons for different field types
  const getFieldIcon = (label: string) => {
    const iconClass = "w-4 h-4 text-gray-500";
    
    if (label.toLowerCase().includes('email')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    
    if (label.toLowerCase().includes('role')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    }
    
    if (label.toLowerCase().includes('department') || label.toLowerCase().includes('dept')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
    
    if (label.toLowerCase().includes('student') || label.toLowerCase().includes('employee')) {
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      );
    }
    
    // Default icon for other fields
    return (
      <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  return (
    <div data-testid={`profile-row-${label}`} className={`${textSize} flex items-center justify-between rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 text-gray-900 border border-gray-200 hover:border-[#040941]/30 transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center gap-2">
        {getFieldIcon(label)}
        <span className="font-medium text-gray-700 break-words">
          {label}
        </span>
      </div>
      <span className="ml-3 font-semibold text-[#040941] max-w-[60%] text-right break-words">{value}</span>
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
      val instanceof Date
        ? formatDateForDisplay(val)
        // handle ISO strings like "2025-06-24T15:12:01.428504"
        : (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val))
            ? formatDateForDisplay(new Date(val))
            : String(val);
    acc.push({ label: labels[key], value: formatted });
    return acc;
  }, []);
}
