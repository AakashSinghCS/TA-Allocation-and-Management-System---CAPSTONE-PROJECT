import { useEffect, useState } from "react";
import type { Allocation, AllocationType } from "../../../../../interfaces/allocation/Allocation";
import type { ApplicationDto } from "../../../../../interfaces/application/Application";
import type Section from "../../../../../interfaces/section/Section";
import { getTaskLabel } from "../../../../../utility/calendar/gettasklabels/getTaskLabel";
import { fetchSectionIncludeInstructorId } from "../../../../../api/section/fetchSectionIncludeInstructorId";
import type { ApplicationStatus } from "../../../../../interfaces/enum/ApplicationStatus";


interface SelectedApplicationDetailsProps {
  selApp: ApplicationDto;
  history: Allocation | null;
}

export default function SelectedApplicationDetails({ selApp, history }: SelectedApplicationDetailsProps) {
  const [sections, setSections] = useState<Record<number, Section>>({});

  useEffect(() => {
    if (!history) return;
    const ids = Array.from(new Set(history.allocatedSections?.map(a => a.sectionId)));
    Promise.all(
      ids.map(async id => [id, await fetchSectionIncludeInstructorId(id)] as [number, Section | null])
    ).then(pairs => {
      const map: Record<number, Section> = {};
      pairs.forEach(([id, sec]) => {
        if (sec) map[id] = sec;
      });
      setSections(map);
    });
  }, [history]);

  const entries = history?.allocatedSections?.map(slice => ({
    id: slice.id,
    sectionId: slice.sectionId,
    task: slice.task as AllocationType,
    hours: slice.hours,
    timeSubmitted: history.application?.timeSubmitted,
    status: history.status as ApplicationStatus,
  }));

  return (
    <div className="mt-6 border-t pt-4 space-y-6 text-sm">
      {/* Applicant Details */}
      <section>
        <h2 className="font-bold text-lg">Applicant Details</h2>
        <div className="space-y-1 pl-2">
          <p><strong>Name:</strong> {selApp.student.firstName} {selApp.student.lastName}</p>
          <p><strong>User ID:</strong> {selApp.student.id}</p>
          <p><strong>Student Number:</strong> {selApp.student.studentNum || 'N/A'}</p>
        </div>
      </section>

      {/* Application Details */}
      <section>
        <h2 className="font-bold text-lg">Application Details</h2>
        <div className="space-y-1 pl-2">
          <p><strong>Preferences:</strong> {selApp.preferences.join(', ')}</p>
          <p><strong>Remote?</strong> {selApp.wantRemote ? 'Yes' : 'No'}</p>
          <p><strong>Desired Hours:</strong> {selApp.wantWorkingHours}</p>
          <p><strong>Submitted:</strong> {new Date(selApp.timeSubmitted).toLocaleString()}</p>
        </div>
      </section>

      <section>
        <h2 className="font-bold text-lg">Unavailabilities</h2>
        <ul className="list-disc pl-4 space-y-1">
          {selApp.unavailabilities.map((a, i) => (
            <li key={i}>{a.day}: {a.startTime} – {a.endTime}</li>
          ))}
        </ul>
      </section>

      {/* Allocation History */}
      <section>
        <h2 className="font-bold text-lg">Allocation History</h2>
        {history ? (
          <ul className="list-disc pl-4 space-y-1 text-sm">
            {entries?.map(entry => {
              const sec = sections[entry.sectionId];
              const sectionText = sec
                ? `${sec.course?.deptCode} ${sec.course?.courseNum} ${sec.section}`
                : 'Loading section...';
              const statusText = entry.status
                ? entry.status.charAt(0) + entry.status.slice(1).toLowerCase()
                : 'Unknown';

              return (
                <li key={entry.id} className="space-y-1">
                  <div>
                    <strong>Date:</strong> {new Date(entry.timeSubmitted ?? "N/A").toLocaleString()}
                  </div>
                  <div>
                    <strong>Task:</strong> {getTaskLabel(entry.task)}, {entry.hours}h
                  </div>
                  <div>
                    <strong>Status:</strong> {statusText}
                  </div>
                  <div>
                    <strong>Course:</strong> {sectionText}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No previous allocations</p>
        )}
      </section>
    </div>
  );
}