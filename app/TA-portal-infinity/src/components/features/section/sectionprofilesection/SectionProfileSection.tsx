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
  big?: boolean;
  isCourse?: boolean;
  isCoordinator: boolean;
  onSaveSchedule: (sched: SectionSchedule) => Promise<void>;
}

type ProfileDetail = { label: string; value: ReactNode };

export default function SectionProfileSection({
  section,
  profileFields,
  fieldLabels,
  className = '',
  big = true,
  isCourse = false,
  isCoordinator,
  onSaveSchedule,
}: ProfileSectionProps) {
  if (!section) return null;

  const dto = section.sectionDetails || {};
  const profileDetails: ProfileDetail[] = createProfileDetails(section, profileFields, fieldLabels);
  const [editingSchedule, setEditingSchedule] = useState<SectionSchedule | null>(null);
  const [addingSchedule, setAddingSchedule] = useState(false);
  
  const layoutClass = big ? 'flex flex-col space-y-2' : 'grid grid-cols-2 gap-2';

  return (
    <>
      <section className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-4 ${className}`}>
        {big && (
          <h1 className="text-xl font-bold mb-4 break-words">
            {dto.deptCode} {dto.courseNum}{' '}
            {!isCourse && dto.section}{' '}
            — {dto.name}
          </h1>
        )}
        <div className={layoutClass}>
          {profileDetails.map(({ label, value }) => (
            <div
              key={label}
              data-testid={`profile-row-${label}`}
              className={`${big ? 'text-md' : 'text-xs'} flex items-center rounded-lg bg-slate-50 px-3 py-1 text-slate-900`}
            >
              <span className="font-medium text-slate-700 break-words">{label}:</span>
              <span className="ml-2 break-words">{value}</span>
            </div>
          ))}
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
                    onClick={() => { setEditingSchedule(s); setAddingSchedule(false); }}
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

      {/* Edit/Add Schedule Form */}
      {(editingSchedule !== null || addingSchedule) && (
        <EditSectionSchedule
          initial={editingSchedule || undefined}
          onSave={async sched => {
            await onSaveSchedule(sched);
            setEditingSchedule(null);
            setAddingSchedule(false);
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
  const dto = section.sectionDetails || {};
  return fields.reduce<ProfileDetail[]>((acc, key) => {
    const val = dto[key];
    if (val == null) return acc;
    acc.push({ label: labels[key], value: String(val) });
    return acc;
  }, []);
}
