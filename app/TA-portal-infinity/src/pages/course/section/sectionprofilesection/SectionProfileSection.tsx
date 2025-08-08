import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { SectionProfile } from '../../../../interfaces/section/Section';
import type Section from '../../../../interfaces/section/Section';
import type SectionSchedule from '../../../../interfaces/section/SectionSchedule';
import EditSectionSchedule from '../editsectionschedule/EditSectionSchedule';
import { X, Pencil } from 'lucide-react';
export interface ProfileSectionProps {
  section: Section | null;
  profileFields: (keyof SectionProfile)[];
  fieldLabels: Record<keyof SectionProfile, string>;
  className?: string;
  isCourse?: boolean;
  isCoordinator: boolean;
  onSaveSchedule: (sched: SectionSchedule, isUpdate: boolean) => Promise<boolean>;
  onDeleteSchedule: (id: number) => Promise<boolean>;
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
  onDeleteSchedule
}: ProfileSectionProps) {
  if (!section) return null;

  const dto = section || {};
  const profileDetails: ProfileDetail[] = createProfileDetails(section, profileFields, fieldLabels);
  const [editingSchedule, setEditingSchedule] = useState<SectionSchedule | null>(null);
  const [addingSchedule, setAddingSchedule] = useState(false);

  const layoutClass = 'flex flex-col space-y-2';

  const sortedSchedule = [...(section.sectionSchedule ?? [])]
  .sort((a, b) => {
    const dayOrder = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    if(!a.day || !b.day || !a.startTime || !b.startTime) return 1;

    const d = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
    return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
  });
  return (
    <>
      <section className={`w-full ${className} px-4 pt-4 pb-8`}> 
          <h1 className="text-2xl font-bold mb-8 -mt-6 text-[#040941] break-words">
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
              className="flex items-start py-3 px-4 bg-slate-50 rounded-lg mb-3"
            >
              <span className="font-semibold text-slate-700 break-words min-w-32 mr-4">{label}:</span>
              <span className="break-words flex-1">{value}</span>
            </div>
          ))}
          <div
            key={"instructor"}
            data-testid={`profile-row-instructor`}
            className="flex items-start py-3 px-4 bg-slate-50 rounded-lg mb-3"
          >
            <span className="font-semibold text-slate-700 break-words min-w-32 mr-4">Instructor:</span>
            <span className="break-words flex-1">
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
            {sortedSchedule.map((s, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded"
              >
                <span>{s.day} {s.startTime}–{s.endTime}</span>
                {isCoordinator && (
                  <div className="flex items-center gap-3">
                    
                    <button
                      aria-label="Update Schedule"
                      onClick={() => { setEditingSchedule(null); setEditingSchedule(s); setAddingSchedule(false); }}
                      className="p-1 rounded hover:bg-[#c7fcec]"
                      title="Update"
                    >
                      <Pencil className="w-4 h-4 text-[#00c89c]" />
                    </button>
                    <button
                      aria-label="Delete Schedule"
                      onClick={() => onDeleteSchedule(s.id!)}
                      className="p-1 rounded hover:bg-red-50"
                    >
                        <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
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

