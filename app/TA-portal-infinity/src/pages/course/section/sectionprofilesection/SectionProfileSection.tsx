import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SectionProfile } from '../../../../interfaces/section/Section';
import type Section from '../../../../interfaces/section/Section';
import type SectionSchedule from '../../../../interfaces/section/SectionSchedule';
import EditSectionSchedule from '../editsectionschedule/EditSectionSchedule';

export interface ProfileSectionProps {
  section: Section | null;
  profileFields: (keyof SectionProfile)[];
  fieldLabels: Record<keyof SectionProfile, string>;
  className?: string;
  isCourse?: boolean;
  isCoordinator: boolean;
  onSaveSchedule: (sched: SectionSchedule, isUpdate: boolean) => Promise<boolean>;
}

type ProfileDetail = { label: string; value: ReactNode };

export default function SectionProfileSection({
  section,
  profileFields,
  fieldLabels,
  className = '',
  isCourse = false,
  isCoordinator,
  onSaveSchedule,
}: ProfileSectionProps) {
  if (!section) return null;

  const dto = section || {};
  const profileDetails: ProfileDetail[] = createProfileDetails(section, profileFields, fieldLabels);
  const [editingSchedule, setEditingSchedule] = useState<SectionSchedule | null>(null);
  const [addingSchedule, setAddingSchedule] = useState(false);

  const layoutClass = 'flex flex-col space-y-2';

  return (
    <>
      <section className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4 ${className}`}>
          <h1 className="text-xl font-bold mb-4 break-words">
            <Link to={`/user/courseprofile/${dto.course?.id}`} className="hover:text-blue-600">
            {dto.course?.deptCode} {dto.course?.courseNum}{' '}
            {!isCourse && dto.section}{' '}
            — {dto.course?.name}
            </Link>
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
          <div
            key={"instructor"}
            data-testid={`profile-row-instructor`}
            className={`test-md flex items-center rounded-lg bg-slate-50 px-3 py-1 text-slate-900`}
          >
            <span className="font-medium text-slate-700 break-words">Instructor:</span>
            <span className="ml-2 break-words">
              <Link to={`/user/profile/${section.instructor?.id}`} className="hover:text-blue-600">
                {section.instructor?.firstName} {section.instructor?.lastName}
              </Link>
            </span>
          </div>
        </div>

        {/* Schedule List */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Schedule</h2>
          <ul className="space-y-1">
            {section.sectionSchedule?.map((s, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded"
              >
                <span>{s.day} {s.startTime}–{s.endTime}</span>
                {isCoordinator && (
                  <button
                    onClick={() => { setEditingSchedule(null); setEditingSchedule(s); setAddingSchedule(false); }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Update Schedule
                  </button>
                )}
              </li>
            )) || (
                <li className="text-sm text-slate-500">No schedule yet.</li>
              )}
          </ul>
          {isCoordinator && (
            <button
              onClick={() => { setAddingSchedule(true); setEditingSchedule(null); }}
              className="mt-2 text-sm text-green-600 hover:underline"
            >
              + Add Schedule
            </button>
          )}
        </div>
      </section>

      {(editingSchedule !== null || addingSchedule) && (
        <EditSectionSchedule
          initial={editingSchedule || undefined}
          onSave={async sched => {
            setEditingSchedule(null);
            setAddingSchedule(false);
            return onSaveSchedule(sched, editingSchedule !== null);
          }}
          onCancel={() => { setEditingSchedule(null); setAddingSchedule(false); }}
        />
      )}
    </>
  );
}

export function createProfileDetails(
  section: Section,
  fields: (keyof SectionProfile)[],
  labels: Record<keyof SectionProfile, string>
): ProfileDetail[] {
  const dto = section || {};
  return fields.reduce<ProfileDetail[]>((acc, key) => {
    const val = dto[key];
    if (val == null) return acc;
    acc.push({ label: labels[key], value: String(val) });
    return acc;
  }, []);
}
